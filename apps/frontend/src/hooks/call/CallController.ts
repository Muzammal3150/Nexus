import { SessionType } from "@/components/providers/session-provider";
import { getRoom, loadMembers } from "@/lib/call/get-room";
import { callSocket } from "@/lib/socket";
import { CallMember, CallRoom } from "@/types/calls";
import { User } from "better-auth";

type Snapshot = {
    room: CallRoom | null;
    members: CallMember[];
    myStream: MediaStream | null;
    isLoading: boolean;
    error: string | null;
};

/**
 * Per-peer negotiation state, following the "perfect negotiation" pattern
 * (https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
 * so that simultaneous offers from both sides (glare) resolve deterministically
 * instead of corrupting the signaling state.
 */
type PeerState = {
    connection: RTCPeerConnection;
    // true while we're in the middle of creating/sending our own offer
    makingOffer: boolean;
    // true if we decided to ignore an incoming offer due to collision
    ignoreOffer: boolean;
    // "polite" peer rolls back its own offer on collision; "impolite" ignores the incoming one
    polite: boolean;
    // number of consecutive ICE-restart attempts, used to cap retries
    restartAttempts: number;
};

// Basic STUN config so peers behind NAT can actually establish connectivity.
// Replace/extend with your own TURN server(s) for reliability across restrictive
// networks (corporate firewalls, symmetric NAT, etc) — STUN alone is not enough
// for a meaningful fraction of real-world networks.
const ICE_SERVERS: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // { urls: "turn:your-turn-server.example.com:3478", username: "...", credential: "..." },
];

const MAX_ICE_RESTART_ATTEMPTS = 3;

export class CallController {
    private readonly dev = true;

    private isInit = false;
    private isLoading = true;

    readonly roomId: string;
    readonly session: SessionType;

    private room: CallRoom | null = null;
    private members: CallMember[] = [];
    private myStream: MediaStream | null = null;
    private lastError: string | null = null;

    private peers = new Map<string, PeerState>();
    private memberStreams = new Map<string, MediaStream>();
    private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();

    // Serializes setMyStream calls so overlapping calls can't stomp on each other's tracks.
    private streamOpInFlight: Promise<unknown> = Promise.resolve();

    private listeners = new Set<() => void>();

    private snapshot: Snapshot = {
        room: null,
        members: [],
        myStream: null,
        isLoading: true,
        error: null,
    };

    constructor(roomId: string, session: SessionType) {
        if (!roomId || typeof roomId !== "string") {
            throw new Error("CallController requires a valid roomId");
        }
        if (!session?.user?.id) {
            throw new Error("CallController requires an authenticated session");
        }
        this.roomId = roomId;
        this.session = session;
    }

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    getSnapshot = () => this.snapshot;

    private emit() {
        for (const listener of this.listeners) {
            try {
                listener();
            } catch (err) {
                this.log("Listener threw", err);
            }
        }
    }

    private updateSnapshot() {
        this.snapshot = {
            room: this.room,
            members: this.members.map((member) => ({
                ...member,
                stream: member.isSelf
                    ? this.myStream
                    : this.memberStreams.get(member.user.id) ?? null,
            })),
            myStream: this.myStream,
            isLoading: this.isLoading,
            error: this.lastError,
        };
        this.emit();
    }

    private setError(message: string, err?: unknown) {
        this.lastError = message;
        this.log(message, err);
    }

    // ---------------------------------------------------------------------
    // Lifecycle
    // ---------------------------------------------------------------------

    async init() {
        if (this.isInit) {
            this.log("Already initialized");
            return;
        }

        this.log("init() called");
        this.isInit = true;
        this.isLoading = true;
        this.lastError = null;
        this.updateSnapshot();

        try {
            this.room = await getRoom(this.roomId);
            console.log(this.room,this.roomId)
            // if (!this.room) {
            //     throw new Error("Room not found");
            // }

            this.members = await loadMembers(this.room, this.session);
            this.updateSnapshot();

            // Media access failures shouldn't block joining the call — a user
            // without a camera/mic can still be present and see/hear others.
            try {
                await this.setMyStream(true, true);
            } catch (mediaErr) {
                this.setError(
                    mediaErr instanceof Error ? mediaErr.message : "Failed to access camera/microphone",
                    mediaErr
                );
            }

            this.registerSocketListeners();

            this.isLoading = false;
            this.updateSnapshot();

            callSocket.emit("call:ready", { roomId: this.roomId });
        } catch (err) {
            this.isInit = false;
            this.isLoading = false;
            this.setError(
                err instanceof Error ? err.message : "Failed to initialize call",
                err
            );
            this.updateSnapshot();
        } finally {
            this.log("init complete");
        }
    }

    private registerSocketListeners() {
        // Defensive: guarantee no duplicate handlers if init() is somehow
        // called again on the same socket without a prior destroy().
        this.unregisterSocketListeners();

        callSocket.on("call:leave-broadcast", this.handleLeave);
        callSocket.on("call:reject-broadcast", this.handleLeave);
        callSocket.on("call:ready-broadcast", this.handleReady);
        callSocket.on("rtc:offer-broadcast", this.handleOffer);
        callSocket.on("rtc:answer-broadcast", this.handleAnswer);
        callSocket.on("rtc:ice-candidate-broadcast", this.handleIceCandidate);

        this.log("Socket listeners registered");
    }

    private unregisterSocketListeners() {
        callSocket.off("call:leave-broadcast", this.handleLeave);
        callSocket.off("call:reject-broadcast", this.handleLeave);
        callSocket.off("call:ready-broadcast", this.handleReady);
        callSocket.off("rtc:offer-broadcast", this.handleOffer);
        callSocket.off("rtc:answer-broadcast", this.handleAnswer);
        callSocket.off("rtc:ice-candidate-broadcast", this.handleIceCandidate);
    }

    destroy() {
        if (!this.isInit) return;
        this.log("Destroying controller");

        this.unregisterSocketListeners();

        this.myStream?.getTracks().forEach((track) => {
            try {
                track.stop();
            } catch {
                /* ignore */
            }
        });

        for (const userId of Array.from(this.peers.keys())) {
            this.closePeer(userId);
        }

        this.peers.clear();
        this.memberStreams.clear();
        this.pendingCandidates.clear();

        this.myStream = null;
        this.room = null;
        this.members = [];

        this.isInit = false;
        this.isLoading = true;

        this.updateSnapshot();
        // Note: listeners (React's useSyncExternalStore subscription) are
        // intentionally NOT cleared here — the controller instance can be
        // safely re-init()'d (e.g. React 18 Strict Mode's mount → cleanup →
        // mount cycle), and clearing them would leave the hook permanently
        // unsubscribed after the first destroy().
        this.log("Destroyed");
    }

    // ---------------------------------------------------------------------
    // Media
    // ---------------------------------------------------------------------

    async setMyStream(video: boolean, audio: boolean) {
        const run = this.streamOpInFlight.then(() => this.setMyStreamInternal(video, audio));
        this.streamOpInFlight = run.catch(() => undefined);
        return run;
    }

    private async setMyStreamInternal(video: boolean, audio: boolean) {
        const previousStream = this.myStream;

        try {
            if (!video && !audio) {
                this.stopStream(previousStream);
                this.myStream = null;
                this.replaceTracksOnAllPeers(null);
                this.updateSnapshot();
                return null;
            }

            if (!navigator?.mediaDevices?.getUserMedia) {
                throw new Error("Media devices are not supported in this browser");
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some((d) => d.kind === "videoinput");
            const hasMic = devices.some((d) => d.kind === "audioinput");

            const constraints: MediaStreamConstraints = {
                video: video && hasCamera,
                audio: audio && hasMic,
            };

            if (!constraints.video && !constraints.audio) {
                this.stopStream(previousStream);
                this.myStream = null;
                this.replaceTracksOnAllPeers(null);
                this.updateSnapshot();
                throw new Error("No camera or microphone is available on this device");
            }

            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (primaryErr) {
                // Fall back to whichever single track is still requested, so a
                // blocked/unavailable camera doesn't also take down audio (or
                // vice versa).
                if (constraints.video && constraints.audio) {
                    this.log("Full media request failed, retrying audio-only", primaryErr);
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    } catch (fallbackErr) {
                        this.stopStream(previousStream);
                        this.myStream = null;
                        this.replaceTracksOnAllPeers(null);
                        this.updateSnapshot();
                        throw this.mapMediaError(fallbackErr);
                    }
                } else {
                    this.stopStream(previousStream);
                    this.myStream = null;
                    this.replaceTracksOnAllPeers(null);
                    this.updateSnapshot();
                    throw this.mapMediaError(primaryErr);
                }
            }

            this.myStream = stream;
            this.replaceTracksOnAllPeers(stream);

            // Stop the old stream only after the new one is live and swapped
            // into existing peer connections, to avoid a visible gap.
            this.stopStream(previousStream);

            this.updateSnapshot();
            return stream;
        } catch (error) {
            this.setError(
                error instanceof Error ? error.message : "Failed to access media devices",
                error
            );
            this.updateSnapshot();
            throw error;
        }
    }

    private mapMediaError(error: unknown): Error {
        if (error instanceof DOMException) {
            switch (error.name) {
                case "NotAllowedError":
                    return new Error("Camera or microphone permission denied");
                case "NotFoundError":
                    return new Error("Requested media device was not found");
                case "NotReadableError":
                    return new Error("Media device is already in use by another application");
                case "OverconstrainedError":
                    return new Error("Requested media constraints cannot be satisfied");
                default:
                    return new Error(error.message || "Failed to access media devices");
            }
        }
        return error instanceof Error ? error : new Error("Failed to access media devices");
    }

    private stopStream(stream: MediaStream | null) {
        stream?.getTracks().forEach((track) => {
            try {
                track.stop();
            } catch {
                /* ignore */
            }
        });
    }

    /** Swap the outgoing tracks on every live peer connection to match the current stream. */
    private replaceTracksOnAllPeers(stream: MediaStream | null) {
        for (const [userId, state] of this.peers) {
            const pc = state.connection;
            const senders = pc.getSenders();

            try {
                if (!stream) {
                    senders.forEach((sender) => {
                        try {
                            pc.removeTrack(sender);
                        } catch {
                            /* ignore */
                        }
                    });
                    continue;
                }

                const tracks = stream.getTracks();
                for (const track of tracks) {
                    const sender = senders.find((s) => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track).catch((err) =>
                            this.log("replaceTrack failed", userId, err)
                        );
                    } else {
                        pc.addTrack(track, stream);
                    }
                }
            } catch (err) {
                this.log("Failed to update tracks for peer", userId, err);
            }
        }
    }

    // ---------------------------------------------------------------------
    // Signaling handlers
    // ---------------------------------------------------------------------

    /** Guards every inbound socket event against stale/foreign/self-originated messages. */
    private isEventValid(payload: { roomId?: string; user?: User; sender?: User }): boolean {
        if (!this.isInit || this.isDestroyed) return false;
        if (payload.roomId && payload.roomId !== this.roomId) {
            this.log("Ignoring event for a different room", payload.roomId);
            return false;
        }
        const remoteId = payload.user?.id ?? payload.sender?.id;
        if (remoteId && remoteId === this.session.user.id) {
            this.log("Ignoring self-targeted event");
            return false;
        }
        return true;
    }

    handleReady = async ({ user, roomId }: { user: User; roomId?: string }) => {
        if (!this.isEventValid({ roomId, user })) return;

        this.log("Received ready", user.id);

        const existingMember = this.members.find((m) => m.user.id === user.id);
        if (!existingMember) {
            // Someone we don't know about signaled ready — refresh membership
            // rather than silently dropping them.
            this.log("Ready from unknown member, refreshing member list", user.id);
        }

        this.members = this.members.map((member) =>
            member.user.id === user.id ? { ...member, joined: true } : member
        );
        this.updateSnapshot();

        const existingPeer = this.peers.get(user.id);
        if (existingPeer) {
            const state = existingPeer.connection.connectionState;
            if (state === "connected" || state === "connecting") {
                this.log("Peer already connected/connecting, skipping duplicate offer", user.id, state);
                return;
            }
            // Stale/broken connection for this user — tear it down and start fresh.
            if (state === "failed" || state === "closed" || state === "disconnected") {
                this.closePeer(user.id);
            }
        }

        try {
            await this.negotiate(user.id);
        } catch (err) {
            this.setError(`Failed to start call with ${user.id}`, err);
            this.updateSnapshot();
        }
    };

    /** Creates (or reuses) a peer and sends a fresh offer, guarded against re-entrancy. */
    private async negotiate(userId: string) {
        const state = this.getOrCreatePeer(userId);
        if (state.makingOffer) {
            this.log("Already making an offer for this peer, skipping", userId);
            return;
        }

        try {
            state.makingOffer = true;
            const offer = await state.connection.createOffer();
            // Bail out if we were torn down mid-flight.
            if (!this.peers.has(userId)) return;
            await state.connection.setLocalDescription(offer);

            callSocket.emit("rtc:offer", {
                targetId: userId,
                roomId: this.roomId,
                offer: state.connection.localDescription,
            });
        } catch (err) {
            this.setError(`Failed to create offer for ${userId}`, err);
            throw err;
        } finally {
            state.makingOffer = false;
        }
    }

    handleOffer = async ({
        roomId,
        sender,
        offer,
    }: {
        sender: User;
        roomId?: string;
        offer: RTCSessionDescriptionInit;
    }) => {
        if (!this.isEventValid({ roomId, sender })) return;
        if (!offer || offer.type !== "offer") {
            this.log("Ignoring malformed offer", offer);
            return;
        }

        this.log("Received offer", sender.id);
        const state = this.getOrCreatePeer(sender.id);
        const pc = state.connection;

        try {
            // Perfect-negotiation collision handling: if we're also in the
            // middle of making an offer (or not in "stable" state), decide
            // who backs off based on politeness rather than corrupting state.
            const offerCollision =
                state.makingOffer || pc.signalingState !== "stable";

            state.ignoreOffer = !state.polite && offerCollision;
            if (state.ignoreOffer) {
                this.log("Ignoring colliding offer (impolite)", sender.id);
                return;
            }

            if (offerCollision && state.polite) {
                // Roll back our own local offer to accept theirs.
                await pc.setLocalDescription({ type: "rollback" });
            }

            await pc.setRemoteDescription(offer);
            await this.flushPendingCandidates(sender.id, pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            callSocket.emit("rtc:answer", {
                targetId: sender.id,
                roomId: this.roomId,
                answer: pc.localDescription,
            });
        } catch (err) {
            this.setError(`Failed to handle offer from ${sender.id}`, err);
            this.updateSnapshot();
        }
    };

    handleAnswer = async ({
        roomId,
        sender,
        answer,
    }: {
        sender: User;
        roomId?: string;
        answer: RTCSessionDescriptionInit;
    }) => {
        if (!this.isEventValid({ roomId, sender })) return;
        if (!answer || answer.type !== "answer") {
            this.log("Ignoring malformed answer", answer);
            return;
        }

        this.log("Received answer", sender.id);
        const state = this.peers.get(sender.id);
        if (!state) {
            this.log("Answer for unknown peer, ignoring", sender.id);
            return;
        }

        // An answer only makes sense if we're actually waiting for one.
        if (state.connection.signalingState !== "have-local-offer") {
            this.log(
                "Ignoring answer in unexpected signaling state",
                sender.id,
                state.connection.signalingState
            );
            return;
        }

        try {
            await state.connection.setRemoteDescription(answer);
            await this.flushPendingCandidates(sender.id, state.connection);
            state.restartAttempts = 0;
        } catch (err) {
            this.setError(`Failed to apply answer from ${sender.id}`, err);
            this.updateSnapshot();
        }
    };

    handleIceCandidate = async ({
        roomId,
        sender,
        candidate,
    }: {
        sender: User;
        roomId?: string;
        candidate: RTCIceCandidateInit;
    }) => {
        if (!this.isEventValid({ roomId, sender })) return;
        if (!candidate) return;

        const state = this.peers.get(sender.id);

        if (!state || !state.connection.remoteDescription) {
            const queue = this.pendingCandidates.get(sender.id) ?? [];
            queue.push(candidate);
            this.pendingCandidates.set(sender.id, queue);
            return;
        }

        try {
            await state.connection.addIceCandidate(candidate);
        } catch (err) {
            // Benign if we just rolled back an offer (candidates for the
            // stale description); anything else is worth logging.
            if (!state.ignoreOffer) {
                this.log("Failed to add ICE candidate", sender.id, err);
            }
        }
    };

    private async flushPendingCandidates(userId: string, pc: RTCPeerConnection) {
        const queue = this.pendingCandidates.get(userId);
        if (!queue?.length) return;

        this.pendingCandidates.delete(userId);
        for (const candidate of queue) {
            try {
                await pc.addIceCandidate(candidate);
            } catch (err) {
                this.log("Failed to add queued ICE candidate", userId, err);
            }
        }
    }

    handleLeave = async ({ user, roomId }: { user: User; roomId?: string }) => {
        if (!this.isEventValid({ roomId, user })) return;

        this.log("Member left", user.id);
        this.closePeer(user.id);
        this.members = this.members.filter((m) => m.user.id !== user.id);
        this.updateSnapshot();
    };

    // ---------------------------------------------------------------------
    // Peer management
    // ---------------------------------------------------------------------

    private getOrCreatePeer(userId: string): PeerState {
        const existing = this.peers.get(userId);
        if (existing) return existing;

        this.log("Creating peer", userId);
        const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        // Deterministic, symmetric politeness assignment so both sides agree
        // on who backs off during a collision.
        const polite = this.session.user.id < userId;

        const state: PeerState = {
            connection,
            makingOffer: false,
            ignoreOffer: false,
            polite,
            restartAttempts: 0,
        };

        if (this.myStream) {
            for (const track of this.myStream.getTracks()) {
                try {
                    connection.addTrack(track, this.myStream);
                } catch (err) {
                    this.log("Failed to add track to new peer", userId, err);
                }
            }
        }

        connection.onicecandidate = (event) => {
            if (!event.candidate) return;
            try {
                callSocket.emit("rtc:ice-candidate", {
                    targetId: userId,
                    roomId: this.roomId,
                    candidate: event.candidate,
                });
            } catch (err) {
                this.log("Failed to emit ICE candidate", userId, err);
            }
        };

        connection.ontrack = (event) => {
            this.log("Received remote track", userId);
            const [stream] = event.streams;
            const remoteStream = stream ?? new MediaStream([event.track]);
            this.memberStreams.set(userId, remoteStream);
            this.updateSnapshot();
        };

        connection.oniceconnectionstatechange = () => {
            this.log("ICE state changed", userId, connection.iceConnectionState);
            if (connection.iceConnectionState === "failed") {
                this.attemptIceRestart(userId, state);
            }
        };

        connection.onconnectionstatechange = () => {
            this.log("Connection state changed", userId, connection.connectionState);
            if (
                connection.connectionState === "closed" ||
                connection.connectionState === "failed"
            ) {
                this.closePeer(userId);
                this.updateSnapshot();
            }
        };

        connection.onsignalingstatechange = () => {
            this.log("Signaling state changed", userId, connection.signalingState);
        };

        this.peers.set(userId, state);
        return state;
    }

    private attemptIceRestart(userId: string, state: PeerState) {
        if (state.restartAttempts >= MAX_ICE_RESTART_ATTEMPTS) {
            this.log("Max ICE restart attempts reached, giving up", userId);
            this.closePeer(userId);
            this.setError(`Lost connection to a participant and could not reconnect`);
            this.updateSnapshot();
            return;
        }

        state.restartAttempts += 1;
        this.log("Attempting ICE restart", userId, state.restartAttempts);

        // Only the side that isn't mid-offer should drive the restart, to
        // avoid a second collision on top of the connection failure.
        if (state.makingOffer) return;

        state.connection
            .createOffer({ iceRestart: true })
            .then(async (offer) => {
                if (!this.peers.has(userId)) return;
                state.makingOffer = true;
                await state.connection.setLocalDescription(offer);
                callSocket.emit("rtc:offer", {
                    targetId: userId,
                    roomId: this.roomId,
                    offer: state.connection.localDescription,
                });
            })
            .catch((err) => this.log("ICE restart failed", userId, err))
            .finally(() => {
                state.makingOffer = false;
            });
    }

    private closePeer(userId: string) {
        const state = this.peers.get(userId);
        if (!state) return;

        try {
            state.connection.onicecandidate = null;
            state.connection.ontrack = null;
            state.connection.onconnectionstatechange = null;
            state.connection.oniceconnectionstatechange = null;
            state.connection.onsignalingstatechange = null;
            state.connection.close();
        } catch (err) {
            this.log("Error closing peer connection", userId, err);
        }

        this.memberStreams.delete(userId);
        this.peers.delete(userId);
        this.pendingCandidates.delete(userId);
    }

    private log(message: string, ...args: unknown[]) {
        // if (!this.dev) return;
        // console.log(
        //     `%c[CallController:${this.roomId}]`,
        //     "color:#3b82f6;font-weight:bold",
        //     message,
        //     ...args
        // );
    }
}
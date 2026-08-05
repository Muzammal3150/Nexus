import { SessionType } from "@/components/auth/session-provider";
import { getRoom, loadMembers } from "@/lib/call/get-room";
import { callSocket } from "@/lib/socket";
import { CallMember, CallRoom } from "@/types/calls";
import { User } from "better-auth";

type Snapshot = {
    room: CallRoom | null;
    members: CallMember[];
    myStream: MediaStream | null;
    memberStreams: Map<string, MediaStream>;
    isLoading: boolean;
};

export class CallController {
    readonly id = crypto.randomUUID();
    private readonly dev = true;

    private isInit = false;
    private isLoading = true;

    readonly roomId: string;
    readonly session: SessionType;

    private room: CallRoom | null = null;
    private members: CallMember[] = [];
    private myStream: MediaStream | null = null;

    private peers = new Map<string, RTCPeerConnection>();
    // Remote media streams keyed by user id, exposed to consumers via the snapshot.
    private memberStreams = new Map<string, MediaStream>();
    // ICE candidates that arrive before we have a remote description set for that peer.
    private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();

    private listeners = new Set<() => void>();

    private snapshot: Snapshot = {
        room: null,
        members: [],
        myStream: null,
        memberStreams: new Map(),
        isLoading: true,
    };

    constructor(roomId: string, session: SessionType) {
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
            listener();
        }
    }

    private updateSnapshot() {
        this.log("Snapshot updated");
        this.snapshot = {
            room: this.room,
            members: this.members,
            myStream: this.myStream,
            // New Map instance so consumers relying on reference-equality (e.g. React) re-render.
            memberStreams: new Map(this.memberStreams),
            isLoading: this.isLoading,
        };

        this.emit();
    }

    async init() {
        if (this.isInit) {
            this.log("Already initialized");
            return
        };
        this.log("init() called");

        this.isInit = true;
        this.isLoading = true;
        this.updateSnapshot();

        try {
            this.room = await getRoom(this.roomId);
            this.members = await loadMembers(this.room, this.session);
            this.updateSnapshot();
            this.myStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            callSocket.removeAllListeners("call:ready-broadcast");
            callSocket.removeAllListeners("rtc:offer-broadcast");
            callSocket.removeAllListeners("rtc:answer-broadcast");
            callSocket.removeAllListeners("rtc:ice-candidate-broadcast");

            callSocket.on("call:ready-broadcast", this.handleReady);

            callSocket.on("rtc:offer-broadcast", this.handleOffer);
            callSocket.on("rtc:answer-broadcast", this.handleAnswer);
            callSocket.on("rtc:ice-candidate-broadcast", this.handleIceCandidate);
            this.log("Socket listeners registered");
            this.isLoading = false;
            this.updateSnapshot();
            callSocket.emit("call:ready", { roomId: this.roomId })


        } catch (err) {
            this.isInit = false;
            this.isLoading = false;
            this.updateSnapshot();
            throw err;
        } finally {
            this.log("inited")
        }
    }

    destroy() {

        if (!this.isInit) return;
        this.log("Destroying controller");

        callSocket.off("call:ready-broadcast", this.handleReady);
        callSocket.off("rtc:offer-broadcast", this.handleOffer);
        callSocket.off("rtc:answer-broadcast", this.handleAnswer);
        callSocket.off("rtc:ice-candidate-broadcast", this.handleIceCandidate);

        this.myStream?.getTracks().forEach(track => track.stop());

        for (const peer of this.peers.values()) {
            peer.close();
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
        this.log("Destroyed");
    }

    handleReady = async ({ user }: { user: User }) => {
        this.log("Received accept", user.id);
        const peer = this.createPeer(user.id);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        callSocket.emit("rtc:offer", {
            targetId: user.id,
            roomId: this.roomId,
            offer,
        });
    };

    handleOffer = async ({
        roomId,
        sender,
        offer,
    }: {
        sender: User;
        roomId: string;
        offer: RTCSessionDescriptionInit;
    }) => {
        this.log("Recieved Offer", offer);
        const peer = this.createPeer(sender.id);

        await peer.setRemoteDescription(offer);
        await this.flushPendingCandidates(sender.id, peer);

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        callSocket.emit("rtc:answer", {
            targetId: sender.id,
            roomId,
            answer,
        });

    };

    handleAnswer = async ({
        sender,
        answer,
    }: {
        sender: User;
        answer: RTCSessionDescriptionInit;
    }) => {
        this.log("Recieved answer", answer);

        const peer = this.peers.get(sender.id);

        if (!peer) return;

        await peer.setRemoteDescription(answer);
        await this.flushPendingCandidates(sender.id, peer);
    };

    handleIceCandidate = async ({
        sender,
        candidate,
    }: {
        sender: User;
        candidate: RTCIceCandidateInit;
    }) => {
        this.log("Recieved ICE candidate", candidate);

        const peer = this.peers.get(sender.id);

        // No peer yet (candidate arrived before the offer/answer created one) — stash it.
        if (!peer || !peer.remoteDescription) {
            const queue = this.pendingCandidates.get(sender.id) ?? [];
            queue.push(candidate);
            this.pendingCandidates.set(sender.id, queue);
            return;
        }

        try {
            await peer.addIceCandidate(candidate);
        } catch (err) {
            this.log("Failed to add ICE candidate", err);
        }
    };

    private async flushPendingCandidates(userId: string, peer: RTCPeerConnection) {
        const queue = this.pendingCandidates.get(userId);
        if (!queue?.length) return;

        this.pendingCandidates.delete(userId);

        for (const candidate of queue) {
            try {
                await peer.addIceCandidate(candidate);
            } catch (err) {
                this.log("Failed to add queued ICE candidate", err);
            }
        }
    }

    private createPeer(userId: string) {
        this.log("Creating peer")
        const existing = this.peers.get(userId);

        if (existing) {
            return existing;
        }

        const peer = new RTCPeerConnection();

        if (this.myStream) {
            for (const track of this.myStream.getTracks()) {
                peer.addTrack(track, this.myStream);
            }
        }

        peer.onicecandidate = (event) => {
            if (!event.candidate) return;

            callSocket.emit("rtc:ice-candidate", {
                targetId: userId,
                roomId: this.roomId,
                candidate: event.candidate,
            });
        };

        peer.ontrack = (event) => {
            this.log("Received remote track", userId);
            const [stream] = event.streams;
            const remoteStream = stream ?? new MediaStream([event.track]);

            this.memberStreams.set(userId, remoteStream);
            this.updateSnapshot();
        };

        peer.onconnectionstatechange = () => {
            this.log("Connection state changed", userId, peer.connectionState);

            if (peer.connectionState === "closed" || peer.connectionState === "failed" || peer.connectionState === "disconnected") {
                this.memberStreams.delete(userId);
                this.peers.delete(userId);
                this.pendingCandidates.delete(userId);
                this.updateSnapshot();
            }
        };

        this.peers.set(userId, peer);

        return peer;
    }
    private log(message: string, ...args: unknown[]) {
        if (!this.dev) return;

        console.log(
            `%c[CallController:${this.roomId}]`,
            "color:#3b82f6;font-weight:bold",
            message,
            ...args
        );
    }
}
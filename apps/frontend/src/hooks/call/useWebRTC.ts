import { callSocket } from "@/lib/socket";
import { useEffect, useRef, useState } from "react";

export function useWebRTC() {
    const peerConnections = useRef(new Map<string, RTCPeerConnection>());
    const remoteStreams = useRef(new Map<string, MediaStream>());
    const [streams, setStreams] = useState<Record<string, MediaStream>>({});
    const localStream = useRef<MediaStream | null>(null);

    useEffect(() => {
        async function initMedia() {
            localStream.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
        }

        initMedia();
    }, []);

    async function createPeer(userId: string, shouldCreateOffer: boolean) {
        if (peerConnections.current.has(userId))
            return;

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnections.current.set(userId, pc);

        localStream.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStream.current!);
        });

        pc.ontrack = e => {
            const stream = e.streams[0];
            remoteStreams.current.set(userId, stream);

            setStreams(prev => ({ ...prev, [userId]: stream }));
        };

        pc.onicecandidate = e => {
            if (!e.candidate) return;

            callSocket.emit("call:ice", {
                to: userId,
                candidate: e.candidate,
            });
        };

        if (shouldCreateOffer) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            callSocket.emit("call:offer", {
                to: userId,
                offer,
            });
        }
    }
    function destroyPeer(userId: string) {
        peerConnections.current.get(userId)?.close();

        peerConnections.current.delete(userId);

        remoteStreams.current.delete(userId);

        setStreams(prev => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
        });
    }

    useEffect(() => {
        const handleICE = async ({ from, candidate }) => {
            const pc = peerConnections.current.get(from);
            if (!pc) return;

            await pc.addIceCandidate(candidate);
        }

        callSocket.on("call:ice", handleICE);

        return () => {

        }
    })

    return {
        // localStream: localStream.current,
        remoteStreams: streams,
        createPeer,
        destroyPeer,
    };
}
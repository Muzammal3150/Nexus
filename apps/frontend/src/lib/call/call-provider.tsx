'use client';

import { callSocket } from '@/lib/socket';
import { createContext, useContext, useEffect, useRef } from 'react';

const CallContext = createContext<{
    peer: RTCPeerConnection | null;
} | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
    const peerRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        callSocket.connect();

        peerRef.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                },
            ],
        });

        function handleJoin() {
            // Create offer if needed
        }

        callSocket.on('call:join-broadcast', handleJoin);

        return () => {
            callSocket.off('call:join-broadcast', handleJoin);

            peerRef.current?.close();
            peerRef.current = null;

            callSocket.disconnect();
        };
    }, []);

    return (
        <CallContext.Provider
            value={{
                peer: peerRef.current,
            }}
        >
            {children}
        </CallContext.Provider>
    );
}

export function useCall() {
    const context = useContext(CallContext);

    if (!context) {
        throw new Error('useCall must be used inside CallProvider');
    }

    return context;
}

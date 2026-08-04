// 'use client';

// import { callSocket } from '@/lib/socket';
// import { User } from 'better-auth';
// import { createContext, useContext, useEffect, useRef } from 'react';

// const CallContext = createContext<{
//     peer: RTCPeerConnection | null;
// } | null>(null);

// export function CallProvider({ children }: { children: React.ReactNode }) {
//     const peerRef = useRef<RTCPeerConnection | null>(null);

//     useEffect(() => {
//         peerRef.current = new RTCPeerConnection({
//             iceServers: [
//                 {
//                     urls: 'stun:stun.l.google.com:19302',
//                 },
//             ],
//         });

//         async function handleAccept({ user }: { user: User }) {
//             const offer = await peerRef?.current?.createOffer();
//             callSocket.emit('call:offer', { userId: user.id, offer });
//             // Create offer if needed
//         }

//         callSocket.on('call:accept-broadcast', handleAccept);

//         return () => {
//             callSocket.off('call:accept-broadcast', handleAccept);

//             peerRef.current?.close();
//             peerRef.current = null;
//         };
//     }, []);

//     return (
//         <CallContext.Provider
//             value={{
//                 peer: peerRef.current,
//             }}
//         >
//             {children}
//         </CallContext.Provider>
//     );
// }

// export function useCall() {
//     const context = useContext(CallContext);

//     if (!context) {
//         throw new Error('useCall must be used inside CallProvider');
//     }

//     return context;
// }

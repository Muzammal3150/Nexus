'use client';

import { useEffect, useState } from 'react';
import { chatSocket } from '@/lib/socket';

interface TypingUser {
    userId: string;
}

export function useRoomTyping(roomId: string) {
    const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser>>({});

    useEffect(() => {
        const handleTyping = ({ roomId: eventRoomId, userId, isTyping }: {
            roomId: string;
            userId: string;
            isTyping: boolean;
        }) => {
            if (eventRoomId !== roomId) return;

            setTypingUsers((current) => {
                const next = { ...current };

                if (isTyping) {
                    next[userId] = { userId };
                } else {
                    delete next[userId];
                }

                return next;
            });
        };

        chatSocket.on('chat:typing-broadcast', handleTyping);

        return () => {
            chatSocket.off('chat:typing-broadcast', handleTyping);
        };
    }, [roomId]);

    return {
        typingUsers: Object.values(typingUsers),
        isTyping: Object.keys(typingUsers).length > 0,
    };
}
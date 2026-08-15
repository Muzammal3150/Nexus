'use client';

import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { chatSocket } from '@/lib/socket';
import { useEffect } from 'react';

export function ContactsProvider({ children }: { children: React.ReactNode }) {
    const initialize = useContactsStore((state) => state.initialize);

    const initialized = useContactsStore((state) => state.initialized);

    const fetchContacts = useContactsStore((state) => state.fetchContacts);

    useEffect(() => {
        let cancelled = false;

        async function loadContacts() {
            try {
                if (!initialized) {
                    await initialize();
                }

                if (cancelled) {
                    return;
                }

                await fetchContacts();
            } catch (error) {
                console.error('Failed to initialize contacts:', error);
            }
        }

        loadContacts();

        return () => {
            cancelled = true;
        };
    }, [initialized, initialize, fetchContacts]);

    useEffect(() => {
        if (!initialized) {
            return;
        }

        const socket = chatSocket;

        function handlePresenceUpdate(data: {
            userId: string;
            isOnline: boolean;
            lastSeen: number | null;
        }) {
            useContactsStore.getState().updateUserPresence(data.userId, {
                isOnline: data.isOnline,
                lastSeen: data.lastSeen,
            });
        }

        function subscribeToPresence() {
            const contacts = useContactsStore.getState().getContacts();

            for (const contact of contacts) {
                socket.emit('presence:subscribe', {
                    userId: contact.id,
                });
            }
        }

        socket.on('presence:update', handlePresenceUpdate);

        if (!socket.connected) {
            socket.connect();
        }

        subscribeToPresence();

        return () => {
            socket.off('presence:update', handlePresenceUpdate);
        };
    }, [initialized]);

    return children;
}

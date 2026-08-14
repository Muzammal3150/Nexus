'use client';

import { useContactsStore } from '@/stores/contactStore';
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

                await fetchContacts();
            } finally {
                if (!cancelled) {
                    // setIsLoading(false);
                }
            }
        }

        loadContacts();

        return () => {
            cancelled = true;
        };
    }, [initialized, initialize, fetchContacts]);

    return children;
}

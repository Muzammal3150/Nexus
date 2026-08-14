'use client';

import { authClient } from '@/features/auth/lib/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type SessionType = ReturnType<typeof authClient.useSession>['data'];

type SessionContextValue = {
    session: SessionType | null;
    refetch: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
    const context = useContext(SessionContext);

    // if (!context) {
    //     throw new Error('useSession must be used inside SessionProvider');
    // }

    return context?.session ?? null;
}

// Call this after any mutation that changes session data (avatar, name,
// username, email, etc.) to pull the latest session and update everything
// consuming useSession(), without a full page reload.
export function useRefetchSession() {
    const context = useContext(SessionContext);

    return context?.refetch ?? (async () => {});
}

export function SessionProvider({
    session,
    children,
}: {
    session: SessionType | null;
    children: React.ReactNode;
}) {
    const [currentSession, setCurrentSession] = useState<SessionType | null>(session);

    // Keep local state in sync if a new server-rendered session prop comes
    // down (e.g. on navigation), without clobbering client-side refetches.
    useEffect(() => {
        setCurrentSession(session);
    }, [session]);

    const refetch = useCallback(async () => {
        try {
            // disableCookieCache forces a real fetch instead of returning the
            // short-lived cached cookie value, so the update shows up immediately.
            const { data, error } = await authClient.getSession({
                query: { disableCookieCache: true },
            });

            if (error) {
                console.error('Failed to refresh session', error);
                return;
            }

            setCurrentSession(data);
        } catch (error) {
            console.error('Failed to refresh session', error);
        }
    }, []);

    return (
        <SessionContext.Provider value={{ session: currentSession, refetch }}>
            {children}
        </SessionContext.Provider>
    );
}

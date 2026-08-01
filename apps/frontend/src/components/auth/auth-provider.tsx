'use client';

import { authClient } from '@/lib/auth/auth';
import { createContext, useContext } from 'react';

export type SessionType = ReturnType<typeof authClient.useSession>['data'];

export const SessionContext = createContext<SessionType | null>(null);

export function useSession() {
    const context = useContext(SessionContext);

    // if (!context) {
    //     throw new Error('useSession must be used inside SessionProvider');
    // }

    return context;
}

export function SessionProvider({
    session,
    children,
}: {
    session: SessionType | null;
    children: React.ReactNode;
}) {
    return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

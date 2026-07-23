'use client';

import { authClient } from '@/lib/auth/auth';
import { User } from 'better-auth';
import { createContext, useContext } from 'react';

const SessionContext = createContext<User | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const session = authClient.useSession();

    return <SessionContext.Provider value={session.data?.user || null}>{children}</SessionContext.Provider>;
}

export function useSession() {
    const session = useContext(SessionContext);

    if (session === undefined) {
        throw new Error('useSession must be used inside SessionProvider');
    }

    return session;
}

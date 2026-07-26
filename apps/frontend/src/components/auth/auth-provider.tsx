'use client';

import { authClient } from '@/lib/auth/auth';
import { createContext, useContext } from 'react';

type SessionContextValue = ReturnType<typeof authClient.useSession>['data'];

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error('useSession must be used inside SessionProvider');
    }

    return context;
}

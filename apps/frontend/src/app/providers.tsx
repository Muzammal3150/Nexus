'use client';

import { SessionContext } from '@/components/auth/auth-provider';
import { authClient } from '@/lib/auth/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            }),
    );
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return 'loading...';
    }
    return (
        <QueryClientProvider client={queryClient}>
            <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
        </QueryClientProvider>
    );
}

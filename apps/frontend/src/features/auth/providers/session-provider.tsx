'use client';

import { authClient } from '@/features/auth/lib/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const sessionQueryKey = ['session'];
export type SessionType = ReturnType<typeof authClient.useSession>['data'];

export function useSession(): SessionType | null {
    const { data } = useQuery({
        queryKey: sessionQueryKey,
        
        queryFn: async () => {
            const { data, error } = await authClient.getSession({
                query: { disableCookieCache: true },
            });

            if (error) return null;

            return data;
        },
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
    });

    return data ?? null;
}

export function useRefetchSession() {
    const queryClient = useQueryClient();

    return () => queryClient.invalidateQueries({ queryKey: sessionQueryKey });
}

export function SessionProvider({
    session,
    children,
}: {
    session: SessionType | null;
    children: React.ReactNode;
}) {
    const queryClient = useQueryClient();
    queryClient.setQueryData(sessionQueryKey, session);

    return children;
}

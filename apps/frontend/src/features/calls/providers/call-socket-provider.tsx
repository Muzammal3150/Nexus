'use client';

import { callSocket } from '@/lib/socket';
import { useEffect } from 'react';

export function CallSocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        callSocket.connect();

        return () => {
            callSocket.disconnect();
        };
    }, []);

    return children;
}

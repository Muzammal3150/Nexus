'use client';

import { toast } from '@/components/ui/toast';
import { callSocket } from '@/lib/socket';
import { useEffect } from 'react';

export function CallSocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        callSocket.connect();
        const handleError = ({ message }: { message: string }) => {
            toast.add({
                type: 'error',
                description: message,
            });
        };

        callSocket.on('call:error', handleError);
        return () => {
            callSocket.off('call:error', handleError);
            callSocket.disconnect();
        };
    }, []);

    return children;
}

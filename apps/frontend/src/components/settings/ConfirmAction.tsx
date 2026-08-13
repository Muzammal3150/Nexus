import { useState } from 'react';
import { toast } from 'sonner';

export function useConfirmAction(action: () => Promise<void>) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function confirm() {
        if (loading) return;

        setLoading(true);

        try {
            await action();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return {
        open,
        setOpen,
        loading,
        confirm,
    };
}

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/features/auth/lib/auth';
import ProfileSection from '@/features/settings/components/ProfileSection';
import { TrashIcon } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDialog from '../alert';

export function DeleteAccount() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    async function handleConfirm() {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const { error } = await authClient.deleteUser();
            if (error) {
                toast.add({ type: 'error', description: error.message });

                return;
            }
            toast.add({ type: 'success', description: 'Account deleted successfully.' });

            router.push('/signup');
        } catch {
            toast.add({ type: 'error', description: 'Something went wrong.' });
        } finally {
            setIsLoading(false);
            setShowConfirm(false);
        }
    }

    return (
        <ProfileSection
            id="delete-account"
            title={'Delete Account'}
            description="You're fully aware and sober—deleting your account will erase all data. There's no recovery, and you'll need to
                create a new account to return."
        >
            <Button
                variant="destructive"
                size="lg"
                onClick={() => setShowConfirm(true)}
                disabled={isLoading}
            >
                <TrashIcon />
                <span className="ml-2">{isLoading ? 'Loading...' : 'Delete'}</span>
            </Button>
            {showConfirm && (
                <ConfirmDialog
                    open={showConfirm}
                    title="Are You Sure?"
                    description={`Are you sure you want to delete your account.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleConfirm}
                    onOpenChange={setShowConfirm}
                />
            )}
        </ProfileSection>
    );
}

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import ProfileSection from '@/features/settings/components/profile-section';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../alert';
import { db } from '@/db/db';

type ActionType = 'chats' | 'calls' | null;

export function DataControlsSection() {
    const [confirmAction, setConfirmAction] = useState<ActionType>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleConfirm() {
        if (!confirmAction || isLoading) return;

        setIsLoading(true);

        try {
            if (confirmAction === 'chats') {
                await db.messages.clear();

                toast.add({
                    type: 'success',
                    description: 'Chats cleared successfully.',
                });
            }

            if (confirmAction === 'calls') {
                // Replace with your clear call history API call
                // await api.clearCallHistory();

                toast.add({
                    type: 'success',
                    description: 'Call history cleared successfully.',
                });
            }
        } catch {
            toast.add({
                type: 'error',
                description: 'Something went wrong.',
            });
        } finally {
            setIsLoading(false);
            setConfirmAction(null);
        }
    }

    const isConfirmOpen = confirmAction !== null;

    const confirmDetails = {
        chats: {
            title: 'Clear Chats?',
            description:
                'This will permanently delete all of your chats. This action cannot be undone.',
        },
        calls: {
            title: 'Clear Call History?',
            description:
                'This will permanently delete your entire call history. This action cannot be undone.',
        },
    };

    return (
        <ProfileSection
            id="data-controls"
            title="Data Controls"
            description="Manage and permanently delete the data associated with your account."
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4 rounded-lg p-4">
                    <div>
                        <h3 className="font-medium">Clear Chats</h3>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete all of your conversations.
                        </p>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={() => setConfirmAction('chats')}
                        disabled={isLoading}
                    >
                        <TrashIcon />
                        <span className="ml-2">Clear Chats</span>
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4  border-t p-4">
                    <div>
                        <h3 className="font-medium">Clear Call History</h3>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete your call history.
                        </p>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={() => setConfirmAction('calls')}
                        disabled={isLoading}
                    >
                        <TrashIcon />
                        <span className="ml-2">Clear History</span>
                    </Button>
                </div>
            </div>

            {confirmAction && (
                <ConfirmDialog
                    open={isConfirmOpen}
                    title={confirmDetails[confirmAction].title}
                    description={confirmDetails[confirmAction].description}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleConfirm}
                    onOpenChange={(open) => {
                        if (!open && !isLoading) {
                            setConfirmAction(null);
                        }
                    }}
                />
            )}
        </ProfileSection>
    );
}

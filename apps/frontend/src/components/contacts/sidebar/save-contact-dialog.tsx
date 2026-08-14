// components/contacts/save-contact-dialog.tsx

'use client';

import { useEffect, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { UserPreview } from '@/lib/auth/users';

interface SaveContactDialogProps {
    user: UserPreview | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string) => Promise<void>;
}

export function SaveContactDialog({ user, open, onOpenChange, onSave }: SaveContactDialogProps) {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open || !user) {
            return;
        }

        setName(user.name || user.username || '');
    }, [open, user]);

    async function handleSave() {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        setIsSaving(true);

        try {
            await onSave(trimmedName);
            onOpenChange(false);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save contact</DialogTitle>

                    <DialogDescription>
                        Choose a name for <strong>{user?.name || user?.username}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Mom, Dad, Brother..."
                    autoFocus
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleSave();
                        }
                    }}
                />

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>

                    <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
                        {isSaving ? 'Saving...' : 'Save contact'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { Phone, UserPlus, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandList,
} from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useRooms } from '@/hooks/chat/useRooms';
import { api } from '@/lib/axios';
import { initCall } from '@/lib/call/init-call';
import { directory } from '@/lib/directory';
import { CallMethod } from '@/types/types';
import { User } from 'better-auth/types';
import { useRouter } from 'next/dist/client/components/navigation';
import { SelectionChip } from './selection-chip';
import { UserResultItem } from './user-result-item';

interface NewCallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewCallDialog({ open, onOpenChange }: NewCallDialogProps) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<User[]>([]);
    const { contacts } = useRooms();
    const router = useRouter();

    const q = query.trim().toLowerCase().replace(/^@/, '');

    const matches = useMemo(
        () =>
            contacts?.filter(
                (user) =>
                    user.name.toLowerCase().includes(q) || user.username.toLowerCase().includes(q),
            ) || [],
        [contacts, q],
    );

    const exactUsernameMatch = directory.some((u) => u.username.toLowerCase() === q);
    const canAddUnknown = q.length > 0 && !exactUsernameMatch;

    function isSelected(id: string) {
        return selected.some((s) => s.id === id);
    }

    function toggleUser(user: User) {
        setSelected((prev) =>
            isSelected(user.id) ? prev.filter((s) => s.id !== user.id) : [...prev, user],
        );
        setQuery('');
    }

    async function addUnknownUser() {
        if (!canAddUnknown) return;

        try {
            const { data: user } = await api.get<User>(`/users/${q}`);

            if (isSelected(user.id)) {
                setQuery('');
                return;
            }

            setSelected((prev) => [...prev, user]);

            setQuery('');
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching user:', error);
                return;
            }
        }
    }

    function removeSelection(id: string) {
        setSelected((prev) => prev.filter((s) => s.id !== id));
    }

    async function handleStartCall(method: CallMethod) {
        if (selected.length === 0) return;

        const call = await initCall({
            memberIds: selected.map((u) => u.id),
        });
        router.push(`/calls/${call.id}?method=${method}`);

        setSelected([]);
        setQuery('');
        onOpenChange(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) {
                    setSelected([]);
                    setQuery('');
                }
            }}
        >
            <DialogContent className="gap-0  p-0 sm:max-w-md">
                <DialogHeader className="px-4 pb-3 pt-4">
                    <DialogTitle>New call</DialogTitle>
                </DialogHeader>

                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t px-4 py-3">
                        {selected.map((s) => (
                            <SelectionChip
                                key={s.id}
                                selection={s}
                                onRemove={() => removeSelection(s.id)}
                            />
                        ))}
                    </div>
                )}

                <Command shouldFilter={false} className="">
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search by name or username…"
                    />
                    <CommandList className="max-h-72 py-2 ">
                        <CommandEmpty className="p-0">
                            {canAddUnknown ? (
                                <button
                                    type="button"
                                    onClick={addUnknownUser}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent"
                                >
                                    <UserPlus className="size-4 text-primary" />
                                    Add <span className="font-medium">@{q}</span> as a new contact
                                </button>
                            ) : (
                                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                                    No one found.
                                </p>
                            )}
                        </CommandEmpty>

                        <CommandGroup className="max-h-72 overflow-y-auto gap-2 flex flex-col ">
                            {matches?.map((user) => (
                                <UserResultItem
                                    key={user.id}
                                    user={user}
                                    selected={isSelected(user.id)}
                                    onSelect={() => toggleUser(user)}
                                />
                            ))}
                        </CommandGroup>

                        {canAddUnknown && matches?.length > 0 && (
                            <CommandGroup heading="Add new">
                                <button
                                    type="button"
                                    onClick={addUnknownUser}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                                >
                                    <UserPlus className="size-4 text-primary" />
                                    Add <span className="font-medium">@{q}</span> as a new contact
                                </button>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>

                <DialogFooter className="flex-row p-2 items-center justify-between gap-2 border-t  sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        {selected.length === 0 ? 'No one selected' : `${selected.length} selected`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={selected.length === 0}
                            onClick={() => handleStartCall('audio')}
                            aria-label="Start audio call"
                        >
                            <Phone className="size-4" />
                        </Button>
                        <Button
                            size="icon"
                            disabled={selected.length === 0}
                            onClick={() => handleStartCall('video')}
                            aria-label="Start video call"
                        >
                            <Video className="size-4" />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

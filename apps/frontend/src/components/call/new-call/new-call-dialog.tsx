'use client';

import { Phone, UserPlus, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { ButtonGroup } from '@/components/ui/button-group';

import { initCall } from '@/lib/call/init-call';
import { SelectionChip } from './selection-chip';
import { UserResultItem } from './user-result-item';
import { useContactsStore, Contact } from '@/stores/contactStore';

interface NewCallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewCallDialog({ open, onOpenChange }: NewCallDialogProps) {
    const router = useRouter();

    const getContacts = useContactsStore((state) => state.getContacts);
    const fetchContact = useContactsStore((state) => state.fetchUserByUsername);

    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Contact[]>([]);

    const contacts = getContacts();
console.log(contacts)
    const q = query.trim().toLowerCase().replace(/^@/, '');

    const matches = useMemo(() => {
        if (!q) {
            return contacts;
        }

        return contacts.filter((contact) => {
            const name = contact.contact?.name ?? contact.name;

            return name.toLowerCase().includes(q) || contact.username.toLowerCase().includes(q);
        });
    }, [contacts, q]);

    const exactUsernameMatch = contacts.some((contact) => contact.username.toLowerCase() === q);

    const canAddUnknown = q.length > 0 && !exactUsernameMatch;

    function isSelected(userId: string) {
        return selected.some((contact) => contact.id === userId);
    }

    function toggleContact(contact: Contact) {
        setSelected((current) =>
            isSelected(contact.id)
                ? current.filter((item) => item.id !== contact.id)
                : [...current, contact],
        );

        setQuery('');
    }

    async function addUnknownUser() {
        if (!canAddUnknown) {
            return;
        }

        try {


            const result = await fetchContact(q);

            if (!result || isSelected(result.id)) {
                setQuery('');
                return;
            }

            setSelected((current) => [...current, result]);

            setQuery('');
        } catch (error) {
            console.error('Failed to fetch contact:', error);
        }
    }

    function removeSelection(userId: string) {
        setSelected((current) => current.filter((contact) => contact.id !== userId));
    }

    async function handleStartCall(method: 'video' | 'audio') {
        if (selected.length === 0) {
            return;
        }

        const call = await initCall({
            memberIds: selected.map((contact) => contact.id),
        });

        router.push(`/calls/${call.id}?method=${method}`);

        setSelected([]);
        setQuery('');
        onOpenChange(false);
    }

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setSelected([]);
            setQuery('');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="gap-0 p-0 sm:max-w-md">
                <DialogHeader className="px-4 pb-3 pt-4">
                    <DialogTitle>New call</DialogTitle>
                </DialogHeader>

                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t px-4 py-3">
                        {selected.map((contact) => (
                            <SelectionChip
                                key={contact.id}
                                selection={{
                                    ...contact,
                                    name: contact.contact?.name ?? contact.name,
                                }}
                                onRemove={() => removeSelection(contact.id)}
                            />
                        ))}
                    </div>
                )}

                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search by name or username…"
                    />

                    <CommandList className="max-h-72 py-2">
                        <CommandEmpty className="p-0">
                            {canAddUnknown ? (
                                <button
                                    type="button"
                                    onClick={addUnknownUser}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent"
                                >
                                    <UserPlus className="size-4 text-primary" />
                                    Add <span className="font-medium">@{q}</span>
                                </button>
                            ) : (
                                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                                    No one found.
                                </p>
                            )}
                        </CommandEmpty>

                        {matches.length > 0 && (
                            <CommandGroup className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                                {matches.map((contact) => (
                                    <UserResultItem
                                        key={contact.id}
                                        user={{
                                            ...contact,
                                            name: contact.contact?.name ?? contact.name,
                                        }}
                                        selected={isSelected(contact.id)}
                                        onSelect={() => toggleContact(contact)}
                                    />
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>

                <DialogFooter className="flex-row items-center justify-between gap-2 border-t p-2 sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        {selected.length === 0 ? 'No one selected' : `${selected.length} selected`}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>

                        <ButtonGroup>
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
                        </ButtonGroup>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

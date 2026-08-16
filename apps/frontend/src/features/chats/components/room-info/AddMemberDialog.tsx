import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Contact, useContactsStore } from '@/features/contacts/stores/contact-store';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { UiState } from '@/stores/uiStore/uis';
import { Check, Loader2, Search } from 'lucide-react';
import { getInitials } from '../../lib/utils-chat';
import { Room } from '../../types/room';

interface AddMemberDialogProps {
    room: Room;
    onAdded?: (members: Contact[]) => void;
}

export function AddMemberDialog({ room, onAdded }: AddMemberDialogProps) {
    const isOpen = useUiStore((state) => state.isOpen(UiState.Chat.GroupInfo.AddMemberDialog));
    const setOpen = useUiStore((state) => state.setOpen);

    // Select the stable object instead of creating a new array in the selector.
    const users = useContactsStore((state) => state.users);

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(() => new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const contacts = useMemo(() => Object.values(users), [users]);

    const existingMemberIds = useMemo(
        () => new Set(room.members?.map((member) => member.userId) ?? []),
        [room.members],
    );

    const availableContacts = useMemo(
        () => contacts.filter((contact) => !existingMemberIds.has(contact.id)),
        [contacts, existingMemberIds],
    );

    const filteredContacts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return availableContacts;

        return availableContacts.filter(
            (contact) =>
                contact.name?.toLowerCase().includes(query) ||
                contact.username?.toLowerCase().includes(query),
        );
    }, [availableContacts, search]);

    useEffect(() => {
        if (isOpen) return;

        setSearch('');
        setSelected(new Set());
        setError(null);
        setLoading(false);
    }, [isOpen]);

    const toggleSelected = (contactId: string) => {
        setSelected((current) => {
            const next = new Set(current);

            if (next.has(contactId)) {
                next.delete(contactId);
            } else {
                next.add(contactId);
            }

            return next;
        });
    };

    const handleOpenChange = (open: boolean) => {
        if (loading) return;
        setOpen(UiState.Chat.GroupInfo.AddMemberDialog, open);
    };

    const handleConfirm = async () => {
        if (loading || selected.size === 0) return;

        setLoading(true);
        setError(null);

        const userIds = Array.from(selected);

        try {
            await axios.post(`/rooms/${room.id}/members`, { userIds });

            const addedContacts = availableContacts.filter((contact) => selected.has(contact.id));

            onAdded?.(addedContacts);
            setOpen(UiState.Chat.GroupInfo.AddMemberDialog, false);
        } catch (error: unknown) {
            if (!axios.isAxiosError(error)) {
                setError('Failed to add members. Please try again.');
                return;
            }

            const status = error.response?.status;

            if (status === 403) {
                setError('You do not have permission to add members.');
            } else if (status === 404) {
                setError('The room or one of the users could not be found.');
            } else if (status === 409) {
                setError('One or more users are already members of this room.');
            } else {
                setError(error.response?.data?.error ?? 'Failed to add members. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add members</DialogTitle>
                    <DialogDescription>
                        Select people to add to &quot;{room.name}&quot;.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search contacts"
                        className="pl-8"
                        disabled={loading}
                    />
                </div>

                <ScrollArea className="h-64 rounded-md border">
                    <div className="divide-y">
                        {filteredContacts.length === 0 ? (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {search ? 'No matching contacts' : 'No contacts available'}
                            </p>
                        ) : (
                            filteredContacts.map((contact) => {
                                const checked = selected.has(contact.id);
                                const checkboxId = `contact-${contact.id}`;

                                return (
                                    <label
                                        key={contact.id}
                                        htmlFor={checkboxId}
                                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50"
                                    >
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage
                                                src={contact.image ?? undefined}
                                                alt={contact.name}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(contact.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {contact.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                @{contact.username}
                                            </p>
                                        </div>

                                        <Checkbox
                                            id={checkboxId}
                                            checked={checked}
                                            disabled={loading}
                                            onCheckedChange={() => toggleSelected(contact.id)}
                                        />
                                    </label>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={loading}
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={selected.size === 0 || loading}
                        className="gap-1.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Add{selected.size ? ` ${selected.size}` : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

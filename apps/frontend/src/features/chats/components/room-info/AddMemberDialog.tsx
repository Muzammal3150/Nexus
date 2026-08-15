import { useEffect, useMemo, useState } from 'react';
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
import { Contact } from '@/features/contacts/stores/contact-store';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { UiState } from '@/stores/uiStore/uis';
import { Check, Search } from 'lucide-react';
import { getInitials } from '../../lib/utils-chat';
import { Room } from '../../types/room';

interface AddMemberDialogProps {
    room: Room;
    contacts: Contact[];
    onConfirm: (contactIds: string[]) => void;
}

export function AddMemberDialog({ room, contacts, onConfirm }: AddMemberDialogProps) {
    const isOpen = useUiStore((state) => state.isOpen(UiState.Chat.GroupInfo.AddMemberDialog));
    const setOpen = useUiStore((state) => state.setOpen);

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setSelected(new Set());
        }
    }, [isOpen]);

    const existingMemberIds = useMemo(
        () => new Set(room.members?.map((member) => member.userId) ?? []),
        [room.members],
    );

    const filteredContacts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return contacts.filter((contact) => {
            if (existingMemberIds.has(contact.id)) return false;

            if (!query) return true;

            return (
                contact.name?.toLowerCase().includes(query) ||
                contact.username?.toLowerCase().includes(query)
            );
        });
    }, [contacts, existingMemberIds, search]);

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

    const handleConfirm = () => {
        if (!selected.size) return;

        onConfirm([...selected]);
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(UiState.Chat.GroupInfo.AddMemberDialog, open);
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

                                return (
                                    <label
                                        key={contact.id}
                                        htmlFor={`contact-${contact.id}`}
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
                                            id={`contact-${contact.id}`}
                                            checked={checked}
                                            onCheckedChange={() => toggleSelected(contact.id)}
                                        />
                                    </label>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selected.size}
                        className="gap-1.5"
                    >
                        <Check className="h-4 w-4" />
                        Add {selected.size > 0 ? selected.size : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

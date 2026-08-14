'use client';

import { Search, UserRoundPlus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { useUiStore } from '@/stores/uiStore';

import { ContactItem } from './contact-item';

import { initCall } from '@/features/calls/lib/init-call';
import { createRoom } from '@/features/chats/components/new-chat/create-room';
import { Contact, useContactsStore } from '@/features/contacts/stores/contact-store';

export function ContactsSidebar() {
    const router = useRouter();

    const { roomId: activeId } = useParams<{ roomId: string }>();

    const open = useUiStore((state) => state.open);
    const users = useContactsStore((state) => state.users);
    const contacts = useContactsStore((state) => state.contacts);

    const saveContact = useContactsStore((state) => state.saveContact);

    const [query, setQuery] = useState('');
    const [contactToSave, setContactToSave] = useState<Contact | null>(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [contactName, setContactName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const allUsers = useMemo(() => Object.values(users), [users]);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return allUsers;
        }

        return allUsers.filter((user) => {
            const name = user.name?.toLowerCase() ?? '';
            const username = user.username?.toLowerCase() ?? '';
            const savedName = contacts[user.id]?.name?.toLowerCase() ?? '';

            return (
                name.includes(normalizedQuery) ||
                username.includes(normalizedQuery) ||
                savedName.includes(normalizedQuery)
            );
        });
    }, [allUsers, contacts, query]);

    const savedContacts = useMemo(
        () => filteredUsers.filter((user) => contacts[user.id] !== undefined),
        [filteredUsers, contacts],
    );

    const newPeople = useMemo(
        () => filteredUsers.filter((user) => contacts[user.id] === undefined),
        [filteredUsers, contacts],
    );

    function getContact(userId: string): Contact {
        const user = users[userId];

        return {
            ...user,
            contact: contacts[userId],
        };
    }

    function onAdd(user: Contact) {
        setContactToSave(user);
        setContactName(user.name || user.username || '');
        setSaveDialogOpen(true);
    }

    function closeSaveDialog() {
        if (isSaving) {
            return;
        }

        setSaveDialogOpen(false);
        setContactToSave(null);
        setContactName('');
    }

    async function handleSaveContact() {
        if (!contactToSave) {
            return;
        }

        const name = contactName.trim();

        if (!name) {
            return;
        }

        setIsSaving(true);

        try {
            await saveContact(contactToSave.id, name);

            setSaveDialogOpen(false);
            setContactToSave(null);
            setContactName('');
        } finally {
            setIsSaving(false);
        }
    }

    async function onChat(contact: Contact) {
        const room = await createRoom({
            isGroup: false,
            name: contact.contact?.name ?? contact.name,
            memberIds: [contact.id],
        });

        router.push(`/chats/${room.id}`);
    }

    async function onCall(contact: Contact) {
        const room = await initCall({
            memberIds: [contact.id],
        });

        router.push(`/calls/${room.id}`);
    }

    const hasResults = savedContacts.length > 0 || newPeople.length > 0;

    return (
        <>
            <div className="flex h-full flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                    <h2 className="text-lg font-semibold tracking-tight">Contacts</h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => open('add-contact-dialog')}
                        aria-label="Add contact"
                    >
                        <UserRoundPlus className="size-4" />
                    </Button>
                </div>

                <div className="px-3 pb-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search contacts"
                            className="bg-muted pl-9"
                        />
                    </div>
                </div>

                <Separator />

                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-4 p-2 py-3">
                        {savedContacts.length > 0 && (
                            <ContactSection title="My Contacts" count={savedContacts.length}>
                                {savedContacts.map((user) => {
                                    const contact = getContact(user.id);

                                    return (
                                        <ContactItem
                                            key={user.id}
                                            contact={contact}
                                            active={user.id === activeId}
                                            onSelect={() => router.push(`/contacts/${user.id}`)}
                                            onChat={() => onChat(contact)}
                                            onCall={() => onCall(contact)}
                                        />
                                    );
                                })}
                            </ContactSection>
                        )}

                        {savedContacts.length > 0 && newPeople.length > 0 && <Separator />}

                        {newPeople.length > 0 && (
                            <ContactSection title="New People" count={newPeople.length}>
                                {newPeople.map((user) => {
                                    const contact = getContact(user.id);

                                    return (
                                        <ContactItem
                                            key={user.id}
                                            contact={contact}
                                            active={user.id === activeId}
                                            onSelect={() => router.push(`/contacts/${user.id}`)}
                                            onChat={() => onChat(contact)}
                                            onCall={() => onCall(contact)}
                                            onAdd={() => onAdd(contact)}
                                        />
                                    );
                                })}
                            </ContactSection>
                        )}

                        {!hasResults && (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {query.trim() ? 'No people found.' : 'No contacts found.'}
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <Dialog
                open={saveDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeSaveDialog();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save contact</DialogTitle>

                        <DialogDescription>
                            Choose a name for{' '}
                            <strong>{contactToSave?.name ?? contactToSave?.username}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <Input
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="e.g. Mom, Dad, Brother..."
                        autoFocus
                        disabled={isSaving}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSaveContact();
                            }
                        }}
                    />

                    <DialogFooter>
                        <Button variant="ghost" onClick={closeSaveDialog} disabled={isSaving}>
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSaveContact}
                            disabled={isSaving || !contactName.trim()}
                        >
                            {isSaving ? 'Saving...' : 'Save contact'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface ContactSectionProps {
    title: string;
    count: number;
    children: React.ReactNode;
}

function ContactSection({ title, count, children }: ContactSectionProps) {
    return (
        <div>
            <h3 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {title} · {count}
            </h3>

            <div className="flex flex-col gap-0.5">{children}</div>
        </div>
    );
}

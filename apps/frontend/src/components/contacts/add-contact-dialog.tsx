'use client';

import { useState } from 'react';
import { Loader2, Search, UserPlus, UserRoundX } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/chat/utils-chat';
import { useUiStore } from '@/stores/uiStore';
import { useContactsStore } from '@/stores/contactStore';

type SearchStatus = 'idle' | 'loading' | 'found' | 'not-found';

export function AddContactDialog() {
    const isOpen = useUiStore((state) => state.isOpen('add-contact-dialog'));

    const setOpen = useUiStore((state) => state.setOpen);

    const fetchUserByUsername = useContactsStore((state) => state.fetchUserByUsername);

    const saveContact = useContactsStore((state) => state.saveContact);

    const [username, setUsername] = useState('');
    const [contactDisplayName, setContactDisplayName] = useState('');

    const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');

    const [userId, setUserId] = useState<string | null>(null);

    const [user, setUser] =
        useState<
            Awaited<
                ReturnType<typeof useContactsStore.getState>['fetchUserByUsername']
            > extends infer T
                ? T
                : never
        >(undefined);

    function reset() {
        setUsername('');
        setContactDisplayName('');
        setSearchStatus('idle');
        setUserId(null);
        setUser(undefined);
    }

    function close() {
        setOpen('add-contact-dialog', false);
        reset();
    }

    function handleUsernameChange(value: string) {
        setUsername(value);

        if (searchStatus !== 'idle') {
            setSearchStatus('idle');
            setUserId(null);
            setUser(undefined);
        }
    }

    async function handleSearch() {
        const searchUsername = username.trim().toLowerCase().replace(/^@/, '');

        if (!searchUsername) {
            return;
        }

        setSearchStatus('loading');
        setUserId(null);
        setUser(undefined);

        try {
            const result = await fetchUserByUsername(searchUsername);

            if (!result) {
                setSearchStatus('not-found');
                return;
            }

            setUserId(result.id);
            setUser(result);
            setContactDisplayName(result.contact?.name ?? result.name);

            setSearchStatus('found');
        } catch (error) {
            console.error('Failed to find user:', error);

            setSearchStatus('not-found');
        }
    }

    async function handleAdd() {
        if (!userId) {
            return;
        }

        const name = contactDisplayName.trim();

        if (!name) {
            return;
        }

        await saveContact(userId, name);

        close();
    }

    const normalizedUsername = username.trim().replace(/^@/, '');

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(nextOpen) => {
                setOpen('add-contact-dialog', nextOpen);

                if (!nextOpen) {
                    reset();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a contact</DialogTitle>

                    <DialogDescription>
                        Search for someone by their username and add them to your contacts.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                autoFocus
                                value={username}
                                onChange={(event) => handleUsernameChange(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Enter username"
                                className="pl-9"
                            />
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={!username.trim() || searchStatus === 'loading'}
                        >
                            {searchStatus === 'loading' ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span className="sr-only">Searching</span>
                                </>
                            ) : (
                                'Search'
                            )}
                        </Button>
                    </div>

                    {searchStatus === 'found' && user && (
                        <div className="overflow-hidden rounded-xl border bg-card">
                            <div className="flex items-center gap-3 border-b px-4 py-3">
                                <Avatar className="size-11 shrink-0">
                                    <AvatarImage src={user.image} alt={user.name} />

                                    <AvatarFallback
                                        className={cn('bg-primary/10 text-primary', 'font-medium')}
                                    >
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{user.name}</p>

                                    <p className="truncate text-sm text-muted-foreground">
                                        @{user.username}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 p-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="contact-display-name" className="text-sm">
                                        Contact name
                                    </Label>

                                    <Input
                                        id="contact-display-name"
                                        value={contactDisplayName}
                                        onChange={(event) =>
                                            setContactDisplayName(event.target.value)
                                        }
                                        placeholder={user.name}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        This is how their name will appear in your contacts.
                                    </p>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleAdd}
                                    disabled={!contactDisplayName.trim()}
                                >
                                    <UserPlus className="size-4" />
                                    Add contact
                                </Button>
                            </div>
                        </div>
                    )}

                    {searchStatus === 'not-found' && (
                        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                                <UserRoundX className="size-4 text-destructive" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-medium">User not found</p>

                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    We couldn&apos;t find{' '}
                                    <span className="font-medium text-foreground">
                                        @{normalizedUsername}
                                    </span>
                                    . Check the username and try again.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

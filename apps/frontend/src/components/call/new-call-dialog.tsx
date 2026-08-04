'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const initialUsers = [
    { id: '1', username: 'john', name: 'John Doe' },
    { id: '2', username: 'jane', name: 'Jane Smith' },
    { id: '3', username: 'alex', name: 'Alex Johnson' },
    { id: '4', username: 'sarah', name: 'Sarah Wilson' },
    { id: '5', username: 'emma', name: 'Emma Brown' },
    { id: '6', username: 'michael', name: 'Michael Scott' },
];

export default function StartCallDialog({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (v: boolean) => void;
}) {
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [users, setUsers] = useState(initialUsers);
    const [selectedUsers, setSelectedUsers] = useState<typeof users>([]);

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, users]);

    function toggleUser(user: (typeof users)[number]) {
        if (selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    }

    function addUsername() {
        const username = search.trim();

        if (!username) return;

        if (users.some((u) => u.username === username)) return;

        const newUser = {
            id: crypto.randomUUID(),
            username,
            name: username,
        };

        setUsers((prev) => [...prev, newUser]);
        setSelectedUsers((prev) => [...prev, newUser]);
        setSearch('');
    }

    function startCall() {
        if (!selectedUsers.length) return;

        const ids = selectedUsers.map((u) => u.id).join(',');

        router.push(`/calls?users=${ids}`);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Start a Call</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                            placeholder="Search or type a username..."
                            className="pl-9 pr-24"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <Button
                            size="sm"
                            className="absolute right-1 top-1"
                            variant="secondary"
                            onClick={addUsername}
                        >
                            <UserPlus className="mr-1 h-4 w-4" />
                            Add
                        </Button>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((user) => (
                                <Badge
                                    key={user.id}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setSelectedUsers((prev) =>
                                            prev.filter((u) => u.id !== user.id),
                                        )
                                    }
                                >
                                    @{user.username} ✕
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="max-h-72 space-y-2 overflow-y-auto">
                        {filteredUsers.map((user) => {
                            const selected = selectedUsers.some((u) => u.id === user.id);

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => toggleUser(user)}
                                    className={`flex w-full items-center justify-between rounded-lg border p-3 transition ${
                                        selected ? 'border-primary bg-muted' : 'hover:bg-muted'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="text-left">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                @{user.username}
                                            </p>
                                        </div>
                                    </div>

                                    {selected && <Check className="h-5 w-5 text-primary" />}
                                </button>
                            );
                        })}
                    </div>

                    <Button className="w-full" disabled={!selectedUsers.length} onClick={startCall}>
                        Start Call ({selectedUsers.length})
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

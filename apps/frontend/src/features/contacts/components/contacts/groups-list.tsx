'use client';

import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Room } from '@/features/chats/types/room';
import Link from 'next/link';

async function getRooms(userId: string) {
    const res = await api.get<Room[]>(`/rooms/common/${userId}`, {});
    return res.data;
}

export default function GroupsList({ userId }: { userId: string }) {
    const {
        data: groups = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['commonRooms', userId],
        queryFn: () => getRooms(userId),
        enabled: !!userId,
    });

    if (isLoading) return <div>Loading groups...</div>;
    if (isError) return <div>Failed to load groups.</div>;
    if (!groups.length) return <div>No common groups.</div>;

    console.log(groups);
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {groups.map((group) => (
                <Link href={`/chats/${group.id}`} key={group.id}>
                    <Card className="transition-colors hover:bg-accent p-2 cursor-pointer">
                        <CardContent className="flex items-center gap-3 p-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Users className="size-4.5" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{group.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {group.members.length} members
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

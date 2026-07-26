'use client';

import { MoreVertical, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { api } from '@/lib/axios';
import { formatDirectRoom } from '@/lib/rooms';
import { Room } from '@/types/room';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '../auth/auth-provider';
import { NewChatPopover } from '../newChat/new-chat-popover';
import { RoomsListItem } from './rooms-list-item';

export function RoomsList() {
    const { roomId: activeId } = useParams<{ roomId: string }>();
    const session = useSession();
    const { data, isLoading } = useQuery({
        queryKey: ['get-rooms'],
        queryFn: async () => {
            const res = await api.get('/rooms');
            return res.data as Room[];
        },
        select(rooms) {
            return rooms.map((room) => formatDirectRoom(room, session.user));
        },
    });
    // const rooms = useRooms();
    const [roomSearchValue, setRoomSearchValue] = useState('');

    if (isLoading) return 'Loading';
    const rooms = data;
    return (
        <div className="flex w-[320px] shrink-0 flex-col border-r bg-muted/20">
            <RoomsListHeader query={roomSearchValue} onQueryChange={setRoomSearchValue} />
            <Separator />

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-2">
                    {rooms?.map((room) => (
                        <RoomsListItem key={room.id} room={room} active={room.id === activeId} />
                    ))}
                    {rooms?.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No chats found.
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function RoomsListHeader({
    query,
    onQueryChange,
}: {
    query: string;
    onQueryChange: (value: string) => void;
}) {
    return (
        <header>
            <div className="flex items-center gap-2 px-4 py-3">
                <h2 className="text-lg font-semibold tracking-tight mr-auto">Chats</h2>
                <NewChatPopover />
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="size-4" />
                </Button>
            </div>

            <div className="px-3 pb-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search or start a new chat"
                        className="bg-muted pl-9"
                    />
                </div>
            </div>
        </header>
    );
}

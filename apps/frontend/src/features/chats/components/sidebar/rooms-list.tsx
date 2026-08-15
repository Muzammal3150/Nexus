'use client';

import { MoreVertical, Search, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'motion/react';

import { LoadingPage } from '@/components/custom-ui/loading';
import { useRooms } from '@/features/chats/hooks/use-rooms';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { RoomsListItem } from './rooms-list-item';
import { UiState } from '@/stores/uiStore/uis';

export function RoomsList({ className }: { className?: string }) {
    const { roomId: activeId } = useParams<{ roomId: string }>();
    const { rooms, isLoading } = useRooms();
    const [search, setSearch] = useState('');

    const filteredRooms = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return rooms;
        }

        return rooms?.filter((room) => {
            return (
                room.name?.toLowerCase().includes(query) ||
                room.description?.toLowerCase().includes(query) ||
                room.members.some((member) => member.user.name?.toLowerCase().includes(query))
            );
        });
    }, [rooms, search]);
    if (isLoading) return <LoadingPage />;
    return (
        <div className={cn('flex  flex-col border-r h-full', className)}>
            <RoomsListHeader query={search} onQueryChange={setSearch} />
            <Separator />

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-2">
                    <AnimatePresence mode="popLayout">
                        {filteredRooms?.map((room) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <RoomsListItem
                                    key={room.id}
                                    room={{
                                        ...room,
                                        lastMessage: room.lastMessage
                                            ? {
                                                  ...room.lastMessage,
                                                  sender: room.lastMessage.sender!,
                                                  isMine: false,
                                              }
                                            : null,
                                    }}
                                    active={room.id === activeId}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
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
    const open = useUiStore((s) => s.open);
    return (
        <header>
            <div className="flex items-center gap-2 px-4 py-3">
                <h2 className="text-lg font-semibold tracking-tight mr-auto">Chats</h2>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => open(UiState.Chat.NewChatDialog)}
                >
                    <UserPlus className="h-4 w-4" />
                    New Chat
                </Button>

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

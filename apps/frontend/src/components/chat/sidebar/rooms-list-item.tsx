'use client';

import { useSession } from '@/components/providers/session-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/chat/utils-chat';
import { cn } from '@/lib/utils';
import { Room } from '@/types/room';
import { User } from 'better-auth';
import { format } from 'date-fns';
import { Badge, CheckCheck } from 'lucide-react';
import Link from 'next/link';

interface RoomsListItemProps {
    room: Room;
    active: boolean;
}

export function RoomsListItem({ room, active }: RoomsListItemProps) {
    const session = useSession();

    return (
        <Link href={`/chats/${room.id}`}>
            <button
                type="button"
                className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-accent' : 'hover:bg-accent/60',
                )}
            >
                <div className="relative shrink-0">
                    <Avatar className="size-11">
                        <AvatarFallback className={cn('text-sm font-medium')}>
                            {getInitials(room.name ?? 'g')}
                        </AvatarFallback>
                    </Avatar>
                    {/* {room.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                )} */}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{room.name}</span>
                        <span
                            className={cn(
                                'shrink-0 text-xs',
                                room.unread > 0
                                    ? 'font-medium text-primary'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {room.lastMessage && format(room.lastMessage?.sentAt, 'p')}
                        </span>
                    </div>

                    <div className="mt-0.5 flex items-center justify-between gap-2">
                        {room.lastMessage && (
                            <span
                                className={cn(
                                    'flex items-center gap-1 truncate text-xs',
                                    room.typing ? 'text-primary' : 'text-muted-foreground',
                                )}
                            >
                                {!room.unread && <CheckCheck className="size-3.5 shrink-0" />}
                                {room.lastMessage && (
                                    <span className="truncate">
                                        {formatUserName(room.lastMessage.sender, session!.user)}:{' '}
                                        {room.lastMessage.body}
                                    </span>
                                )}
                            </span>
                        )}
                        {room.unread > 0 && <Badge>{room.unread}</Badge>}
                    </div>
                </div>
            </button>
        </Link>
    );
}

function formatUserName(user: User, currUser: User) {
    if (user?.id == currUser.id) return 'You';
    return user?.name;
}

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/chat/utils-chat';
import { cn } from '@/lib/cn';
import { Room } from '@/types/room';
import Link from 'next/link';

interface RoomsListItemProps {
    room: Room;
    active: boolean;
}

export function RoomsListItem({ room, active }: RoomsListItemProps) {
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
                            {getInitials(room.name ?? "g")}
                        </AvatarFallback>
                    </Avatar>
                    {/* {room.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                )} */}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{room.name}</span>
                        {/* <span
                        className={cn(
                            'shrink-0 text-xs',
                            room.unread > 0
                            ? 'font-medium text-primary'
                                : 'text-muted-foreground',
                        )}
                        >
                        {room.time}
                    </span> */}
                    </div>
                    {/* 
                <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span
                        className={cn(
                            'flex items-center gap-1 truncate text-xs',
                            conversation.typing ? 'text-primary' : 'text-muted-foreground',
                            )}
                    >
                        {conversation.read && <CheckCheck className="size-3.5 shrink-0" />}
                        <span className="truncate">{conversation.lastMessage}</span>
                    </span>
                    
                    {conversation.unread > 0 && (
                        <Badge className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[11px]">
                        {conversation.unread}
                        </Badge>
                    )}
                </div> */}
                </div>
            </button>
        </Link>
    );
}

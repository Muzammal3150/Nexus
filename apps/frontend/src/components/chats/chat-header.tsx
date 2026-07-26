'use client';

import { MoreVertical, Phone, Search, Video } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils-chat';
import { Room } from '@/types/room';

export function ChatHeader({ room }: { room: Room }) {
    return (
        <div className="flex items-center justify-between border-b bg-background px-5 py-3">
            <div className="flex items-center gap-3">
                <Avatar className="size-9">
                    <AvatarFallback className={cn('text-xs font-medium')}>
                        {getInitials(room.name ?? 'g')}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-tight">{room.name}</p>
                    {/* <p className="text-xs text-muted-foreground">
                        {conversation.typing ? 'typing…' : 'last seen recently'}
                    </p> */}
                </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
                <Button variant="ghost" size="icon" className="size-8">
                    <Video className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                    <Phone className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                    <Search className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="size-4" />
                </Button>
            </div>
        </div>
    );
}

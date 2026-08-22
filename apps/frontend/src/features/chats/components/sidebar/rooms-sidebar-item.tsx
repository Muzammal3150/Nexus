'use client';

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/features/auth/lib/auth';
import { UserPreview } from '@/features/auth/lib/users';
import { useSession } from '@/features/auth/providers/session-provider';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { Room } from '@/features/chats/types/room';

import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { cn } from '@/lib/utils';

import { getUpload } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRoomTyping } from '../../hooks/use-room-typing';

interface RoomsSidebarItemProps {
    room: Room;
    active: boolean;
}

export function RoomsSidebarItem({ room, active }: RoomsSidebarItemProps) {
    const session = useSession();

    const otherUserId = !room.isGroup
        ? room.members.find((member) => member.userId !== session!.user.id)?.userId
        : undefined;

    const isOnline = useContactsStore((state) =>
        otherUserId ? state.users[otherUserId]?.isOnline : false,
    );

    const { typingUsers } = useRoomTyping(room.id);

    const typingUserIds = typingUsers.filter((user) => user.userId !== session!.user.id);

    const typingText = getTypingText(room, typingUserIds);

    return (
        <Link href={`/chats/${room.id}`}>
            <button
                type="button"
                className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-accent' : 'hover:bg-accent/60',
                )}
            >
                <Avatar className="size-11">
                    <AvatarImage src={getUpload(room.avatar)} alt={room.name} />

                    <AvatarFallback className="text-sm font-medium">
                        {getInitials(room.name)}
                    </AvatarFallback>

                    {!room.isGroup && isOnline && <AvatarBadge className="bg-emerald-500" />}
                </Avatar>

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
                            {room.lastMessage && format(room.lastMessage.sentAt, 'p')}
                        </span>
                    </div>

                    <div className="mt-0.5 flex items-center justify-between gap-2">
                        {typingText ? (
                            <span className="truncate text-xs text-primary">{typingText}</span>
                        ) : room.lastMessage ? (
                            <span className="flex items-center gap-1 truncate text-xs">
                                {!room.unread && <CheckCheck className="size-3.5 shrink-0" />}

                                <span className="truncate">
                                    {room.isGroup &&
                                        `${formatUserName(room.lastMessage.sender, session!.user)}:`}
                                    {room.lastMessage.type === 'text'
                                        ? room.lastMessage.text
                                        : room.lastMessage.attachment.originalFilename}
                                </span>
                            </span>
                        ) : null}

                        {room.unread > 0 && !typingText && <Badge>{room.unread}</Badge>}
                    </div>
                </div>
            </button>
        </Link>
    );
}

function getTypingText(room: Room, typingUsers: { userId: string }[]) {
    if (typingUsers.length === 0) {
        return null;
    }

    if (!room.isGroup) {
        return 'Typing...';
    }

    const names = typingUsers
        .map((typingUser) => {
            const member = room.members.find((member) => member.userId === typingUser.userId);

            return member?.user?.name;
        })
        .filter((name): name is string => Boolean(name));

    if (names.length === 0) {
        return 'Typing...';
    }

    if (names.length === 1) {
        return `${names[0]}: Typing...`;
    }

    if (names.length === 2) {
        return `${names[0]} and ${names[1]}: Typing...`;
    }

    return `${names[0]} and ${names.length - 1} others: Typing...`;
}

function formatUserName(user: UserPreview, currUser: User) {
    if (user?.id === currUser.id) {
        return 'You';
    }

    return user?.name;
}

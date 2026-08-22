'use client';

import { formatDistanceToNow } from 'date-fns';
import { Phone, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/providers/session-provider';
import { initCall } from '@/features/calls/lib/init-call';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { Room } from '@/features/chats/types/room';
import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { cn, getUpload } from '@/lib/utils';
import { UiState } from '@/stores/uiStore/uis';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { useRoomTyping } from '../../hooks/use-room-typing';

export function ChatHeader({ room }: { room: Room }) {
    const router = useRouter();
    const session = useSession();

    const otherUserId = !room.isGroup
        ? room.members.find((member) => member.userId !== session!.user.id)?.userId
        : undefined;

    const user = useContactsStore((state) => (otherUserId ? state.users[otherUserId] : undefined));

    const isOnline = user?.isOnline ?? false;

    const { typingUsers } = useRoomTyping(room.id);

    const otherTypingUsers = typingUsers.filter(({ userId }) => userId !== session!.user.id);

    const typingText = getTypingText(room, otherTypingUsers);

    async function onCall() {
        const { id } = await initCall({
            memberIds: room.members.map(({ userId }) => userId),
        });

        router.push(`/calls/${id}`);
    }
    const open = useUiStore((s) => s.open);

    return (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-5 py-3">
            <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => open(UiState.Chat.GroupInfo.Drawer)}
            >
                <Avatar className="size-9">
                    <AvatarImage src={getUpload(room.avatar)} alt={room.name} />

                    <AvatarFallback className="text-xs font-medium">
                        {getInitials(room.name)}
                    </AvatarFallback>

                    {!room.isGroup && isOnline && <AvatarBadge className="bg-emerald-500" />}
                </Avatar>

                <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{room.name}</p>

                    <p
                        className={cn(
                            'max-w-64 truncate text-xs',
                            typingText ? 'text-primary' : 'text-muted-foreground',
                        )}
                    >
                        {typingText ??
                            (!room.isGroup
                                ? isOnline
                                    ? 'Online'
                                    : user?.lastSeen
                                      ? `Last seen ${formatDistanceToNow(user.lastSeen, {
                                            addSuffix: true,
                                        })}`
                                      : ''
                                : (room.description ?? null))}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
                <Button variant="ghost" size="icon" className="size-8" onClick={onCall}>
                    <Video className="size-4" />
                </Button>

                <Button variant="ghost" size="icon" className="size-8" onClick={onCall}>
                    <Phone className="size-4" />
                </Button>

            </div>
        </div>
    );
}

function getTypingText(room: Room, typingUsers: { userId: string }[]) {
    if (typingUsers.length === 0) {
        return null;
    }

    if (!room.isGroup) {
        return 'typing...';
    }

    const names = typingUsers
        .map((typingUser) => {
            const member = room.members.find((member) => member.userId === typingUser.userId);

            return member?.user?.name;
        })
        .filter((name): name is string => Boolean(name));

    if (names.length === 0) {
        return 'typing...';
    }

    if (names.length === 1) {
        return `${names[0]} is typing...`;
    }

    if (names.length === 2) {
        return `${names[0]} and ${names[1]} are typing...`;
    }

    return `${names[0]} and ${names.length - 1} others are typing...`;
}

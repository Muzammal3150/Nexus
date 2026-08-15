import { MoreVertical, Phone, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { initCall } from '@/features/calls/lib/init-call';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { Room } from '@/features/chats/types/room';
import { useSession } from '@/features/auth/providers/session-provider';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function ChatHeader({ room }: { room: Room }) {
    const router = useRouter();
    const session = useSession();

    const otherUserId = !room.isGroup
        ? room.members.find((member) => member.userId !== session!.user.id)?.userId
        : undefined;

    const user = useContactsStore((state) => (otherUserId ? state.users[otherUserId] : undefined));

    const isOnline = user?.isOnline ?? false;

    async function onCall() {
        const { id } = await initCall({
            memberIds: room.members.map(({ userId }) => userId),
        });

        router.push(`/calls/${id}`);
    }

    return (
        <div className="sticky top-0 z-100 flex items-center justify-between border-b bg-background px-5 py-3">
            <div className="flex items-center gap-3">
                <Avatar className="size-9">
                    <AvatarImage src={room.image ?? undefined} alt={room.name} />

                    <AvatarFallback className={cn('text-xs font-medium')}>
                        {getInitials(room.name)}
                    </AvatarFallback>

                    {isOnline && <AvatarBadge className="bg-emerald-500" />}
                </Avatar>

                <div>
                    <p className="text-sm font-medium leading-tight">{room.name}</p>

                    <p className="text-xs text-muted-foreground">
                        {isOnline
                            ? 'Online'
                            : user?.lastSeen
                              ? `Last seen ${formatDistanceToNow(user.lastSeen, {
                                    addSuffix: true,
                                })}`
                              : ''}
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

                <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="size-4" />
                </Button>
            </div>
        </div>
    );
}

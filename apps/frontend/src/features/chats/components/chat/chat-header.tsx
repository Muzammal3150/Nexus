import { MoreVertical, Phone, Video } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { initCall } from '@/features/calls/lib/init-call';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { Room } from '@/features/chats/types/room';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function ChatHeader({ room }: { room: Room }) {
    const router = useRouter();
    async function onCall() {
        const { id } = await initCall({
            memberIds: room.members.map(({ userId }) => userId),
        });
        router.push(`/calls/${id}`);
    }

    return (
        <div className="flex items-center justify-between border-b z-100 sticky top-0 bg-background px-5 py-3">
            <div className="flex items-center gap-3">
                <Avatar className="size-9">
                    <AvatarFallback className={cn('text-xs font-medium')}>
                        {getInitials(room.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-tight">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {/* {true ? 'typing…' : 'last seen recently'} */}
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

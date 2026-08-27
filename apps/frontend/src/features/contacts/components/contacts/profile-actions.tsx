'use client';
import { MessageCircle, Phone, Video, MoreVertical, Ban, Flag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createRoom } from '@/features/chats/components/new-chat/create-room';
import { User } from '@/features/auth/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { initCall } from '@/features/calls/lib/init-call';

interface ProfileActionsProps {
    user: User;
}

export default function ProfileActions({ user }: ProfileActionsProps) {
    const router = useRouter();
    async function onChat() {
        try {
            const room = await createRoom({
                isGroup: false,
                memberIds: [user.id],
            });
            router.push(`/chats/${room.id}`);
        } catch {
            toast.add({
                type: 'error',
                description: 'Error getting room.',
            });
        }
    }

    async function onCall(method: string) {
        try {
            const room = await initCall({
                memberIds: [user.id],
            });
            router.push(`/calls/${room.id}`);
        } catch {
            toast.add({
                type: 'error',
                description: 'Error initing call.',
            });
        }
    }

    return (
        <div className="flex items-center gap-2.5">
            <Button size="lg" onClick={onChat}>
                <MessageCircle className="size-4" />
                Message
            </Button>
            <Button variant="outline" size="lg" onClick={() => onCall('audio')}>
                <Phone className="size-4" />
                Call
            </Button>
            <Button variant="outline" size="lg" onClick={() => onCall('video')}>
                <Video className="size-4" />
                Video
            </Button>

            {/* <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="outline" size="icon" aria-label="More options" />}
                >
                    <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem variant="destructive">
                        <Ban className="size-4" />
                        Block {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                        <Flag className="size-4" />
                        Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu> */}
        </div>
    );
}

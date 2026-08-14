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

// shadcn's DropdownMenu (Radix under the hood) owns its own open state
// internally, so this file no longer needs "use client" or a click-outside
// handler — that's all handled inside components/ui/dropdown-menu.tsx.
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

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="outline" size="icon" aria-label="More options" />}
                >
                    <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    {/* `variant="destructive"` on DropdownMenuItem requires a recent
              shadcn dropdown-menu.tsx — swap for
              className="text-destructive focus:text-destructive" on older versions */}
                    <DropdownMenuItem variant="destructive">
                        <Ban className="size-4" />
                        Block {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                        <Flag className="size-4" />
                        Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

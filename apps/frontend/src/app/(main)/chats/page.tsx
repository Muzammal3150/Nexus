import { Button } from '@/components/ui/button';
import { MessageCircleOff } from 'lucide-react';
import Link from 'next/link';

export default function NoRoomSelected() {
    return (
        <div className="flex flex-1 h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <MessageCircleOff className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight">No room selected</h2>

                <p className="max-w-md text-muted-foreground">
                    Select a room from the sidebar to view messages, or create a new room to start
                    chatting.
                </p>
            </div>

            <Link href="/chats/new">
                <Button>Create Room</Button>
            </Link>
        </div>
    );
}

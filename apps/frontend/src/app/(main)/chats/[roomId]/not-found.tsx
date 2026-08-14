'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useUiStore } from '@/stores/uiStore';
import { ChevronLeft, MessageCirclePlus } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
    const open = useUiStore((state) => state.open);

    return (
        <main className="grid min-h-screen w-full place-items-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Chat Not Found</CardTitle>
                    <CardDescription>We couldn&apos;t find this conversation.</CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        The chat you&apos;re looking for may have been deleted, moved, or the link
                        may be incorrect. Please check the URL or start a new conversation.
                    </p>
                </CardContent>

                <CardFooter className="grid grid-cols-2 gap-2">
                    <Link href="/chats" className="w-full">
                        <Button variant="outline" className="w-full" size="lg">
                            <ChevronLeft />
                            Back to chats
                        </Button>
                    </Link>

                    <Button size="lg" onClick={() => open('new-chat-dialog')}>
                        <MessageCirclePlus />
                        New Chat
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}

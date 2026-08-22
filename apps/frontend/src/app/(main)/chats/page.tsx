'use client';

import { Button } from '@/components/ui/button';
import { RoomsSidebar } from '@/features/chats/components/sidebar/rooms-sidebar';
import { UiState } from '@/stores/uiStore/uis';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { MessageCircle, Plus } from 'lucide-react';

export default function NoRoomSelected() {
    const open = useUiStore((s) => s.open);

    return (
        <>
            <div className="hidden relative sm:flex h-full flex-1 items-center justify-center overflow-hidden bg-muted/20 px-6">
                {/* Subtle background decoration */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06),transparent_45%)]" />

                <div className="relative flex max-w-md flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border bg-background shadow-sm">
                        <MessageCircle className="h-7 w-7 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Start a conversation
                        </h2>

                        <p className="text-sm leading-6 text-muted-foreground">
                            Select a room from the sidebar to continue a conversation, or create a
                            new room to get started.
                        </p>
                    </div>

                    {/* Action */}
                    <Button className="mt-6 gap-2" onClick={() => open(UiState.Chat.NewChatDialog)}>
                        <Plus className="h-4 w-4" />
                        New Chat
                    </Button>
                </div>
            </div>

            <RoomsSidebar className="sm:hidden w-full" />
        </>
    );
}

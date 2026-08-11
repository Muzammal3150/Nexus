'use client';

import { NewChatDialog } from '@/components/chat/new-chat/new-chat-dialog';
import { RoomsList } from '@/components/chat/sidebar/rooms-list';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useEffect, useState, type ReactNode } from 'react';

function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 640px)');

        const update = () => {
            setIsDesktop(mediaQuery.matches);
        };

        update();

        mediaQuery.addEventListener('change', update);

        return () => {
            mediaQuery.removeEventListener('change', update);
        };
    }, []);

    return isDesktop;
}

export default function ChatLayout({ children }: { children: ReactNode }) {
    const isDesktop = useIsDesktop();

    if (!isDesktop) {
        return (
            <div className="h-full w-full">
                {children}
                <NewChatDialog />
            </div>
        );
    }

    return (
        <ResizablePanelGroup className="h-full overflow-auto">
            <ResizablePanel
                defaultSize={320}
                minSize={320}
                collapsible
                maxSize="50%"
                id="chats-sidebar"
            >
                <RoomsList />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id="chats-main-content">
                {children}
                <NewChatDialog />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

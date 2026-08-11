import { NewChatDialog } from '@/components/chat/new-chat/new-chat-dialog';
import { RoomsList } from '@/components/chat/sidebar/rooms-list';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import type { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {/* Desktop */}
            <ResizablePanelGroup className="hidden! h-full overflow-auto sm:flex!">
                <ResizablePanel defaultSize={320} minSize={320} collapsible maxSize="50%">
                    <RoomsList />
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel>
                    {children}
                    <NewChatDialog />
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* Mobile */}
            <div className="flex h-full w-full sm:hidden">
                {children}
                <NewChatDialog />
            </div>
        </>
    );
}

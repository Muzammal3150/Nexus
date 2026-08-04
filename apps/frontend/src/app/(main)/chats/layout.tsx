import { RoomsList } from '@/components/chat/rooms-list';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import type { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <ResizablePanelGroup className="h-full overflow-auto">
            <ResizablePanel defaultSize={320} minSize={320} collapsible maxSize={'50%'}>
                <RoomsList />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>{children}</ResizablePanel>
        </ResizablePanelGroup>
    );
}

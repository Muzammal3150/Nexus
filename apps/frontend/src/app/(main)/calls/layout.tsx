'use client';
import { NewCallDialog } from '@/components/call/new-call/new-call-dialog';
import { CallsSidebar } from '@/components/call/sidebar/calls-sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useUiStore } from '@/stores/uiStore';

import { type ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
    const isOpen = useUiStore((s) => s.isOpen('new-call-dialog'));
    const setOpen = useUiStore((s) => s.setOpen);
    return (
        <>
            <ResizablePanelGroup className="hidden! sm:flex! h-full overflow-auto">
                <ResizablePanel defaultSize={320} minSize={320} collapsible maxSize={'50%'}>
                    <CallsSidebar />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    {children}

                    <NewCallDialog
                        open={isOpen}
                        onOpenChange={(next) => setOpen('new-call-dialog', next)}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
            <div className="flex h-full w-full sm:hidden">
                {children}

                <NewCallDialog
                    open={isOpen}
                    onOpenChange={(next) => setOpen('new-call-dialog', next)}
                />
            </div>
        </>
    );
}

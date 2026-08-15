'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { NewCallDialog } from '@/features/calls/components/new-call/new-call-dialog';
import { CallsSidebar } from '@/features/calls/components/sidebar/calls-sidebar';
import { UiState } from '@/stores/uiStore/uis';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { type ReactNode, useEffect, useState } from 'react';

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

    const isOpen = useUiStore((s) => s.isOpen(UiState.Call.NewCallDialog));
    const setOpen = useUiStore((s) => s.setOpen);

    if (!isDesktop) {
        return (
            <div className="h-full w-full">
                {children}

                <NewCallDialog
                    open={isOpen}
                    onOpenChange={(next) => setOpen(UiState.Call.NewCallDialog, next)}
                />
            </div>
        );
    }

    return (
        <ResizablePanelGroup className="h-full overflow-auto">
            <ResizablePanel
                defaultSize={320}
                minSize={320}
                maxSize="50%"
                collapsible
                id="calls-sidebar"
            >
                <CallsSidebar />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id="calls-main-content">
                {children}

                <NewCallDialog
                    open={isOpen}
                    onOpenChange={(next) => setOpen(UiState.Call.NewCallDialog, next)}
                />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

'use client';
import { NewCallDialog } from '@/components/call/new-call/new-call-dialog';
import { CallsSidebar } from '@/components/call/sidebar/calls-sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useUiStore } from '@/stores/uiStore';

import { useState, type ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
    const [query, setQuery] = useState('');
    const [audioCall, setAudioCall] = useState<{
        name: string;
        colorIndex: 1 | 2 | 3 | 4 | 5;
    } | null>(null);
    const [videoCallActive, setVideoCallActive] = useState(false);

    const isOpen = useUiStore((s) => s.isOpen('new-call-dialog'));
    const setOpen = useUiStore((s) => s.setOpen);

    function startCall(name: string, colorIndex: 1 | 2 | 3 | 4 | 5, method: CallMethod) {
        if (method === 'video') {
            setVideoCallActive(true);
        } else {
            setAudioCall({ name, colorIndex });
        }
    }

    function handleCallFavourite(contact: FavouriteContact, method: CallMethod) {
        startCall(contact.name, contact.colorIndex, method);
    }

    function handleCallBackRecent(call: RecentCall) {
        startCall(call.name, call.colorIndex, call.method);
    }
    return (
        <ResizablePanelGroup className="h-full overflow-auto">
            <ResizablePanel defaultSize={320} minSize={320} collapsible maxSize={'50%'}>
                <CallsSidebar
                    favourites={[]}
                    recents={[]}
                    query={query}
                    onQueryChange={setQuery}
                    onCallFavourite={handleCallFavourite}
                    onCallBackRecent={handleCallBackRecent}
                />
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
    );
}

'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { AddContactDialog } from '@/features/contacts/components/add-contact-dialog';
import { ContactsSidebar } from '@/features/contacts/components/sidebar/contacts-sidebar';
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
                <AddContactDialog />
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
                id="contacts-sidebar"
            >
                <ContactsSidebar />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id="contacts-main-content">
                {children}
                <AddContactDialog />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

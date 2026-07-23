import { AppIconRail } from '@/components/layout/app-icon-rail';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatProvider } from '@/lib/chat-provider';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ChatProvider>
            <SidebarProvider className="h-dvh">
                <div className="flex h-full w-full">
                    <AppIconRail />
                    {children}
                </div>
            </SidebarProvider>
        </ChatProvider>
    );
}

import { CallToaster } from '@/components/call/CallToaster';
import { AppIconRail } from '@/components/layout/app-icon-rail';
import { SessionProvider } from '@/components/providers/session-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toast';
import { getSession } from '@/lib/auth/authServer';
import { CallSocketProvider } from '@/lib/call/call-socket-provider';
import { ChatSocketProvider } from '@/lib/chat/chat-socket-provider';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

export default async function MainLayout({ children }: { children: ReactNode }) {
    const session = await getSession({ headers: await headers() });

    return (
        <SessionProvider session={session}>
            <ChatSocketProvider>
                <CallSocketProvider>
                    <SidebarProvider className="h-dvh">
                        <div className="flex max-sm:flex-col h-full w-full">
                            <AppIconRail />
                            <div className="flex-1 overflow-auto h-full">{children}</div>
                        </div>
                    </SidebarProvider>
                    <Toaster />
                    <CallToaster />
                </CallSocketProvider>
            </ChatSocketProvider>
        </SessionProvider>
    );
}

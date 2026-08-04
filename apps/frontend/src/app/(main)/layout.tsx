import { SessionProvider } from '@/components/auth/session-provider';
import { CallToaster } from '@/components/call/CallToaster';
import { AppIconRail } from '@/components/layout/app-icon-rail';
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
                        <div className="flex h-full w-full">
                            <AppIconRail />
                            {children}
                        </div>
                    </SidebarProvider>
                    <Toaster />
                    <CallToaster />
                </CallSocketProvider>
            </ChatSocketProvider>
        </SessionProvider>
    );
}

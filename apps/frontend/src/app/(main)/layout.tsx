import { AppIconRail } from '@/components/layout/app-icon-rail';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toast';
import { getSession } from '@/features/auth/lib/auth-server';
import { SessionProvider } from '@/features/auth/providers/session-provider';
import { CallToaster } from '@/features/calls/components/call-toaster';
import { CallSocketProvider } from '@/features/calls/providers/call-socket-provider';
import { ChatSocketProvider } from '@/features/chats/providers/chat-socket-provider';
import { ContactsProvider } from '@/features/contacts/components/contact-provider';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

export default async function MainLayout({ children }: { children: ReactNode }) {
    const session = await getSession({ headers: await headers() });

    return (
        <SessionProvider session={session}>
            <ChatSocketProvider>
                <CallSocketProvider>
                    <ContactsProvider>
                        <SidebarProvider className="h-dvh">
                            <div className="flex max-sm:flex-col h-full w-full">
                                <AppIconRail />
                                <div className="flex-1 overflow-auto h-full">{children}</div>
                            </div>
                        </SidebarProvider>
                        <Toaster />
                        <CallToaster />
                    </ContactsProvider>
                </CallSocketProvider>
            </ChatSocketProvider>
        </SessionProvider>
    );
}

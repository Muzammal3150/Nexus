'use client';

import { ContactRoundIcon, MessageCircle, Phone, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NavUser } from './nav-user';
import Image from 'next/image';
const sidebarItems = {
    chats: {
        url: '/chats',
        icon: MessageCircle,
        title: 'Chats',
    },
    calls: {
        url: '/calls',
        icon: Phone,
        title: 'Calls',
    },
    contacts: {
        url: '/contacts',
        icon: ContactRoundIcon,
        title: 'Contacts',
    },
};

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

function DesktopSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="none" className="h-screen w-17 border-r">
            <SidebarHeader className="items-center py-4">
                <div className="flex size-9 items-center justify-center rounded-lg text-primary-foreground">
                    <Image src={'/icon.png'} width={25} height={25} alt={'logo'} />
                </div>
            </SidebarHeader>

            <SidebarContent className="items-center">
                <SidebarMenu className="items-center gap-1">
                    {Object.entries(sidebarItems).map(([key, item]) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.url);

                        return (
                            <SidebarMenuItem key={key}>
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Link href={item.url}>
                                                <SidebarMenuButton
                                                    isActive={isActive}
                                                    className="size-11 justify-center rounded-lg p-0"
                                                >
                                                    <Icon className="size-5" />
                                                    <span className="sr-only">{item.title}</span>
                                                </SidebarMenuButton>
                                            </Link>
                                        }
                                    />

                                    <TooltipContent side="right">{item.title}</TooltipContent>
                                </Tooltip>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="items-center pb-4">
                <SidebarMenuItem>
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Link href={'/settings'}>
                                    <SidebarMenuButton
                                        isActive={pathname.startsWith('/settings')}
                                        className="size-11 justify-center rounded-lg p-0"
                                    >
                                        <SettingsIcon className="size-5" />
                                    </SidebarMenuButton>
                                </Link>
                            }
                        />

                        <TooltipContent side="right">Settings</TooltipContent>
                    </Tooltip>
                </SidebarMenuItem>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="max-sm:order-last z-50 border-t bg-background/90 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
            <div className="mx-auto flex h-18 max-w-md items-center justify-around gap-2">
                {Object.entries(sidebarItems).map(([key, item]) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.url);

                    return (
                        <Link
                            key={key}
                            href={item.url}
                            className="flex min-w-20 flex-1 flex-col items-center justify-center gap-1.5 py-2"
                        >
                            <div
                                className={`
                  flex size-10 items-center justify-center rounded-xl
                  transition-all
                  ${
                      isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-muted/60'
                  }
                `}
                            >
                                <Icon className="size-5" />
                            </div>

                            <span
                                className={`
                  text-[11px] font-medium
                  ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                `}
                            >
                                {item.title}
                            </span>
                        </Link>
                    );
                })}

                <div className="flex min-w-20 flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-1.5 py-2">
                        <div className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60">
                            <NavUser />
                        </div>

                        <span className="text-[11px] font-medium text-muted-foreground">
                            Profile
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export function AppIconRail() {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DesktopSidebar />;
    }

    return <MobileBottomNav />;
}

'use client';

import { MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
};

export function AppIconRail() {
    const pathname = usePathname();

    return (
        <Sidebar
            collapsible="none"
            className="
max-sm:order-last
        h-16 w-full
        border-t border-r-0
        bg-background
        justify-center
        max-sm:flex-row!
        sm:static sm:h-screen sm:w-17
        sm:border-t-0 sm:border-r
      "
        >
            {/* Logo - desktop only */}
            <SidebarHeader className="hidden sm:flex items-center py-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <MessageCircle className="size-4.5" />
                </div>
            </SidebarHeader>

            <SidebarContent className="max-sm:flex-none! w-fit items-center p-2.5 max-sm:h-fit">
                <SidebarMenu className="flex-row  items-center justify-center gap-2 sm:flex-col sm:gap-1">
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

            {/* User - desktop only */}
            <SidebarFooter className="flex items-center list-none px-0 sm:pb-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

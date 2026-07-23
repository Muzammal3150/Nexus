'use client';

import { MessageCircle, Settings } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = {
    chats: {
        url: '/chats',
        icon: MessageCircle,
        title: 'Chats',
    },
};

export function AppIconRail() {
    const pathname = usePathname();
    return (
        <Sidebar collapsible="none" className="w-17 border-r">
            <SidebarHeader className="items-center py-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <MessageCircle className="size-4.5" />
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

            <SidebarFooter className="items-center gap-3 pb-4">
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                type="button"
                                className="flex size-11 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            />
                        }
                    >
                        <Settings className="size-5" />
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                type="button"
                                className="flex size-11 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            />
                        }
                    >
                        <Avatar className="size-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                                YS
                            </AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">Your profile</TooltipContent>
                </Tooltip>
            </SidebarFooter>
        </Sidebar>
    );
}

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth/auth';
import { Bell, CircleUser, LogOut } from 'lucide-react';
import { useRouter } from 'next/dist/client/components/navigation';
import { useSession } from '../auth/session-provider';

export function NavUser() {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const session = useSession();

    if (!session) {
        return null;
    }
    const logOut = async () => {
        await authClient.signOut();
        router.push('/login');
    };
    return (
        <SidebarMenuItem className="hover:bg-transparent">
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <SidebarMenuButton
                            size="lg"
                            className="hover:bg-transparent active:bg-transparent group"
                        />
                    }
                >
                    <Avatar className="size-8 rounded-full group-hover:border-primary border-2 border-transparent aria-expanded:border-primary">
                        <AvatarImage alt={session.user.name} />
                        <AvatarFallback className="rounded-full">
                            {session.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-56"
                    side={isMobile ? 'bottom' : 'right'}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="size-8 bg-transparent!">
                                    <AvatarImage
                                        src={session.user.image!}
                                        alt={session.user.name}
                                    />
                                    <AvatarFallback>
                                        {session.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {session.user.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <CircleUser />
                            Account
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            <Bell />
                            Notifications
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logOut()}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

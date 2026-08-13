import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

// Menu items.
const items = [
    {
        title: 'Account',
        url: '#account',
    },
    {
        title: 'Avatar',
        url: '#avatar',
    },
    {
        title: 'Change Password',
        url: '#change-password',
    },
    {
        title: 'Delete Account',
        url: '#delete-account',
    },
];

export default function ProfileSideBar() {
    return (
        <Sidebar variant="floating" className="bg-background sticky top-2 pt-8 h-fit">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        render={
                                            <a href={item.url}>
                                                <span>{item.title}</span>
                                            </a>
                                        }
                                    />
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

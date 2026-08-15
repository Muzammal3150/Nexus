import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DrawerTrigger } from '@/components/ui/drawer';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '../../lib/utils-chat';

interface GroupInfoTriggerProps {
    group: GroupInfo;
    memberCount: number;
}

export function GroupInfoTrigger({ group, memberCount }: GroupInfoTriggerProps) {
    return (
        <DrawerTrigger render={<Button />}>
            <Avatar className="h-11 w-11">
                <AvatarImage src={group.avatarUrl} alt={group.name} />
                <AvatarFallback>{getInitials(group.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{group.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                    {memberCount} members · tap for group info
                </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </DrawerTrigger>
    );
}

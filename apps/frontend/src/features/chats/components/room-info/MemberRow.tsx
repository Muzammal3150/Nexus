import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { getInitials } from '../../lib/utils-chat';
import { RoomMember } from '../../types/room';
import { getAvatar } from '@/features/auth/lib/utils';

interface MemberRowProps {
    member: RoomMember;
    isYou: boolean;
}

export function MemberRow({ member, isYou }: MemberRowProps) {
    return (
        <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="relative">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={getAvatar(member.user.image)} alt={member.user.name} />
                    <AvatarFallback className="text-xs">
                        {getInitials(member.user.name)}
                    </AvatarFallback>
                </Avatar>
                {/* {member.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                )} */}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {member.user.name}
                    {isYou && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (you)
                        </span>
                    )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.user.username}</p>
            </div>

            {member.role === 'admin' && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Shield className="h-3 w-3" />
                    Admin
                </Badge>
            )}
        </div>
    );
}

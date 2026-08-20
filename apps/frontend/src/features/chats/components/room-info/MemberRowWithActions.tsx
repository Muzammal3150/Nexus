import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Shield, ShieldOff, UserMinus } from 'lucide-react';
import { RoomMember } from '../../types/room';
import { getInitials } from '../../lib/utils-chat';
import { getAvatar } from '@/features/auth/lib/utils';

interface MemberRowWithActionsProps {
    member: RoomMember;
    isYou: boolean;
    canManage: boolean;
    onToggleRole: (member: RoomMember) => void;
    onRemove: (member: RoomMember) => void;
}

export function MemberRowWithActions({
    member,
    isYou,
    canManage,
    onToggleRole,
    onRemove,
}: MemberRowWithActionsProps) {
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

            {canManage && !isYou && (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground"
                                aria-label={`Options for ${member.user.name}`}
                            />
                        }
                    >
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onToggleRole(member)}>
                            {member.role === 'admin' ? (
                                <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Remove as admin
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make admin
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onRemove(member)}
                        >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from group
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

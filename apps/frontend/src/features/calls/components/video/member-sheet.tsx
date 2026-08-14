'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CallMember } from '@/features/calls/types/calls';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { cn } from '@/lib/utils';

interface MemberSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: CallMember[];
}

export function MemberSheet({ open, onOpenChange, members }: MemberSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-80">
                <SheetHeader>
                    <SheetTitle>In this call ({members.length})</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 px-4 pb-4">
                    {members.map((member) => (
                        <div
                            key={member.user.id}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/60"
                        >
                            <Avatar className="size-9">
                                <AvatarFallback className={cn('text-xs font-medium')}>
                                    {getInitials(member.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="flex-1 truncate text-sm">
                                {member.user.name}
                                {member.isSelf ? ' (You)' : ''}
                            </span>
                            {/* {!member.state.mic && (
                                <MicOff className="size-4 text-muted-foreground" />
                            )}
                            {!member.state.camera && (
                                <VideoOff className="size-4 text-muted-foreground" />
                            )} */}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

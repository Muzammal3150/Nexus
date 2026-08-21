'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUpload } from '@/lib/utils';
import { MessageCircle, MoreVertical, Phone, Shield, ShieldOff, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getInitials } from '../../lib/utils-chat';
import { RoomMember } from '../../types/room';
import { initCall } from '@/features/calls/lib/init-call';
import { createRoom } from '../new-chat/create-room';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

interface MemberRowWithActionsProps {
    member: RoomMember;
    isYou: boolean;
    canManage: boolean;
}

export function MemberRowWithActions({ member, isYou, canManage }: MemberRowWithActionsProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isChatting, setIsChatting] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    async function onChat(member: RoomMember) {
        if (isChatting) return;

        try {
            setIsChatting(true);

            const room = await createRoom({
                isGroup: false,
                name: member.user.name,
                memberIds: [member.user.id],
            });

            router.push(`/chats/${room.id}`);
        } catch (error) {
            console.error('Failed to create chat:', error);

            toast.add({
                type: 'error',
                title: 'Could not start chat',
                description: 'Something went wrong while creating the chat.',
            });
        } finally {
            setIsChatting(false);
        }
    }

    async function onCall(member: RoomMember) {
        if (isCalling) return;

        try {
            setIsCalling(true);

            const room = await initCall({
                memberIds: [member.user.id],
            });

            router.push(`/calls/${room.id}`);
        } catch (error) {
            console.error('Failed to start call:', error);

            toast.add({
                type: 'error',
                title: 'Could not start call',
                description: 'Something went wrong while starting the call.',
            });
        } finally {
            setIsCalling(false);
        }
    }

    async function handleUpdateRole() {
        if (isUpdating || isRemoving) return;

        const role = member.role === 'admin' ? 'member' : 'admin';

        try {
            setIsUpdating(true);

            await api.patch(`/rooms/${member.roomId}/members/${member.user.id}`, {
                role,
            });

            toast.add({
                type: 'success',
                title: role === 'admin' ? 'Member promoted' : 'Admin privileges removed',
                description:
                    role === 'admin'
                        ? `${member.user.name} is now an admin.`
                        : `${member.user.name} is no longer an admin.`,
            });

            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        } catch (error) {
            console.error('Failed to update member:', error);

            toast.add({
                type: 'error',
                title: 'Could not update member',
                description: error instanceof Error ? error.message : 'Something went wrong.',
            });
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleRemove() {
        if (isRemoving || isUpdating) return;

        try {
            setIsRemoving(true);

            await api.delete(`/rooms/${member.roomId}/members/${member.user.id}`);

            toast.add({
                type: 'success',
                title: 'Member removed',
                description: `${member.user.name} has been removed from the group.`,
            });

            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        } catch (error) {
            console.error('Failed to remove member:', error);

            toast.add({
                type: 'error',
                title: 'Could not remove member',
                description: error instanceof Error ? error.message : 'Something went wrong.',
            });
        } finally {
            setIsRemoving(false);
        }
    }

    const isBusy = isUpdating || isRemoving;

    return (
        <div className="group flex min-w-0 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40">
            <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={getUpload(member.user.image)} alt={member.user.name} />
                <AvatarFallback className="text-xs">{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-sm font-medium">{member.user.name}</p>
                    {isYou && <span className="shrink-0 text-xs text-muted-foreground">(you)</span>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{member.user.username}</p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
                {member.role === 'admin' && (
                    <Badge variant="secondary" className="mr-1 gap-1 px-2 text-[10px] font-medium">
                        <Shield className="h-3 w-3" />
                        Admin
                    </Badge>
                )}

                {!isYou && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isChatting || isBusy}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => onChat(member)}
                            aria-label={`Chat with ${member.user.name}`}
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isCalling || isBusy}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => onCall(member)}
                            aria-label={`Call ${member.user.name}`}
                        >
                            <Phone className="h-4 w-4" />
                        </Button>
                    </>
                )}

                {canManage && !isYou && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={isBusy}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label={`Options for ${member.user.name}`}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            }
                        />

                        <DropdownMenuContent align="end" className="w-max min-w-0 p-1">
                            <DropdownMenuItem
                                disabled={isBusy}
                                onClick={handleUpdateRole}
                                className="whitespace-nowrap"
                            >
                                {member.role === 'admin' ? (
                                    <>
                                        <ShieldOff className="h-4 w-4 text-muted-foreground" />
                                        Remove as admin
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        Make admin
                                    </>
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled={isBusy}
                                onClick={handleRemove}
                                variant="destructive"
                                className="whitespace-nowrap"
                            >
                                <UserMinus className="h-4 w-4" />
                                {isRemoving ? 'Removing...' : 'Remove from group'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}

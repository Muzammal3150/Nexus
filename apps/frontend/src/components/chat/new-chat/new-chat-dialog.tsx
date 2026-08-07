'use client';

import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { DirectChatForm } from './direct-chat-form';
import { GroupChatForm } from './group-chat-form';
import { ModeToggle } from './mode-toggle';

import { Room } from '@/types/room';
import { useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/stores/uiStore';

const dialogId = 'new-chat-dialog';

export function NewChatDialog() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const open = useUiStore((s) => s.isOpen(dialogId));
    const setOpen = useUiStore((s) => s.setOpen);

    const [mode, setMode] = useState<'direct' | 'group'>('direct');

    function handleSuccess(newRoom: Room) {
        setOpen(dialogId, false);

        queryClient.setQueryData(['get-rooms'], (prev: Room[] = []) => {
            if (prev.some((room) => room.id === newRoom.id)) {
                return prev;
            }

            return [newRoom, ...prev];
        });

        router.push(`/chats/${newRoom.id}`);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(dialogId, next);

                if (!next) {
                    setMode('direct');
                }
            }}
        >

            <DialogContent className="max-w-md p-0">
                <Card className="border-0 shadow-none">
                    <CardHeader className="gap-3">
                        <CardTitle>New Chat</CardTitle>

                        <ModeToggle mode={mode} onChange={setMode} />

                        <CardDescription>
                            {mode === 'direct'
                                ? "Enter a member's details, then create the chat."
                                : 'Add 2 or more members and name your group.'}
                        </CardDescription>
                    </CardHeader>

                    {mode === 'direct' ? (
                        <DirectChatForm key="direct" onSuccess={handleSuccess} />
                    ) : (
                        <GroupChatForm key="group" onSuccess={handleSuccess} />
                    )}
                </Card>
            </DialogContent>
        </Dialog>
    );
}

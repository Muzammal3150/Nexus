'use client';

import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { DirectChatForm } from './direct-chat-form';
import { GroupChatForm } from './group-chat-form';
import { ModeToggle } from './mode-toggle';
import { Room } from '@/types/room';
import { useQueryClient } from '@tanstack/react-query';

export function NewChatPopover() {
    const router = useRouter();

    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'direct' | 'group'>('direct');

    function handleSuccess(newRoom: Room) {
        setOpen(false);
        queryClient.setQueryData(['get-rooms'], (prev: Room[]) => {
            if (prev.some((room) => room.id === newRoom.id)) return prev;

            return [newRoom, ...prev];
        });

        router.push(`/chats/${newRoom.id}`);
    }

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) setMode('direct');
            }}
        >
            <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
                <UserPlus className="h-4 w-4" />
                New Chat
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0" align="end">
                <Card className="w-full border-0 shadow-none">
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
            </PopoverContent>
        </Popover>
    );
}

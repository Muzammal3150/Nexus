import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, MessageSquareOff, Trash2 } from 'lucide-react';
import { Room } from '../../types/room';
import { db } from '@/db/db';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

interface GroupActionsProps {
    isAdmin: boolean;
    room: Room;
}

export function GroupActions({ isAdmin, room }: GroupActionsProps) {
    const queryClient = useQueryClient();
    async function onClearChat() {
        try {
            await db.messages.where('roomId').equals(room.id).delete();
            toast.add({
                type: 'success',
                description: 'Chats cleared successfully.',
            });
        } catch {
            toast.add({
                type: 'error',
                description: 'Something went wrong.',
            });
        }
    }

    async function onLeave() {
        try {
            const res = await api.post(`/rooms/${room.id}/leave`);
            toast.add({
                type: 'success',
                description: `Group ${room.name} leaved successfully.`,
            });
            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        } catch (error: any) {
            console.log(Object.entries(error));
            toast.add({
                type: 'error',
                description: error?.response?.data?.message ?? 'Something went wrong.',
            });
        }
    }

    async function onDelete() {
        try {
            const res = await api.post(`/rooms/${room.id}/leave`);
            toast.add({
                type: 'success',
                description: `Group ${room.name} leaved successfully.`,
            });
            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        } catch (error: any) {
            console.log(Object.entries(error));
            toast.add({
                type: 'error',
                description: error?.response?.data?.message ?? 'Something went wrong.',
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Mute notifications</p>
          <p className="text-xs text-muted-foreground">
            Pause alerts for this chat
          </p>
        </div>
        <Switch checked={muted} onCheckedChange={onMutedChange} />
      </div> */}

            <Separator />

            <div className="space-y-1 ">
                <Button
                    variant="destructive"
                    size={'lg'}
                    className="w-full justify-start "
                    onClick={onClearChat}
                >
                    <MessageSquareOff className="h-4 w-4" />
                    Clear chat history
                </Button>

                <Button
                    variant="destructive"
                    size={'lg'}
                    className="w-full justify-start"
                    onClick={onLeave}
                >
                    <LogOut className="h-4 w-4" />
                    Leave group
                </Button>

                {isAdmin && (
                    <Button
                        variant="destructive"
                        size={'lg'}
                        className="w-full justify-start "
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete group
                    </Button>
                )}
            </div>
        </div>
    );
}

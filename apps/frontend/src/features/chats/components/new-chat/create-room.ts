import { Room } from '@/features/chats/types/room';
import { api } from '@/lib/axios';
import { chatSocket } from '@/lib/socket';

interface RoomCreateResponse {
    room?: Room;
    error?: string;
}

export async function createRoom(payload: {
    isGroup: boolean;
    name?: string;
    memberIds: string[];
}) {
    try {
        const response = await api.post<RoomCreateResponse>('/rooms', payload);

        if (!response.data.room) {
            throw new Error(response.data.error ?? 'Failed to create room.');
        }

        const room = response.data.room;

        chatSocket.emit('room:create', {
            roomId: room.id,
        });

        return room;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Failed to create room. Please try again.');
    }
}
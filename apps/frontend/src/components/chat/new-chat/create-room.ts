import { chatSocket } from '@/lib/socket';
import { Room } from '@/types/room';

type RoomCreateResponse =
    | { success: true; room: Room }
    | { success: false; error?: string };

export function createRoom(payload: {
    isGroup: boolean;
    name?: string;
    memberIds: string[];
}): Promise<Room> {
    return new Promise((resolve, reject) => {

        chatSocket.emit('room:create', payload, (response: RoomCreateResponse) => {
            if (response.success) resolve(response.room);
            else reject(new Error(response.error ?? 'Failed to create room.'));
        });
    });
}

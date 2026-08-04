import { callSocket } from '@/lib/socket';
import { CallRoom } from '@/types/calls';

type RoomCreateResponse =
    | { success: true; room: CallRoom }
    | { success: false; error?: string };

export function initCall(payload: {

    memberIds: string[];
}): Promise<CallRoom> {
    return new Promise((resolve, reject) => {
        callSocket.emit('call:init', payload, (response: RoomCreateResponse) => {
            if (response.success) resolve(response.room);
            else reject(new Error(response.error ?? 'Failed to create call.'));
        });
    });
}

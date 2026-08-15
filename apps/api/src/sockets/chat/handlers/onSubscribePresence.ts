import type { Socket } from 'socket.io';

interface PresenceSubscribePayload {
    userId: string;
}

function validate(socket: Socket, data: unknown): data is PresenceSubscribePayload {
    if (!data || typeof data !== 'object') return false;

    const payload = data as Record<string, unknown>;

    if (typeof payload.userId !== 'string') return false;
    if (!socket.data.user?.id) return false;
    
    return true;
}

export async function onPresenceSubscribe(
    socket: Socket,
    data: unknown,
) {
    if (!validate(socket, data)) {
        return;
    }

    const { userId } = data;

    socket.join(`presence:${userId}`);
}
import type { Socket } from 'socket.io';

interface TypingPayload {
    roomId: string;
    isTyping: boolean;
}

function validate(
    socket: Socket,
    data: unknown,
): data is TypingPayload {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const payload = data as Record<string, unknown>;

    if (typeof payload.roomId !== 'string') {
        return false;
    }

    if (typeof payload.isTyping !== 'boolean') {
        return false;
    }

    if (!socket.data.user?.id) {
        return false;
    }

    return true;
}

export function onTyping(socket: Socket,data: unknown) {
    if (!validate(socket, data)) return;

    const { roomId, isTyping } = data;

    if (!socket.rooms.has(roomId)) {
        return;
    }

    socket.to(roomId).emit('chat:typing-broadcast', {
        roomId,
        userId: socket.data.user.id,
        isTyping,
    });
}
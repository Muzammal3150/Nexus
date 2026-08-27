import type { Socket } from "socket.io";
import { z } from "zod";
import { CallEvents } from "../events.js";
import type { CallContext } from "../types.js";

const roomActionPayloadSchema = z.object({
    roomId: z.string().trim().min(1, "A valid roomId is required"),
});

type RoomActionPayload = z.infer<typeof roomActionPayloadSchema>;
type CallLeaveCallback = (response: {
    success: true;
    alreadyGone?: boolean;
}) => void;

function validate(socket: Socket, data: unknown): RoomActionPayload | null {
    const result = roomActionPayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(CallEvents.Error, { message: result.error.issues[0]?.message ?? "Invalid room payload" });
        return null;
    }

    return result.data;
}

export async function onCallLeave(
    ctx: CallContext,
    socket: Socket,
    data: unknown,
    callback?: CallLeaveCallback,
) {
    const payload = validate(socket, data);
    if (!payload) return;

    console.log(socket.data.user.name, payload.roomId, "left");

    let room;

    try {
        room =  ctx.callManager.leave(payload.roomId, socket.data.user);
    } catch (error) {
        console.error(`Error leaving call ${payload.roomId}:`, error);

        socket.emit(CallEvents.Error, { message: "Failed to leave call" });
        return;
    }

    if (!room) {
        callback?.({ success: true, alreadyGone: true });
        return;
    }

    socket.leave(room.id);

    ctx.io.to(room.id).emit(CallEvents.LeaveBroadcast, { user: socket.data.user });

    if (room.joinedUserIds.size === 0) {
        try {
            ctx.callManager.removeRoom(room.id);
        } catch (error) {
            console.error(`Failed to remove empty room ${room.id}:`, error);
        }
    }

    callback?.({ success: true });
}
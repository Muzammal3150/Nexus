import { User } from '@/features/auth/lib/auth';
import { Room } from "@/features/chats/types/room";


export function formatDirectRoom(room: Room, user: User): Room {
    if (room.isGroup) return room;
    const other = room.members.filter(({ userId }) => user.id != userId)[0];
    if (!other) return { ...room, name: "You", image: user.image };

    return { ...room, name: other.user.name, image: other.user.image };
}
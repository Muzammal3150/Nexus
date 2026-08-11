import { Room } from "@/types/room";
import { User } from '@/lib/auth/auth';


export function formatDirectRoom(room: Room, user: User) {
    if (room.isGroup) return room;
    const other = room.members.filter(({ userId }) => user.id != userId)[0];
    if (!other) return { ...room, name: "You", image: user.image };

    return { ...room, name: other.user.name, image: other.user.image };
}
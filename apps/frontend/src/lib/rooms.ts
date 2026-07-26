import { Room } from "@/types/room";
import { Session, User } from "better-auth";

export function formatDirectRoom(room: Room,user:User) {
    if (room.isGroup) return room;
    const other = room.members.filter(({ userId }) => user.id != userId)[0];


    console.log({ ...room, name: other.user.name, image: other.user.image });
    return { ...room, name: other.user.name, image: other.user.image };
}
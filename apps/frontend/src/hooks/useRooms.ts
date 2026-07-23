"use client";

import { db } from "@/db/db";
import type { CachedUser, RoomWithMembers } from "@/db/db.d";
import { useLiveQuery } from "dexie-react-hooks";

export function useRooms() {

    const rooms = useLiveQuery<RoomWithMembers[]>(async () => {

        const roomList = await db.rooms.toArray();

        return Promise.all(
            roomList.map(async room => {

                const memberships = await db.roomMembers
                    .where("roomId")
                    .equals(room.id)
                    .toArray();

                const members = (await Promise.all(memberships.map(member => db.users.get(member.userId))))
                    .filter((user): user is CachedUser => user !== undefined);

                return { ...room, members };

            })
        );

    }, []);



    return rooms ?? [];

}


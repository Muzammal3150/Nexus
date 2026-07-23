import { db } from "@/db/db";
import { CachedUser, Room, RoomWithMembers } from "@/db/db.d";

export async function addRoom(room: Omit<Room, "id">, members: CachedUser[] = []) {
    const id = crypto.randomUUID();

    await db.transaction(
        "rw",
        db.rooms,
        db.roomMembers,
        db.users,
        async () => {

            await db.rooms.add({ id, ...room });
            await db.users.bulkPut(members);
            await db.roomMembers.bulkPut(
                members.map(user => ({
                    roomId: id,
                    userId: user.id
                }))
            );

        }
    );

    return id;

}


// Upsert a single user into the cache.
export async function cacheUser(user: CachedUser) {
    await db.users.put(user);
}

// Upsert many users into the cache in one batched write.
export async function cacheUsers(users: CachedUser[]) {
    if (users.length === 0) return;
    await db.users.bulkPut(users);
}


export async function deleteRoom(id: Room["id"]) {

    await db.transaction(
        "rw",
        db.rooms,
        db.roomMembers,
        async () => {

            await db.rooms.delete(id);

            await db.roomMembers
                .where("roomId")
                .equals(id)
                .delete();

        }
    );

}


export async function removeMember(
    roomId: Room["id"],
    userId: CachedUser["id"]
) {
    throw Error("Under construction")
    // await db.roomMembers.delete([
    //     roomId,
    //     userId
    // ]);

}

export async function getRoom(id: Room["id"]): Promise<RoomWithMembers | null> {

    const room = await db.rooms.get(id);
    if (!room) return null;


    const memberships = await db.roomMembers
        .where("roomId")
        .equals(id)
        .toArray();

    const members = (await Promise.all(memberships.map(member => db.users.get(member.userId))))
        .filter((user): user is CachedUser => user !== undefined);

    return { ...room, members };

}

export async function updateRoom(id: Room["id"], updates: Partial<Omit<Room, "id">>) {
    await db.rooms.update(id, updates);
}

export async function addMember(roomId: Room["id"], user: CachedUser) {

    await db.transaction(
        "rw",
        db.roomMembers,
        db.users,
        async () => {

            await db.users.put(user);

            await db.roomMembers.put({
                roomId,
                userId: user.id
            });

        }
    );

}

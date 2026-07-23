import Dexie, { type Table } from "dexie";
import {CachedUser, Room, RoomMember } from './db.d'
export class AppDb extends Dexie {

    users!: Table<CachedUser,string>;
    rooms!: Table<Room, string>;
    roomMembers!: Table<RoomMember, string>;

    constructor() {
        super("nexsus");

        this.version(1).stores({
            users: "id, name, email, image",
            rooms: "id, name",
            roomMembers: "[roomId+userId], roomId, userId"
        });
    }
}

export const db = new AppDb();
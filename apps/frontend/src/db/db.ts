import Dexie, { type Table } from "dexie";
import { CachedMessage } from './db.d';
export class AppDb extends Dexie {
    messages!: Table<CachedMessage, string>;

    constructor() {
        super("nexsus");

        this.version(2).stores({
            messages: "id, roomId, type, body, senderId, sendedAt, read"
        });
    }
}

export const db = new AppDb();
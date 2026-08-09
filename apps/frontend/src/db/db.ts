import Dexie, { type Table } from "dexie";
import { CachedFile, CachedMessage } from "./db.d";

export class AppDb extends Dexie {
    messages!: Table<CachedMessage, string>;
    files!: Table<CachedFile, string>;


    constructor() {
        super("nexus");

        this.version(2).stores({
            messages: "id, roomId, senderId, sentAt, type",
            files: "id"
        });
    }
}

export const db = new AppDb();
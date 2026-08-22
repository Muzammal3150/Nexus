import Dexie, { type Table } from "dexie";
import { CachedContact, CachedFile, CachedMessage, SysMessage } from "./db.d";

export class AppDb extends Dexie {
    messages!: Table<CachedMessage, string>;
    files!: Table<CachedFile, string>;
    contacts!: Table<CachedContact, string>;
    sysMessages!: Table<SysMessage, string>;


    constructor() {
        super("nexus");

        this.version(3).stores({
            messages: "id, roomId, senderId, sentAt, type",
            files: "id",
            contacts: "userId, name, createdAt",
            sysMessages: "id, roomId, code, sentAt"
        });
    }
}

export const db = new AppDb();
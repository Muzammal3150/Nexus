import { db } from "@/db/db";
import { CachedContact, CachedMessage } from "@/db/db.d";



export async function addContact(contact: CachedContact) {
    await db.transaction("rw", db.contacts, async () => {
        await db.contacts.add(contact)
    })
}


export async function deleteContact(userId: string) {
    await db.transaction("rw", db.contacts, async () => {
        await db.contacts.delete(userId)
    })
}

export async function getMessage(id: CachedMessage["id"]) {
    const message = await db.contacts.get(id);
    if (!message) return null;
    return message;

}



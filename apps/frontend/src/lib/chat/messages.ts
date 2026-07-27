import { db } from "@/db/db";
import { Message } from "@/db/db.d";


export async function addMessage(message: Message) {
    await db.transaction("rw", db.messages, async () => {
        await db.messages.add(message)
    })
}


export async function deleteMessage(id: Message['id']) {
    await db.transaction("rw", db.messages, async () => {
        await db.messages.delete(id)
    })
}


export async function getMessage(id: Message["id"]) {
    const message = await db.messages.get(id);
    if (!message) return null;
    return message;

}
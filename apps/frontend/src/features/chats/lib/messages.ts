import { db } from "@/db/db";
import { CachedMessage } from "@/db/db.d";


export async function addMessage(message: CachedMessage): Promise<boolean> {
    try {
        await db.transaction('rw', db.messages, async () => {
            await db.messages.add(message);
        });

        return true;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'ConstraintError') {
            return false;
        }

        throw error;
    }
}

export async function deleteMessage(id: CachedMessage['id']) {
    await db.transaction("rw", db.messages, async () => {
        await db.messages.delete(id)
    })
}
export async function updateMessage(
    id: CachedMessage["id"],
    changes: Record<string, unknown>,
) {
    await db.messages.update(id, changes);
}
export async function getMessage(id: CachedMessage["id"]) {
    const message = await db.messages.get(id);
    if (!message) return null;
    return message;

}



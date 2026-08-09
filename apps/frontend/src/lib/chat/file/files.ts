import { db } from "@/db/db"

export async function addCacheFile(file: File) {

    const fileId = crypto.randomUUID()
    await db.transaction("rw", db.files, async () => {
        await db.files.add({
            file,
            id: fileId,
        })
    })
    return fileId
}
export async function getCacheFile(id: string) {
    const file = await db.files.get(id);
    if (!file) return null;
    return file.file;
}





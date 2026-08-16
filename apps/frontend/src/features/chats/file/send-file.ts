import axios from "axios";

import { toast } from "@/components/ui/toast";
import { addMessage, updateMessage } from "../lib/messages";

import { addCacheFile } from "./files";
import { api } from "@/lib/axios";
import { chatSocket } from "@/lib/socket";

interface SendChatFilesOptions {
    files: File[];
    roomId: string;
    senderId: string;
}

interface UploadedFile {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
}

export async function sendChatFiles({
    files,
    roomId,
    senderId,
}: SendChatFilesOptions) {
    await Promise.all(
        files.map(async (file) => {
            const id = crypto.randomUUID();
            const fileId = await addCacheFile(file);

            await addMessage({
                id,
                type: "file",
                roomId,
                senderId,
                attachment: {
                    fileId,
                    originalFilename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    status: "uploading",
                    uploadProgress: 0,
                    downloadProgress: 0,
                },
                isRead: true,
                sentAt: Date.now(),
            });

            void uploadFile({
                id,
                roomId,
                fileId,
                file,
            });
        }),
    );
}

async function uploadFile({
    id,
    fileId,
    roomId,
    file,
}: {
    id: string;
    fileId: string;
    roomId: string;
    file: File;
}) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const { data } = await api.post<{ file: UploadedFile }>(
            "/uploads/chat",
            formData,
            {
                onUploadProgress(e) {
                    if (!e.total) return;

                    void updateMessage(id, {
                        "attachment.uploadProgress": Math.round(
                            (e.loaded * 100) / e.total,
                        ),
                    });
                },
            },
        );

        await updateMessage(id, {
            "attachment.filename": data.file.filename,
            "attachment.status": "uploaded",
            "attachment.uploadProgress": 100,
        });

        chatSocket.emit("chat:file", {
            id,
            roomId,
            attachment: {
                fileId,
                filename: data.file.filename,
                originalFilename: data.file.originalname,
                mimeType: data.file.mimetype,
                size: data.file.size,
            },
        });
    } catch (error) {
        await updateMessage(id, {
            "attachment.status": "failed",
        });

        const message = axios.isAxiosError(error)
            ? error.response?.data?.message ?? error.message
            : "Failed to upload file.";

        toast.add({
            type: "error",
            description: message,
        });
    }
}
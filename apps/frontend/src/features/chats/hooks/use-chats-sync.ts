"use client";

import { useEffect } from "react";

import { db } from "@/db/db";
import { UserPreview } from "@/features/auth/lib/users";
import { addMessage, addSystemMessage } from "@/features/chats/lib/messages";
import { addCacheFile } from "../file/files";
import { chatSocket } from "@/lib/socket";
import { useContactsStore } from "@/features/contacts/stores/contact-store";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/axios";

interface TextMessageBroadcast {
    id: string;
    streamId?: string;
    sender: UserPreview;
    sentAt: number;
    text: string;
    roomId: string;
}

interface FileMessageBroadcast {
    id: string;
    streamId?: string;
    sender: UserPreview;
    sentAt: number;
    attachment: {
        id: string;
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
    };
    roomId: string;
}

interface SysMessageBroadcast {
    id: string;
    streamId: string;
    code: string;
    type: "system";
    message: string;
    sentAt: number;
    roomId: string;
}

export function useChatSync() {
    const addUser = useContactsStore((state) => state.addUser);

    useEffect(() => {
        const handleText = async ({
            id,
            streamId,
            sender,
            sentAt,
            text,
            roomId,
        }: TextMessageBroadcast) => {
            addUser(sender);

            await addMessage({
                type: "text",
                id,
                roomId,
                senderId: sender.id,
                sentAt,
                text,
                isRead: false,
            });

            if (streamId) {
                chatSocket.emit("chat:received", {
                    streamId,
                    roomId,
                });
            }
        };

        const handleFile = async ({
            id,
            streamId,
            sender,
            sentAt,
            attachment,
            roomId,
        }: FileMessageBroadcast) => {
            addUser(sender);

            try {
                const response = await api.get(
                    `../uploads/chat/${attachment.filename}`,
                    { responseType: "blob" },
                );

                const blob = response.data;

                const file = new File(
                    [blob],
                    attachment.originalFilename,
                    {
                        type: attachment.mimeType || blob.type,
                        lastModified: Date.now(),
                    },
                );

                const fileId = await addCacheFile(file);

                await addMessage({
                    id,
                    type: "file",
                    roomId,
                    senderId: sender.id,
                    attachment: {
                        fileId,
                        originalFilename: attachment.originalFilename,
                        mimeType: attachment.mimeType,
                        size: attachment.size,
                        status: "downloaded",
                        uploadProgress: 0,
                        downloadProgress: 100,
                    },
                    isRead: false,
                    sentAt,
                });

                if (streamId) {
                    chatSocket.emit("chat:received", {
                        streamId,
                        roomId,
                    });
                }
            } catch (error) {
                console.error("Failed to download chat attachment:", error);

                toast.add({
                    type: "error",
                    description: "Failed to download chat attachment.",
                });
            }
        };

        const handleSysMessage = async ({
            id,
            streamId,
            code,
            message,
            sentAt,
            roomId,
        }: SysMessageBroadcast) => {
            await addSystemMessage({
                id,
                code,
                message,
                sentAt,
                roomId,
            });

            if (streamId) {
                chatSocket.emit("chat:received", {
                    streamId,
                    roomId,
                });
            }
        };

        chatSocket.on("chat:text", handleText);
        chatSocket.on("chat:file", handleFile);
        chatSocket.on("chat:system", handleSysMessage);

        return () => {
            chatSocket.off("chat:text", handleText);
            chatSocket.off("chat:file", handleFile);
            chatSocket.off("chat:system", handleSysMessage);
        };
    }, [addUser]);

    /*
     * Mark unfinished uploads as failed when the app starts.
     */
    useEffect(() => {
        const markUploadingFilesAsFailed = async () => {
            await db.messages
                .filter(
                    (message) =>
                        message.type === "file" &&
                        message.attachment.status === "uploading",
                )
                // @ts-expect-error Dexie supports nested property paths at runtime
                .modify({ "attachment.status": "failed" });
        };

        markUploadingFilesAsFailed();
    }, []);
}
"use client";

import {
    differenceInCalendarDays,
    format,
    isToday,
    isYesterday,
} from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

import { db } from "@/db/db";
import { UserPreview } from "@/features/auth/lib/users";
import { useSession } from "@/features/auth/providers/session-provider";
import { addMessage, addSystemMessage } from "@/features/chats/lib/messages";
import { ChatMessage, ChatSysMessage } from "@/features/chats/types/messages";
import { useContactsStore } from "@/features/contacts/stores/contact-store";
import { chatSocket } from "@/lib/socket";
import { addCacheFile } from "../file/files";
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

export function useChats(roomId: string) {
    const session = useSession();

    if (!session) {
        throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    const users = useContactsStore((state) => state.users);
    const addUser = useContactsStore((state) => state.addUser);

    const groupedMessages = useLiveQuery<
        Partial<Record<string, ChatMessage[]>>
    >(
        async () => {
            const [rawMessages, rawSysMessages] = await Promise.all([
                db.messages
                    .where("roomId")
                    .equals(roomId)
                    .sortBy("sentAt"),

                db.sysMessages
                    .where("roomId")
                    .equals(roomId)
                    .sortBy("sentAt"),
            ]);

            const messages: ChatMessage[] = rawMessages.map((message) => ({
                ...message,
                sender: users[message.senderId],
                isMine: message.senderId === userId,
            }));

            const systemMessages: ChatSysMessage[] = rawSysMessages.map(
                (message) => ({
                    ...message,
                    type: "system",
                    sender: undefined,
                }),
            );

            return Object.groupBy(
                [...messages, ...systemMessages].sort(
                    (a, b) => a.sentAt - b.sentAt,
                ),
                (message) => getDateGroup(message.sentAt),
            );
        },
        [roomId, userId, users],
    );

    /*
     * Mark messages as read when opening the room.
     */
    useEffect(() => {
        const markMessagesAsRead = async () => {
            await db.messages
                .where("roomId")
                .equals(roomId)
                .modify((message) => {
                    message.isRead = true;
                });
        };

        markMessagesAsRead();
    }, [roomId]);

    /*
     * Handle incoming realtime messages.
     */
    useEffect(() => {
        const handleFile = async ({
            id,
            streamId,
            roomId: incomingRoomId,
            sender,
            sentAt,
            attachment,
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
                    roomId: incomingRoomId,
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
                    isRead: incomingRoomId === roomId,
                    sentAt,
                });
                if (streamId) {

                    chatSocket.emit("chat:received", {
                        streamId,
                        roomId: incomingRoomId,
                    });
                }
            } catch (error) {
                console.error(
                    "Failed to download chat attachment:",
                    error,
                );

                toast.add({
                    type: "error",
                    description: "Failed to download chat attachment.",
                });
            }
        };

        const handleText = async ({
            id,
            streamId,
            sender,
            sentAt,
            text,
            roomId: incomingRoomId,
        }: TextMessageBroadcast) => {
            addUser(sender);

            await addMessage({
                type: "text",
                id,
                roomId: incomingRoomId,
                senderId: sender.id,
                sentAt,
                text,
                isRead: incomingRoomId === roomId,
            });
            if (streamId) {
                chatSocket.emit("chat:received", {
                    streamId,
                    roomId: incomingRoomId,
                });
            }
        };

        const handleSysMessage = async ({
            id,
            streamId,
            code,
            message,
            sentAt,
            roomId: incomingRoomId,
        }: SysMessageBroadcast) => {
            await addSystemMessage({
                id,
                code,
                message,
                sentAt,
                roomId: incomingRoomId,
            });
            if (streamId) {
                console.log("Sync", streamId)
                chatSocket.emit("chat:received", {
                    streamId,
                    roomId: incomingRoomId,
                });
            }
        };

        chatSocket.on("chat:file", handleFile);
        chatSocket.on("chat:text", handleText);
        chatSocket.on("chat:system", handleSysMessage);

        return () => {
            chatSocket.off("chat:file", handleFile);
            chatSocket.off("chat:text", handleText);
            chatSocket.off("chat:system", handleSysMessage);
        };
    }, [roomId, addUser]);

    /*
     * Mark unfinished uploads as failed.
     */
    useEffect(() => {
        const markUploadingFilesAsFailed = async () => {
            await db.messages
                .where("roomId")
                .equals(roomId)
                .filter(
                    (message) =>
                        message.type === "file" &&
                        message.attachment.status === "uploading",
                )
                // @ts-expect-error Dexie supports nested property paths at runtime
                .modify({ "attachment.status": "failed" });
        };

        markUploadingFilesAsFailed();
    }, [roomId]);

    return { groupedMessages };
}

function getDateGroup(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    const daysAgo = differenceInCalendarDays(new Date(), date);

    if (daysAgo < 7) return format(date, "EEEE");

    return format(date, "MMMM d, yyyy");
}
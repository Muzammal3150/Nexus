"use client";

import {
    differenceInCalendarDays,
    format,
    isToday,
    isYesterday,
} from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

import { useSession } from "@/components/providers/session-provider";
import { db } from "@/db/db";
import { addCacheFile } from "@/lib/chat/file/files";
import { addMessage } from "@/lib/chat/messages";
import { chatSocket } from "@/lib/socket";
import { useContactsStore } from "@/stores/contactStore";
import {
    ChatFileMessage,
    ChatMessage,
    ChatTextMessage,
} from "@/types/messages";

export function useChats(roomId: string) {
    const session = useSession();

    if (!session) {
        throw new Error("User not authenticated");
    }

    const users = useContactsStore((state) => state.users);
    const addUser = useContactsStore((state) => state.addUser);

    const messages = useLiveQuery<ChatMessage[]>(
        async () => {
            const rawMessages = await db.messages
                .where("roomId")
                .equals(roomId)
                .sortBy("sentAt");

            return rawMessages.map((message) => ({
                ...message,
                sender: users[message.senderId],
                isMine: message.senderId === session.user.id,
            }));
        },
        [roomId, session.user.id, users],
    );

    const groupedMessages = messages
        ? Object.groupBy(
            messages,
            (message) => getDateGroup(message.sentAt),
        )
        : {};

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
     * Incoming socket messages.
     */
    useEffect(() => {
        const handleFile = async ({
            id,
            streamId,
            roomId: incomingRoomId,
            sender,
            sentAt,
            attachment,
        }: Omit<ChatFileMessage, "type">) => {
            // Store the sender globally.
            addUser(sender);

            /*
             * Download the attachment.
             */
            const response = await fetch(
                `/uploads/chat/${attachment.filename}`,
            );

            if (!response.ok) {
                console.error(
                    "Failed to download chat attachment:",
                    response.status,
                );
                return;
            }

            const blob = await response.blob();

            const file = new File(
                [blob],
                attachment.originalFilename,
                {
                    type: attachment.mimeType,
                },
            );

            const fileId = await addCacheFile(file);

            /*
             * Store the message in Dexie.
             */
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
                    downloadProgress: 0,
                },
                isRead: incomingRoomId === roomId,
                sentAt,
            });

            /*
             * Tell the server that the message was received.
             */
            chatSocket.emit("chat:received", {
                streamId,
                roomId: incomingRoomId,
            });
        };

        const handleText = async ({
            id,
            streamId,
            sender,
            sentAt,
            text,
            roomId: incomingRoomId,
        }: Omit<ChatTextMessage, "type">) => {
            // Store the sender globally.
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

            chatSocket.emit("chat:received", {
                streamId,
                roomId: incomingRoomId,
            });
        };

        chatSocket.on("chat:file", handleFile);
        chatSocket.on("chat:text", handleText);

        return () => {
            chatSocket.off("chat:file", handleFile);
            chatSocket.off("chat:text", handleText);
        };
    }, [roomId, addUser]);

    /*
     * If the component is unmounted/reloaded while files
     * were uploading, mark them as failed.
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
                .modify({
                    "attachment.status": "failed",
                });
        };

        markUploadingFilesAsFailed();
    }, [roomId]);

    return {
        messages: messages ?? [],
        groupedMessages,
    };
}

function getDateGroup(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return "Today";
    }

    if (isYesterday(date)) {
        return "Yesterday";
    }

    const daysAgo = differenceInCalendarDays(new Date(), date);

    if (daysAgo < 7) {
        return format(date, "EEEE");
    }

    return format(date, "MMMM d, yyyy");
}
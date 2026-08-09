import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

import { useSession } from "@/components/providers/session-provider";
import { db } from "@/db/db";
import { api } from "@/lib/axios";
import { addMessage } from "@/lib/chat/messages";
import { chatSocket } from "@/lib/socket";
import { ChatMessage, ChatTextMessage } from "@/types/messages";
import { User } from "better-auth";
import { differenceInCalendarDays, format, isToday, isYesterday } from "date-fns";




export function useChats(roomId: string) {
    const session = useSession()!;

    const messages = useLiveQuery<ChatMessage[]>(async () => {
        const rawMessages = await db.messages
            .where("roomId")
            .equals(roomId)
            .sortBy("sentAt");

        if (rawMessages.length === 0) {
            return [];
        }

        const userIds = [...new Set(rawMessages.map((m) => m.senderId))];
        const params = new URLSearchParams();

        for (const id of userIds) {
            params.append("ids", id);
        }

        const { data: users } = await api.get<User[]>(`/users/many/id?${params.toString()}`);

        const userMap = new Map(users.map((user) => [user.id, user]));

        return rawMessages.map((message) => ({
            ...message,
            sender: userMap.get(message.senderId)!,
            isMine: message.senderId === session.user.id,
        }));
    }, [roomId, session.user.id]);

    const groupedMessages = messages && Object.groupBy(messages!, (message) => getDateGroup(message.sentAt))

    useEffect(() => {
        (async () => {
            await db.messages
                .where('roomId')
                .equals(roomId)
                .modify((message) => {
                    message.isRead = true;
                });
        })();
    }, [roomId]);


    useEffect(() => {
        const handleMessage = ({ id, sender, sentAt, text, roomId: _roomId }: Omit<ChatTextMessage, "type">) => {
            addMessage({
                type: "text",
                id,
                roomId: _roomId,
                senderId: sender.id,
                sentAt,
                text,
                isRead: _roomId == roomId,
            });
        };

        chatSocket.on("chat:text", handleMessage);

        return () => {
            chatSocket.off("chat:text", handleMessage);
        };
    }, [roomId]);

    useEffect(() => {
        const markUploadingFilesAsFailed = async () => {
            await db.messages
                .where("roomId")
                .equals(roomId)
                .filter((message) =>
                    message.type === "file" &&
                    message.attachment.status === "uploading"
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
    const date = new Date(timestamp)
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    const daysAgo = differenceInCalendarDays(new Date(), date);

    if (daysAgo < 7) {
        return format(date, "EEEE"); // Monday, Tuesday...
    }

    return format(date, "MMMM d, yyyy"); // July 28, 2026
}

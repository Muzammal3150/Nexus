import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

import { useSession } from "@/components/auth/auth-provider";
import { db } from "@/db/db";
import { api } from "@/lib/axios";
import { addMessage } from "@/lib/chat/messages";
import { chatSocket } from "@/lib/socket";
import { ChatMessage } from "@/types/messages";
import { User } from "better-auth";




export function useChats(roomId: string) {
    const session = useSession();

    const messages = useLiveQuery<ChatMessage[]>(async () => {
        const rawMessages = await db.messages
            .where("roomId")
            .equals(roomId)
            .sortBy("sendedAt");

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

    const groupedMessages = messages && Object.groupBy(messages!, (message) => getDateGroup(message.sendedAt))

    useEffect(() => {
        (async () => {
            await db.messages
                .where('roomId')
                .equals(roomId)
                .modify((message) => {
                    message.read = true;
                });
        })();
    }, [roomId]);


    useEffect(() => {
        const handleMessage = ({ id, sender, sendedAt, body, roomId: _roomId }: ChatMessage) => {
            addMessage({
                id,
                roomId: _roomId,
                senderId: sender.id,
                sendedAt,
                body,
                read: _roomId == roomId,
            });
        };

        chatSocket.on("chat:text", handleMessage);

        return () => {
            chatSocket.off("chat:text", handleMessage);
        };
    }, [roomId]);

    const onSend = (text: string) => {
        chatSocket.emit("chat:text", {
            roomId,
            body: text,
        });
    };

    return {
        messages: messages ?? [],
        groupedMessages,
        onSend,
    };
}


import {
    format,
    isToday,
    isYesterday,
    differenceInCalendarDays,
} from "date-fns";

function getDateGroup(_date: Date | string) {
    const date = new Date(_date)
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    const daysAgo = differenceInCalendarDays(new Date(), date);

    if (daysAgo < 7) {
        return format(date, "EEEE"); // Monday, Tuesday...
    }

    return format(date, "MMMM d, yyyy"); // July 28, 2026
}

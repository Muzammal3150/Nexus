"use client";

import {
    differenceInCalendarDays,
    format,
    isToday,
    isYesterday,
} from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db/db";
import { ChatMessage, ChatSysMessage } from "@/features/chats/types/messages";
import { useContactsStore } from "@/features/contacts/stores/contact-store";
import { useSession } from "@/features/auth/providers/session-provider";
import { useEffect } from "react";
export function useChatMessages(roomId: string) {
    const session = useSession();

    if (!session) {
        throw new Error("User not authenticated");
    }

    const userId = session.user.id;
    const users = useContactsStore((state) => state.users);

    const groupedMessages = useLiveQuery<Partial<Record<string, ChatMessage[]>>>(
        async () => {
            const [rawMessages, rawSysMessages] = await Promise.all([
                db.messages.where("roomId").equals(roomId).sortBy("sentAt"),
                db.sysMessages.where("roomId").equals(roomId).sortBy("sentAt"),
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

    useEffect(() => {
        db.messages
            .where("roomId")
            .equals(roomId)
            .modify((message) => {
                message.isRead = true;
            });
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
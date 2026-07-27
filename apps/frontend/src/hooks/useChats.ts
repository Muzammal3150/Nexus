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

    useEffect(() => {
        const handleMessage = ({
            id,
            sender,
            sendedAt,
            body,
        }: ChatMessage) => {
            addMessage({
                id,
                roomId,
                senderId: sender.id,
                sendedAt,
                body,
            });
        };

        chatSocket.emit("room:join", roomId);
        chatSocket.on("chat:text", handleMessage);

        return () => {
            chatSocket.off("chat:text", handleMessage);
            chatSocket.emit("room:leave", roomId);
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
        onSend,
    };
}
"use client";

import { useSession } from "@/components/providers/session-provider";
import { db } from "@/db/db";
import { api } from "@/lib/axios";
import { formatDirectRoom } from "@/lib/chat/rooms";
import { Room } from "@/types/room";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";


export function useRooms() {
    const session = useSession();
    if (!session) throw new Error("User not authenticated");


    const messages = useLiveQuery(async () => {
        const rawMessages = await db.messages.orderBy("sendedAt").toArray();
        return Object.groupBy(rawMessages, message => message.roomId);
    }, []);


    const { data, isLoading, isError } = useQuery({
        queryKey: ["get-rooms"],
        queryFn: async () => {
            const res = await api.get("/rooms");
            return res.data as Room[];
        },
    });


    const rooms = useMemo(() => data?.map(room => {
        const roomMessages = messages?.[room.id]
        const unreadMessages = roomMessages?.filter(({ read, senderId }) => !read && senderId != session.user.id)
        const lastMessage = roomMessages?.at(-1) ?? null
        const lastMessageWithSender = lastMessage
            ? {
                ...lastMessage,
                sender: room.members.find(member => member.userId === lastMessage.senderId)?.user,
            }
            : null
        return {
            ...formatDirectRoom(room, session.user),
            lastMessage: lastMessageWithSender,
            unread: unreadMessages?.length ?? 0,

        }
    }).sort(
        (a, b) =>
            new Date(b.lastMessage?.sendedAt ?? 0).getTime() -
            new Date(a.lastMessage?.sendedAt ?? 0).getTime()
    ), [data, messages, session.user])



    const contacts = useMemo(() => {
        const contacts = rooms?.filter(room => !room.isGroup).map(room => {
            const contact = room.members.find(member => member.userId !== session.user.id)!.user
            return contact
        })
        return contacts
    }, [rooms, session.user.id])


    return {
        rooms,
        contacts,
        isLoading,
        isError,
    };
}
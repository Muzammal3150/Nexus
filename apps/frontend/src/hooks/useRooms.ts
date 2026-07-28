"use client";

import { useSession } from "@/components/auth/auth-provider";
import { db } from "@/db/db";
import { api } from "@/lib/axios";
import { formatDirectRoom } from "@/lib/chat/rooms";
import { Room } from "@/types/room";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";


export function useRooms() {
    const session = useSession();

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

    const rooms = data?.map(room => {
        const roomMessages = messages?.[room.id]
        const unreadMessages = roomMessages?.filter(({ read, senderId }) => !read && senderId != session.user.id)
        console.log(unreadMessages)
        return {
            ...formatDirectRoom(room, session.user),
            lastMessage: roomMessages?.at(-1) ?? null,
            unread: unreadMessages?.length ?? 0,

        }
    }).sort(
        (a, b) =>
            new Date(b.lastMessage?.sendedAt ?? 0).getTime() -
            new Date(a.lastMessage?.sendedAt ?? 0).getTime()
    )

    
    console.log(rooms)
    return {
        rooms,
        isLoading,
        isError,
    };
}
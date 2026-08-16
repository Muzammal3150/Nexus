"use client";

import { Room } from "@/features/chats/types/room";
import { chatSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()

    useEffect(() => {
        console.log("CHAT PROVIDER MOUNT", chatSocket.id);

        chatSocket.connect();

        const handleRoomBroadCast = (newRoom: Room) => {
            queryClient.setQueryData<Room[]>(["get-rooms"], (prev = []) => {
                if (prev.some((room) => room.id === newRoom.id)) return prev;
                return [newRoom, ...prev];
            });
        };

        chatSocket.on("room:create-broadcast", handleRoomBroadCast);

        return () => {
            console.log("CHAT PROVIDER UNMOUNT", chatSocket.id);

            chatSocket.off("room:create-broadcast", handleRoomBroadCast);
            chatSocket.disconnect();
        };
    }, [queryClient]);

    return children;
}
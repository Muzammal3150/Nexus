"use client";

import { chatSocket } from "@/lib/socket";
import { Room } from "@/types/room";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()

    useEffect(() => {
        chatSocket.connect();
        
        const handleRoomBroadCast = (newRoom: Room) => {
            console.log(newRoom)
            queryClient.setQueryData(['get-rooms'], (prev: Room[]) => {
                if (prev.some((room) => room.id === newRoom.id)) return prev;

                return [newRoom, ...prev];
            });
        }

        chatSocket.on("room:create-broadcast", handleRoomBroadCast)


        return () => {
            chatSocket.on("room:create-broadcast", handleRoomBroadCast)

            chatSocket.disconnect();
        };

    }, []);

    return children;
}
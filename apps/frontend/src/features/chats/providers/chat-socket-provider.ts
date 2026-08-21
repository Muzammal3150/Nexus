"use client";

import { chatSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()

    useEffect(() => {
        console.log("CHAT PROVIDER MOUNT", chatSocket.id);

        chatSocket.connect();

        const handleRoomBroadCast = () => {
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            })
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
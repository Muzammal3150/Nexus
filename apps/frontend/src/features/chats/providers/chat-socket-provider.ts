"use client";

import { toast } from "@/components/ui/toast";
import { chatSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useChatSync } from "../hooks/use-chats-sync";

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const syncChat = useChatSync()

    useEffect(() => {
        console.log("CHAT PROVIDER MOUNT", chatSocket.id);

        chatSocket.connect();

        const handleRoomBroadCast = () => {
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            })
        };
        const handleError = ({ message }: { message: string; }) => {
            toast.add({
                type: "error",
                description: message
            })
        }

        chatSocket.on("chat:error", handleError)
        chatSocket.on("room:create-broadcast", handleRoomBroadCast);

        return () => {
            console.log("CHAT PROVIDER UNMOUNT", chatSocket.id);
            chatSocket.off("chat:error", handleError)
            chatSocket.off("room:create-broadcast", handleRoomBroadCast);
            chatSocket.disconnect();
        };
    }, [queryClient]);

    return children;
}
import { chatSocket } from "@/lib/socket";
import { ChatMessage } from "@/lib/types";
import { useEffect, useState } from "react";

export function useChats(roomId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    useEffect(() => {


        const handleMessage = (data: ChatMessage) => {
            console.log(data)
            setMessages((prev) => [...prev, data]);
        };

        chatSocket.emit("room:join", roomId)
        chatSocket.on("chat:text", handleMessage);

        return () => {
            chatSocket.off("chat:text", handleMessage);
            chatSocket.emit("room:leave", roomId)
            setMessages([])
        };
    }, [roomId]);
    const onSend = (text: string) => {

        chatSocket.emit("chat:text", {
            roomId,
            text,
            time: new Date()
        })
    }
    return { onSend, messages }
}
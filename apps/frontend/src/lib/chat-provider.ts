"use client";

import { chatSocket } from "@/lib/socket";
import { useEffect } from "react";

export function ChatProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        chatSocket.connect();

        return () => {
            chatSocket.disconnect();
        };
    }, []);

    return children;
}
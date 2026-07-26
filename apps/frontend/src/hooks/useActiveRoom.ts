import { api } from "@/lib/axios";
import { Room } from "@/types/room";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useActiveRoom() {
    const { roomId } = useParams<{ roomId: string }>();


    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState<Room | null>(null);

    useEffect(() => {
        (async () => {
            if (!roomId) {
                setRoom(null);
                return;
            }
            setIsLoading(true);

            try {
                const { data: room } = await api.get<Room>(`/rooms/${roomId}`);
                setRoom(room);
            } catch (error) {
                console.error("Failed to load room:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [roomId]);

    return { roomId, room, isLoading };
}
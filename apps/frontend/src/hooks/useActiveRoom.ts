import { RoomWithMembers } from "@/db/db.d";
import { getRoom } from "@/lib/rooms";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useActiveRoom() {
    const { roomId } = useParams<{ roomId: string }>();


    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState<RoomWithMembers | null>(null);

    useEffect(() => {
        (async () => {
            if (!roomId) {
                setRoom(null);
                return;
            }
            setIsLoading(true);

            try {
                const room = await getRoom(roomId);
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
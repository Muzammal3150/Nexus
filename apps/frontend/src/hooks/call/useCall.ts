import { useSession } from "@/components/auth/session-provider";
import { getRoom, loadMembers } from "@/lib/call/get-room";
import { callSocket } from "@/lib/socket";
import { CallMember, CallRoom } from "@/types/calls";
import { User } from "better-auth";
import { useEffect, useRef, useState } from "react";
import { CallController } from "./CallController";

export function useCall(roomId: string) {
    const session = useSession();

    const [room, setRoom] = useState<CallRoom | null>(null);
    const [members, setMembers] = useState<CallMember[]>([]);


    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const callControllerRef = useRef<CallController | null>(null);


    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const room = await getRoom(roomId);
                if (cancelled) return;

                const members = await loadMembers(room, session)
                if (cancelled) return;

                setRoom(room);
                setMembers(members);

            } catch (err) {
                if (cancelled) return;
                setError(err as Error);
            }
            finally {
                if (cancelled) return;
                setIsLoading(false);

            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [roomId, session]);




    useEffect(() => {
        const controller = new CallController(roomId);
        callControllerRef.current = controller;

        controller.init();

        return () => {
            controller.destroy();
        };
    }, []);


    useEffect(() => {
        function handleJoin({ user }: { user: User }) {
            setMembers(prev => prev.map(member => member.user.id === user.id ? {
                ...member,
                joined: true,
            } : member))
        }

        function handleLeave({ user }: { user: User }) {
            setMembers(prev => prev.filter(member => member.user.id != user.id));
        }

        callSocket.on("call:join-broadcast", handleJoin);
        callSocket.on("call:leave-broadcast", handleLeave);
        callSocket.on("call:reject-broadcast", handleLeave);
        return () => {
            callSocket.off("call:join-broadcast", handleJoin);
            callSocket.off("call:leave-broadcast", handleLeave);
            callSocket.off("call:reject-broadcast", handleLeave);

        };
    }, []);



    return {
        room,
        members,
        self: members.find(member => member.isSelf),
        isLoading,
        error,

        callControllerRef
    };
}



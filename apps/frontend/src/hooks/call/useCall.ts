import { useMemo, useEffect, useSyncExternalStore } from "react";
import { useSession } from "@/components/auth/session-provider";
import { CallController } from "./CallController";

export function useCall(roomId: string) {
    const session = useSession();

    const controller = useMemo(
        () => new CallController(roomId, session),
        [roomId, session]
    );

    useEffect(() => {
        void controller.init();
        return () => controller.destroy();
    }, [controller]);

    return useSyncExternalStore(
        controller.subscribe,
        controller.getSnapshot
    );
}
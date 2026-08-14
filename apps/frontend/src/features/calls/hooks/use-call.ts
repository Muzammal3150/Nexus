import { useSession } from "@/features/auth/providers/session-provider";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { CallController } from "../lib/call-controller";

export function useCall(roomId: string) {
    const session = useSession();

    const controller = useMemo(
        () => new CallController(roomId, session),
        [roomId, session]
    );

    useEffect(() => {
        void controller.init();
        return () => controller.destroy();
    }, [controller]); // re-run init/destroy whenever the instance changes

    return useSyncExternalStore(
        controller.subscribe,
        controller.getSnapshot
    );
}
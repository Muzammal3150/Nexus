import type { Socket } from "socket.io";

type AckCallback<T = unknown> = (response: T) => void;

export function safeAck<T>(cb: unknown, response: T) {
    if (typeof cb === "function") {
        try {
            (cb as AckCallback<T>)(response);
        } catch (err) {
            console.error("Error invoking chat acknowledgement callback:", err);
        }
    }
}

export function initSafe(onError: (err: any) => void) {
    return <A extends unknown[]>(handler: (...args: A) => unknown | Promise<unknown>) => {
        return (...args: A) => {
            Promise.resolve(handler(...args)).catch((err) => {
                onError(err)
            });
        };
    };
}
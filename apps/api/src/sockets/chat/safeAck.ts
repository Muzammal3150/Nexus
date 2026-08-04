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
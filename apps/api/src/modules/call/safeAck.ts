/** Invokes an ack callback defensively — clients can send a malformed/missing callback. */
export function safeAck<T>(cb: unknown, response: T) {
    if (typeof cb === "function") {
        try {
            (cb as AckCallback<T>)(response);
        } catch (err) {
            console.error("Error invoking acknowledgement callback:", err);
        }
    }
}

type AckCallback<T = unknown> = (response: T) => void;




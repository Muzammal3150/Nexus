import type { IncomingHttpHeaders } from "http";
import { auth } from "../config/auth.js";

export async function authorize(headers: IncomingHttpHeaders) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        return null;
    }

    return session;
}
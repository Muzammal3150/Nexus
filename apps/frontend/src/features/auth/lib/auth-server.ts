import axios from "axios";
import { SessionType } from "@/features/auth/providers/session-provider";

export async function getSession({ headers }: { headers: HeadersInit }): Promise<SessionType | null> {
    try {
        const res = await axios.get<SessionType>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`, {
            headers: Object.fromEntries(new Headers(headers)),
            withCredentials: true
        });

        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === "ECONNREFUSED") console.log("Server not running / not found");
            else console.log(error.message);
        } else console.log(error);

        return null;
    }
}
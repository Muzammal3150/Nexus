import { SessionType } from "@/features/auth/providers/session-provider";

export async function getSession({ headers }: { headers: HeadersInit }): Promise<SessionType | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`, { headers, cache: "no-store" });

        if (!res.ok) return null;

        return await res.json();
    } catch (error) {
        if (error instanceof TypeError && (error.cause as { code?: string } | undefined)?.code === "ECONNREFUSED") {
            console.log("Server not running / not found")
            return null
        };
        return null;
    }
}
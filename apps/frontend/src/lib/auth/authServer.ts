import { SessionType } from "@/components/providers/session-provider";


export async function getSession({ headers }: {
    headers: HeadersInit;
}): Promise<SessionType | null> {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
            {
                headers,
                cache: "no-store",
            }
        );

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}
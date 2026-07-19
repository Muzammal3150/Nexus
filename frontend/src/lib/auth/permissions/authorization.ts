import { getUserPerms } from "@/lib/auth/permissions/permissions";
import { auth } from "@/lib/auth/server/auth";


export async function authorize({ headers }: Request, action: string, subject: string, field?: string) {
    const session = await auth.api.getSession({ headers });
    const perms = getUserPerms(session?.user);

    if (perms.cannot(action, subject, field)) {
        return {
            ok: false,
            response: Response.json({ message: "Forbidden", code: "FORBIDDEN" }, { status: 403 }),
        };
    }

    return { ok: true, session };
}
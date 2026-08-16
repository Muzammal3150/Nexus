import { getSession } from "@/features/auth/lib/auth-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


const routes = {
    protected: ["/chats", "/calls", "/settings","/contacts"],
    guestOnly: ["/login", "/signup"],
};
const protectedRoutes = routes.protected;
const guestOnlyRoutes = routes.guestOnly;

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const session = await getSession({
        headers: req.headers,
    });

    const isProtected = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    const isGuestOnly = guestOnlyRoutes.some(route =>
        pathname.startsWith(route)
    );

    if (isProtected && !session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isGuestOnly && session) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
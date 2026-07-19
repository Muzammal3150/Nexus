import { createAuthClient } from "better-auth/react";

const baseURL = new URL("/api/auth", process.env.NEXT_PUBLIC_BACKEND_URL).toString()


export const authClient = createAuthClient({ baseURL });
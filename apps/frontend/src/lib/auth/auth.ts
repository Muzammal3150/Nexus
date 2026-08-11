import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const baseURL = new URL("/api/auth", process.env.NEXT_PUBLIC_BACKEND_URL).toString()


export const authClient = createAuthClient({
    baseURL,
    plugins: [
        inferAdditionalFields({
            user: {

                username: {
                    type: "string",
                    required: true,
                    unique: true,
                    input: true,
                },
            }
        })
    ]

});
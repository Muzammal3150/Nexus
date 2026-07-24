import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
    },
    databaseHooks: {
        user: {
            create: {
                async before(user) {
                    const isUser = await prisma.user.findUnique({ where: { username: user.username as string } })
                    if (isUser) {
                        throw new APIError('CONFLICT', {
                            message: "User with same username already exists."
                        })
                    }

                    return { data: user };
                },
            },
        },
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                unique: true,
                input: true,
            },
        },
    },

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
    ],

    trustedOrigins: ["http://localhost:3000"],
});
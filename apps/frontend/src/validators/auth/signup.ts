import { z } from "zod";

export const baseSignUpValidator = z.object({
    email: z.email("Invalid email address"),

    name: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name too long")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100)
        .regex(/[a-z]/, "Must include a lowercase letter")
        .regex(/[A-Z]/, "Must include an uppercase letter")
        .regex(/[0-9]/, "Must include a number")
        .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
    confirmPassword: z.string(),
})

export const signUpValidator = baseSignUpValidator.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["password"],
});;

export type signUpValues = z.infer<typeof signUpValidator>


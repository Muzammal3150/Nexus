import { User } from "./auth";

export function getAvatar(image: User["image"]) {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/avatars/${image}`
}

export function getUpload(image: string | undefined | null) {
    if (!image) return undefined
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${image}`
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}



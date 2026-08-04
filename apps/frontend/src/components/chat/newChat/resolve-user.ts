import { AxiosError } from 'axios';
import { User } from 'better-auth';

import { api } from '@/lib/axios';

/**
 * Looks up a single user by username, email, or phone number.
 * Returns null on a 404 (not found); rethrows anything else so the
 * caller can distinguish "no such user" from "something went wrong".
 */
export async function resolveUser(username: string): Promise<User | null> {
    try {
        const { data } = await api.get<User>(`/users/${username}`);
        return data;
    } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404) return null;
        throw err;
    }
}

export function errorMessage(err: unknown, fallback: string) {
    if (err instanceof AxiosError) return err.response?.data?.message ?? fallback;
    if (err instanceof Error) return err.message;
    return fallback;
}

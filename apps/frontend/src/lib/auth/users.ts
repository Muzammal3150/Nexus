import { api } from "@/lib/axios";

export interface UserPreview {
    id: string;
    name: string;
    username: string;
    image: string | null;
}

export async function getUser(username: string) {
    const { data } = await api.get<UserPreview>(`/users/${username}`);

    return data;
}

export async function getUsers(usernames: string[]) {
    if (usernames.length === 0) {
        return [];
    }

    const { data } = await api.get<UserPreview[]>("/users/many", {
        params: {
            usernames: usernames.join(","),
        },
    });

    return data;
}

export async function getUsersById(ids: string[]) {
    if (ids.length === 0) {
        return [];
    }

    const { data } = await api.get<UserPreview[]>("/users/many/id", {
        params: {
            ids: ids.join(","),
        },
    });

    return data;
}
import { redis } from "../config/redis.js";

type UserPresence = {
    isOnline: boolean;
    lastSeen: number | null;
};

const defaultPresence: UserPresence = {
    isOnline: false,
    lastSeen: null,
};

export async function getUserPresence(userId: string): Promise<UserPresence> {
    const value = await redis.hGet('nexus:presence', userId);

    if (!value) {
        return defaultPresence;
    }

    try {
        return {
            ...defaultPresence,
            ...JSON.parse(value),
        };
    } catch {
        return defaultPresence;
    }
}

export async function getUsersPresence(
    userIds: string[],
): Promise<Map<string, UserPresence>> {
    if (userIds.length === 0) {
        return new Map();
    }

    const values = await redis.hmGet(
        'nexus:presence',
        userIds,
    );

    const presence = new Map<string, UserPresence>();

    userIds.forEach((userId, index) => {
        const value = values[index];

        if (!value) {
            presence.set(userId, defaultPresence);
            return;
        }

        try {
            presence.set(userId, {
                ...defaultPresence,
                ...JSON.parse(value),
            });
        } catch {
            presence.set(userId, defaultPresence);
        }
    });

    return presence;
}
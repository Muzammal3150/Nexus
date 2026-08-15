import { Router } from 'express';
import prisma from '../../config/prisma.js';
import { getUserPresence, getUsersPresence } from '../../presence/get-presence.js';

export const router: Router = Router();

const userSelect = {
    id: true,
    name: true,
    email: true,
    username: true,
    image: true,
};

function getQueryValues(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter(
                (item): item is string =>
                    typeof item === 'string',
            )
            .flatMap((item) => item.split(','))
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

router.get('/', async (req, res) => {
    const ids = getQueryValues(req.query.ids);
    const usernames = getQueryValues(req.query.usernames);

    if (ids.length === 0 && usernames.length === 0) {
        return res.status(400).json({
            message: 'Provide at least one user id or username.',
        });
    }

    if (ids.length > 0 && usernames.length > 0) {
        return res.status(400).json({
            message: 'Provide either ids or usernames, not both.',
        });
    }

    const where =
        ids.length > 0
            ? { id: { in: ids } }
            : { username: { in: usernames } };

    const users = await prisma.user.findMany({
        where,
        select: userSelect,
    });

    const presence = await getUsersPresence(
        users.map((user) => user.id),
    );
    console.log(presence, users.map((user) => user.id))
    const usersWithPresence = users.map((user) => ({
        ...user,
        ...presence.get(user.id),
    }));

    return res.json(usersWithPresence);
});

router.get('/:username', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            username: req.params.username,
        },
        // select: userSelect,
    });

    if (!user) {
        return res.status(404).json({
            message: 'User not found.',
        });
    }

    const presence = await getUserPresence(user.id);

    return res.json({
        ...user,
        ...presence,
    });
});
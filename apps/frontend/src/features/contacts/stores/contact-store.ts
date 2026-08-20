import { create } from 'zustand';
import { db } from '@/db/db';
import { UserPreview } from '@/features/auth/lib/users';
import { api } from '@/lib/axios';
import { chatSocket } from '@/lib/socket';

export interface CachedContact {
    userId: string;
    name: string;
    createdAt: number;
}

export interface Contact extends UserPreview {
    contact?: CachedContact;
}

interface UserPresence {
    isOnline: boolean;
    lastSeen: number | null;
}

interface ContactsState {
    users: Record<string, UserPreview>;
    contacts: Record<string, CachedContact>;
    initialized: boolean;

    initialize: () => Promise<void>;

    addUser: (user: UserPreview) => void;
    addUsers: (users: UserPreview[]) => void;
    updateUserPresence: (userId: string, presence: UserPresence) => void;

    saveContact: (userId: string, name: string) => Promise<void>;
    updateContactName: (userId: string, name: string) => Promise<void>;
    removeContact: (userId: string) => Promise<void>;

    getUser: (userId: string) => UserPreview | undefined;
    getContact: (userId: string) => Contact | undefined;
    getContacts: () => Contact[];

    fetchUserByUsername: (username: string) => Promise<Contact | undefined>;
    fetchContacts: () => Promise<Contact[]>;

    clearContacts: () => Promise<void>;
}

const subscribeToPresence = (userId: string) => {
    chatSocket.emit('presence:subscribe', { userId });
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    users: {},
    contacts: {},
    initialized: false,

    initialize: async () => {
        if (get().initialized) return;

        const cachedContacts = await db.contacts.toArray();
        const contacts: Record<string, CachedContact> = {};

        for (const contact of cachedContacts) {
            contacts[contact.userId] = contact;
        }

        set({ contacts });

        await get().fetchContacts();

        set({ initialized: true });
    },

    addUser: (user) => {
        const exists = !!get().users[user.id];

        set((state) => ({
            users: {
                ...state.users,
                [user.id]: user,
            },
        }));

        if (!exists) {
            subscribeToPresence(user.id);
        }
    },

    addUsers: (users) => {
        if (!users.length) return;

        const existingUsers = get().users;

        set((state) => {
            const nextUsers = { ...state.users };

            for (const user of users) {
                nextUsers[user.id] = user;
            }

            return { users: nextUsers };
        });

        for (const user of users) {
            if (!existingUsers[user.id]) {
                subscribeToPresence(user.id);
            }
        }
    },

    updateUserPresence: (userId, presence) => {
        set((state) => {
            const user = state.users[userId];

            if (!user) return state;

            return {
                users: {
                    ...state.users,
                    [userId]: {
                        ...user,
                        isOnline: presence.isOnline,
                        lastSeen: presence.lastSeen,
                    },
                },
            };
        });
    },

    saveContact: async (userId, name) => {
        const user = get().users[userId];

        if (!user) return;

        const existingContact = get().contacts[userId];

        const contact: CachedContact = {
            userId,
            name: name.trim(),
            createdAt: existingContact?.createdAt ?? Date.now(),
        };

        await db.contacts.put(contact);

        set((state) => ({
            contacts: {
                ...state.contacts,
                [userId]: contact,
            },
        }));

        if (!get().users[userId]) {
            subscribeToPresence(userId);
        }
    },

    updateContactName: async (userId, name) => {
        const existingContact = get().contacts[userId];

        if (!existingContact) return;

        const contact: CachedContact = {
            ...existingContact,
            name: name.trim(),
        };

        await db.contacts.put(contact);

        set((state) => ({
            contacts: {
                ...state.contacts,
                [userId]: contact,
            },
        }));
    },

    removeContact: async (userId) => {
        if (!get().contacts[userId]) return;

        await db.contacts.delete(userId);

        set((state) => {
            const contacts = { ...state.contacts };
            delete contacts[userId];

            return { contacts };
        });
    },

    getUser: (userId) => {
        return get().users[userId];
    },

    getContact: (userId) => {
        const user = get().users[userId];

        if (!user) return undefined;

        return {
            ...user,
            contact: get().contacts[userId],
        };
    },

    getContacts: () => {
        const { users, contacts } = get();
        const result: Contact[] = [];

        for (const contact of Object.values(contacts)) {
            const user = users[contact.userId];

            if (!user) continue;

            result.push({
                ...user,
                contact,
            });
        }

        return result;
    },

    fetchUserByUsername: async (username) => {
        const normalizedUsername = username.trim().replace(/^@/, '');

        if (!normalizedUsername) return undefined;

        const existingUser = Object.values(get().users).find(
            (user) => user.username.toLowerCase() === normalizedUsername.toLowerCase(),
        );

        if (existingUser) {
            return {
                ...existingUser,
                contact: get().contacts[existingUser.id],
            };
        }

        const response = await api.get<UserPreview>(
            `/users/${encodeURIComponent(normalizedUsername)}`,
        );

        const user = response.data;

        get().addUser(user);

        return {
            ...user,
            contact: get().contacts[user.id],
        };
    },

    fetchContacts: async () => {
        const { contacts, users } = get();

        const missingUserIds = Object.keys(contacts).filter(
            (userId) => !users[userId],
        );

        if (missingUserIds.length) {
            const response = await api.get<UserPreview[]>('/users', {
                params: {
                    ids: missingUserIds.join(','),
                },
            });

            get().addUsers(response.data);
        }

        return get().getContacts();
    },

    clearContacts: async () => {
        await db.contacts.clear();

        set({
            contacts: {},
        });
    },
}));

chatSocket.on('connect', () => {
    const { users } = useContactsStore.getState();

    for (const user of Object.values(users)) {
        subscribeToPresence(user.id);
    }
});

chatSocket.on('presence:update', (data: UserPresence & { userId: string }) => {
    useContactsStore.getState().updateUserPresence(data.userId, {
        isOnline: data.isOnline,
        lastSeen: data.lastSeen,
    });
});
import { create } from 'zustand';

import { db } from '@/db/db';
import { UserPreview } from '@/features/auth/lib/users';
import { api } from '@/lib/axios';

export interface CachedContact {
    userId: string;
    name: string;
    createdAt: number;
}

export interface Contact extends UserPreview {
    contact?: CachedContact;
}

interface ContactsState {
    users: Record<string, UserPreview>;
    contacts: Record<string, CachedContact>;

    initialized: boolean;

    initialize: () => Promise<void>;

    addUser: (user: UserPreview) => void;
    addUsers: (users: UserPreview[]) => void;

    saveContact: (
        userId: string,
        name: string,
    ) => Promise<void>;

    updateContactName: (
        userId: string,
        name: string,
    ) => Promise<void>;

    removeContact: (
        userId: string,
    ) => Promise<void>;

    getUser: (
        userId: string,
    ) => UserPreview | undefined;

    getContact: (
        userId: string,
    ) => Contact | undefined;

    getContacts: () => Contact[];

    fetchUserByUsername: (
        username: string,
    ) => Promise<Contact | undefined>;

    fetchContacts: () => Promise<Contact[]>;

    clearContacts: () => Promise<void>;
}

export const useContactsStore =
    create<ContactsState>((set, get) => ({
        users: {},
        contacts: {},
        initialized: false,

        initialize: async () => {
            if (get().initialized) {
                return;
            }

            const cachedContacts =
                await db.contacts.toArray();

            const contacts: Record<
                string,
                CachedContact
            > = {};

            for (const contact of cachedContacts) {
                contacts[contact.userId] = contact;
            }
            console.log("initialized")

            set({
                contacts,
                initialized: true,
            });
        },

        addUser: (user) => {
            set((state) => ({
                users: {
                    ...state.users,
                    [user.id]: user,
                },
            }));
        },

        addUsers: (users) => {
            if (users.length === 0) {
                return;
            }

            set((state) => {
                const nextUsers = {
                    ...state.users,
                };

                for (const user of users) {
                    nextUsers[user.id] = user;
                }

                return {
                    users: nextUsers,
                };
            });
        },

        saveContact: async (userId, name) => {
            const user = get().users[userId];

            if (!user) {
                return;
            }

            const existingContact =
                get().contacts[userId];

            const contact: CachedContact = {
                userId,
                name: name.trim(),
                createdAt:
                    existingContact?.createdAt ??
                    Date.now(),
            };

            await db.contacts.put(contact);

            set((state) => ({
                contacts: {
                    ...state.contacts,
                    [userId]: contact,
                },
            }));
        },

        updateContactName: async (
            userId,
            name,
        ) => {
            const existingContact =
                get().contacts[userId];

            if (!existingContact) {
                return;
            }

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
            if (!get().contacts[userId]) {
                return;
            }

            await db.contacts.delete(userId);

            set((state) => {
                const contacts = {
                    ...state.contacts,
                };

                delete contacts[userId];

                return {
                    contacts,
                };
            });
        },

        getUser: (userId) => {
            return get().users[userId];
        },

        getContact: (userId) => {
            const user = get().users[userId];

            if (!user) {
                return undefined;
            }

            return {
                ...user,
                contact: get().contacts[userId],
            };
        },

        getContacts: (): Contact[] => {
            const { users, contacts } = get();

            const result: Contact[] = [];

            for (const contact of Object.values(contacts)) {
                const user = users[contact.userId];

                if (!user) {
                    continue;
                }

                result.push({
                    ...user,
                    contact,
                });
            }

            return result;
        },

        fetchUserByUsername: async (
            username,
        ) => {
            const normalizedUsername = username
                .trim()
                .replace(/^@/, '');

            if (!normalizedUsername) {
                return undefined;
            }

            const existingUser = Object.values(
                get().users,
            ).find(
                (user) =>
                    user.username.toLowerCase() ===
                    normalizedUsername.toLowerCase(),
            );

            if (existingUser) {
                return {
                    ...existingUser,
                    contact:
                        get().contacts[
                        existingUser.id
                        ],
                };
            }

            const response =
                await api.get<UserPreview>(
                    `/users/${encodeURIComponent(
                        normalizedUsername,
                    )}`,
                );

            const user = response.data;

            get().addUser(user);

            return {
                ...user,
                contact:
                    get().contacts[user.id],
            };
        },

        fetchContacts: async () => {
            const { contacts, users } = get();

            const missingUserIds =
                Object.keys(contacts).filter(
                    (userId) => !users[userId],
                );

            if (missingUserIds.length > 0) {
                const response =
                    await api.get<UserPreview[]>(
                        '/users',
                        {
                            params: {
                                ids: missingUserIds.join(
                                    ',',
                                ),
                            },
                        },
                    );

                get().addUsers(
                    response.data,
                );
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
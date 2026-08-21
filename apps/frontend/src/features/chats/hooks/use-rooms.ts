'use client';

import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '@/db/db';
import { useSession } from '@/features/auth/providers/session-provider';
import { formatDirectRoom } from '@/features/chats/lib/rooms';
import { Room } from '@/features/chats/types/room';
import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { api } from '@/lib/axios';

export function useRooms() {
    const session = useSession();

    if (!session) {
        throw new Error('User not authenticated');
    }

    const addUsers = useContactsStore((state) => state.addUsers);
    const getContact = useContactsStore((state) => state.getContact);

    const messages = useLiveQuery(async () => {
        const rawMessages = await db.messages
            .orderBy('sentAt')
            .toArray();

        return Object.groupBy(
            rawMessages,
            (message) => message.roomId,
        );
    }, []);

    const {
        data: roomsData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['rooms', 'list'],
        queryFn: async () => {
            const response = await api.get<Room[]>('/rooms');

            return response.data;
        },
    });

    const userMap = useMemo(() => {
        const users = new Map<
            string,
            NonNullable<Room['members'][number]['user']>
        >();

        if (!roomsData) {
            return users;
        }

        for (const room of roomsData) {
            for (const member of room.members) {
                if (member.user) {
                    users.set(member.user.id, member.user);
                }
            }
        }

        return users;
    }, [roomsData]);

    useEffect(() => {
        if (userMap.size > 0) {
            addUsers(Array.from(userMap.values()));
        }
    }, [userMap, addUsers]);

    const rooms = useMemo(() => {
        if (!roomsData) {
            return [];
        }

        return roomsData
            .map((room) => {
                const roomMessages = messages?.[room.id] ?? [];

                const unreadMessages = roomMessages.filter(
                    ({ isRead, senderId }) =>
                        !isRead && senderId !== session.user.id,
                );

                const lastMessage = roomMessages.at(-1) ?? null;

                const lastMessageSender = lastMessage
                    ? userMap.get(lastMessage.senderId)
                    : undefined;

                const lastMessageWithSender = lastMessage
                    ? {
                        ...lastMessage,
                        sender: lastMessageSender,
                    }
                    : null;

                const formattedRoom = formatDirectRoom(room, session.user);

                if (!formattedRoom.isGroup) {
                    const otherMember = room.members.find(
                        (member) =>
                            member.userId !== session.user.id,
                    );

                    if (otherMember) {
                        const contact = getContact(
                            otherMember.userId,
                        );

                        if (contact?.contact) {
                            formattedRoom.name =
                                contact.contact.name;
                        }
                    }
                }

                return {
                    ...formattedRoom,
                    lastMessage: lastMessageWithSender,
                    unread: unreadMessages.length,
                };
            })
            .sort(
                (a, b) =>
                    new Date(
                        b.lastMessage?.sentAt ?? 0,
                    ).getTime() -
                    new Date(
                        a.lastMessage?.sentAt ?? 0,
                    ).getTime(),
            );
    }, [
        roomsData,
        messages,
        session.user,
        userMap,
        getContact,
    ]);

    return {
        rooms,
        isLoading,
        isError,
    };
}
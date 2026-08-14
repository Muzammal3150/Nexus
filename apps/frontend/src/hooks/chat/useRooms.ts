'use client';

import { useEffect, useMemo } from 'react';

import { useSession } from '@/components/providers/session-provider';
import { db } from '@/db/db';
import { api } from '@/lib/axios';
import { formatDirectRoom } from '@/lib/chat/rooms';
import { useContactsStore } from '@/stores/contactStore';
import { Room } from '@/types/room';

import { useLiveQuery } from 'dexie-react-hooks';
import { useQuery } from '@tanstack/react-query';

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

        return Object.groupBy(rawMessages, (message) => message.roomId);
    }, []);

    const {
        data: roomsData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['get-rooms'],
        queryFn: async () => {
            const response = await api.get<Room[]>('/rooms');
            return response.data;
        },
    });

    const roomUsers = useMemo(() => {
        if (!roomsData) return [];

        const users = new Map();

        for (const room of roomsData) {
            for (const member of room.members) {
                if (member.user) {
                    users.set(
                        member.user.id,
                        member.user,
                    );
                }
            }
        }

        return Array.from(users.values());
    }, [roomsData]);

    useEffect(() => {
        if (roomUsers.length > 0) {
            addUsers(roomUsers);
        }
    }, [roomUsers, addUsers]);

    const rooms = useMemo(() => {
        if (!roomsData) return [];


        return roomsData.map((room) => {
            const roomMessages = messages?.[room.id] ?? [];

            const unreadMessages = roomMessages.filter(({ isRead, senderId }) =>
                !isRead &&
                senderId !==
                session.user.id,
            );

            const lastMessage = roomMessages.at(-1) ?? null;

            const lastMessageWithSender = lastMessage ? {
                ...lastMessage,
                sender: getContact(lastMessage.senderId),
            }
                : null;


            const formattedRoom = formatDirectRoom(room, session.user);

            if (!formattedRoom.isGroup) {
                const otherMember = room.members.find((member) =>
                    member.userId !== session.user.id,
                );

                if (otherMember) {
                    const contact = getContact(otherMember.userId);

                    if (contact?.contact) {
                        formattedRoom.name = contact.contact.name;
                    }
                }
            }

            return {
                ...formattedRoom,
                lastMessage: lastMessageWithSender,
                unread: unreadMessages.length,
            };
        }).sort(
            (a, b) =>
                new Date(b.lastMessage?.sentAt ?? 0).getTime() -
                new Date(a.lastMessage?.sentAt ?? 0).getTime(),
        );
    }, [roomsData, messages, session.user, getContact]);

    return {
        rooms,
        isLoading,
        isError,
    };
}
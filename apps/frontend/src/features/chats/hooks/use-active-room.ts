import { useSession } from '@/features/auth/providers/session-provider';
import { formatDirectRoom } from '@/features/chats/lib/rooms';
import { Room } from '@/features/chats/types/room';
import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { api } from '@/lib/axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useActiveRoom() {
    const { roomId } = useParams<{ roomId: string; }>();

    const session = useSession()!;

    const getContact = useContactsStore((state) => state.getContact);

    const [isLoading, setIsLoading] =useState(true);

    const [room, setRoom] =useState<Room | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadRoom() {
            if (!roomId) {
                setRoom(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const { data } =
                    await api.get<Room>(
                        `/rooms/${roomId}`,
                    );

                if (!cancelled) {
                    setRoom(data);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        'Failed to load room:',
                        error,
                    );
                    setRoom(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadRoom();

        return () => {
            cancelled = true;
        };
    }, [roomId]);

    const formattedRoom = room
        ? formatDirectRoom(
            room,
            session.user,
        )
        : null;

    if (
        formattedRoom &&
        !formattedRoom.isGroup
    ) {
        const otherMember = room?.members.find(
            ({ userId }) =>
                userId !== session.user.id,
        );

        if (otherMember) {
            const contact = getContact(
                otherMember.userId,
            );

            if (contact?.contact?.name) {
                formattedRoom.name =
                    contact.contact.name;
            }
        }
    }

    return {
        roomId,
        room: formattedRoom,
        isLoading,
    };
}
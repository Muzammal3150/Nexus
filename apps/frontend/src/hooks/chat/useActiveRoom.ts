import { useSession } from '@/components/providers/session-provider';
import { api } from '@/lib/axios';
import { formatDirectRoom } from '@/lib/chat/rooms';
import { useContactsStore } from '@/stores/contactStore';
import { Room } from '@/types/room';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useActiveRoom() {
    const { roomId } = useParams<{ roomId: string; }>();

    const session = useSession()!;

    const getContact = useContactsStore(
        (state) => state.getContact,
    );

    const [isLoading, setIsLoading] =
        useState(true);

    const [room, setRoom] =
        useState<Room | null>(null);

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
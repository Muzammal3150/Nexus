import { useSession } from '@/features/auth/providers/session-provider';
import { formatDirectRoom } from '@/features/chats/lib/rooms';
import { Room } from '@/features/chats/types/room';
import { useContactsStore } from '@/features/contacts/stores/contact-store';
import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export function useActiveRoom() {
    const { roomId } = useParams<{ roomId: string }>();
    const session = useSession()!;
    const getContact = useContactsStore((state) => state.getContact);

    const { data: room, isLoading, isError } = useQuery({
        queryKey: ['rooms', 'active', roomId],
        queryFn: async () => {
            const { data } = await api.get<Room>(`/rooms/${roomId}`);
            return data;
        },
        enabled: !!roomId,
    });

    const formattedRoom = room ? formatDirectRoom(room, session.user) : null;

    if (room && formattedRoom && !formattedRoom.isGroup) {
        const otherMember = room.members.find(
            ({ userId }) => userId !== session.user.id
        );

        if (otherMember) {
            const contact = getContact(otherMember.userId);

            if (contact?.contact?.name) {
                formattedRoom.name = contact.contact.name;
            }
        }
    }

    return {
        roomId,
        room: formattedRoom,
        isLoading,
        isError,
    };
}
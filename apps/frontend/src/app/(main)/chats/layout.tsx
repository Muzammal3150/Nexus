import { RoomsList } from '@/components/chats/rooms-list';
import type { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {

    return (
        <>
            <RoomsList  />
            {children}
        </>
    );
}

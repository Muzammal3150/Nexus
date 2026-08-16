'use client';

import { ChatComposer } from '@/features/chats/components/chat/chat-composer';
import { ChatHeader } from '@/features/chats/components/chat/chat-header';
import { ChatThread } from '@/features/chats/components/chat/chat-thread';
import { LoadingPage } from '@/components/custom-ui/loading';
import { MessageScrollerProvider } from '@/components/ui/message-scroller';
import { useActiveRoom } from '@/features/chats/hooks/use-active-room';
import { useChats } from '@/features/chats/hooks/use-chats';
import { notFound } from 'next/navigation';
import GroupInfo from '@/features/chats/components/room-info';

export default function ChatPanel() {
    const { roomId, room, isLoading } = useActiveRoom();
    const { groupedMessages } = useChats(roomId);

    if (isLoading) return <LoadingPage />;
    if (!room) return notFound();
    return (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <div className="flex flex-col h-full! w-full ">
                <ChatHeader room={room} />
                <div className="flex flex-col flex-1 overflow-auto relative">
                    <ChatThread className={''} messages={groupedMessages} room={room} />
                    <ChatComposer className="" roomId={roomId} />
                </div>
            </div>
            <GroupInfo room={room} />
        </MessageScrollerProvider>
    );
}

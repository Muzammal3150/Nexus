'use client';

import { ChatComposer } from '@/components/chat/chat-page/chat-composer';
import { ChatHeader } from '@/components/chat/chat-page/chat-header';
import { ChatThread } from '@/components/chat/chat-page/chat-thread';
import { LoadingPage } from '@/components/custom-ui/loading';
import { MessageScrollerProvider } from '@/components/ui/message-scroller';
import { useActiveRoom } from '@/hooks/chat/useActiveRoom';
import { useChats } from '@/hooks/chat/useChats';
import { notFound } from 'next/navigation';

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
        </MessageScrollerProvider>
    );
}

'use client';

import { ChatComposer } from '@/components/chat/chat-page/chat-composer';
import { ChatHeader } from '@/components/chat/chat-page/chat-header';
import { ChatThread } from '@/components/chat/chat-page/chat-thread';
import { MessageScrollerProvider } from '@/components/ui/message-scroller';
import { useActiveRoom } from '@/hooks/chat/useActiveRoom';
import { useChats } from '@/hooks/chat/useChats';

export default function ChatPanel() {
    const { roomId, room, isLoading } = useActiveRoom();
    const { groupedMessages } = useChats(roomId);

    if (isLoading) return 'Loading';
    return (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <div className="flex flex-col h-full! w-full ">
                <ChatHeader room={room!} />
                <div className="flex flex-col flex-1 overflow-auto relative">
                    <ChatThread className={''} messages={groupedMessages} />
                    <ChatComposer className="" roomId={roomId} />
                </div>
            </div>
        </MessageScrollerProvider>
    );
}

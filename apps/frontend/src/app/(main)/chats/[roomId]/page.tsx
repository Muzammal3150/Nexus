'use client';

import { ChatComposer } from '@/components/chats/chat-composer';
import { ChatHeader } from '@/components/chats/chat-header';
import { ChatThread } from '@/components/chats/chat-thread';
import { useActiveRoom } from '@/hooks/useActiveRoom';
import { useChats } from '@/hooks/useChats';

export default function ChatPanel() {
    const { roomId, room, isLoading } = useActiveRoom();
    const { groupedMessages } = useChats(roomId);

    if (isLoading) return 'Loading';
    return (
        <div className="flex flex-col h-dvh ">
            <ChatHeader room={room!} />
            <div className="flex flex-col flex-1 overflow-auto relative">
                <ChatThread messages={groupedMessages} />
                <ChatComposer roomId={roomId} />
            </div>
        </div>
    );
}

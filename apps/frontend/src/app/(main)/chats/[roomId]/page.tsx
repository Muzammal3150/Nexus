'use client';

import { ChatComposer } from '@/components/chats/chat-composer';
import { ChatHeader } from '@/components/chats/chat-header';
import { ChatThread } from '@/components/chats/chat-thread';
import { useActiveRoom } from '@/hooks/useActiveRoom';
import { useChats } from '@/hooks/useChats';

export default function ChatPanel() {
    const { roomId, room, isLoading } = useActiveRoom();
    const { onSend,messages } = useChats(roomId);
    if (isLoading) return 'Loading';
    return (
        <div className="flex flex-1 flex-col">
            <ChatHeader room={room!} />
            <ChatThread  messages={messages} />
            <ChatComposer onSend={onSend} />
        </div>
    );
}

'use client';

import ChatList from '@/components/ChatList';
import { chats, railItems } from '@/components/chats';
import ChatWindow from '@/components/ChatWindow';
import IconRail from '@/components/IconRail';
import { useState } from 'react';

export default function HomePage() {
    const [activeRail, setActiveRail] = useState('chats');
    const [activeChatId, setActiveChatId] = useState(chats[0].id);
    const [query, setQuery] = useState('');

    const activeChat = chats.find((c) => c.id === activeChatId);
    const railTitle = railItems.find((r) => r.key === activeRail)?.label ?? 'Chats';

    return (
        <div className="flex h-dvh w-full">
            <IconRail items={railItems} active={activeRail} onSelect={setActiveRail} />

            <ChatList
                title={railTitle}
                chats={chats}
                query={query}
                onQueryChange={setQuery}
                activeChatId={activeChatId}
                onSelectChat={setActiveChatId}
            />

            <ChatWindow chat={activeChat} />
        </div>
    );
}

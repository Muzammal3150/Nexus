import { MoreVertical, Search } from 'lucide-react';
import ChatListItem from './ChatListItem';

type Chat = {
    id: string;
    name: string;
};

interface ChatListProps {
    title: string;
    chats: Chat[];
    query: string;
    onQueryChange: (q: string) => void;
    activeChatId?: string | null;
    onSelectChat: (id: string) => void;
}

export default function ChatList({
    title,
    chats,
    query,
    onQueryChange,
    activeChatId,
    onSelectChat,
}: ChatListProps) {
    const filtered = chats.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="flex w-[320px] shrink-0 flex-col border-r border-border">
            <div className="flex items-center justify-between px-4 py-3">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            <div className="px-3 pb-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search or start a new chat"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filtered.map((chat) => (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        active={chat.id === activeChatId}
                        onClick={() => onSelectChat(chat.id)}
                    />
                ))}
            </div>
        </div>
    );
}

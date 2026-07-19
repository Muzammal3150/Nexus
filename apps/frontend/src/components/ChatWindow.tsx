import {
    CheckCheck,
    MoreVertical,
    Paperclip,
    Phone,
    Search,
    Send,
    Smile,
    Video,
} from 'lucide-react';
import { getInitials } from './chats';

type Chat = {
    name: string;
    avatarColor: string;
    typing: boolean;
    last: string;
    time: string;
};

type ChatWindowProps = {
    chat?: Chat;
};

export default function ChatWindow({ chat }: ChatWindowProps) {
    if (!chat) {
        return (
            <div className="flex flex-1 items-center justify-center bg-muted/20 text-muted-foreground">
                Select a chat to start messaging
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] bg-[length:20px_20px]">
            <ChatHeader chat={chat} />
            <ChatMessages chat={chat} />
            <ChatComposer />
        </div>
    );
}

function ChatHeader({ chat }) {
    return (
        <div className="flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium text-white ${chat.avatarColor}`}
                >
                    {getInitials(chat.name)}
                </div>
                <div>
                    <p className="text-sm font-medium leading-tight">{chat.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {chat.typing ? 'typing…' : 'last seen recently'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
                <button className="rounded-full p-2 hover:bg-muted">
                    <Video className="h-4 w-4" />
                </button>
                <button className="rounded-full p-2 hover:bg-muted">
                    <Phone className="h-4 w-4" />
                </button>
                <button className="rounded-full p-2 hover:bg-muted">
                    <Search className="h-4 w-4" />
                </button>
                <button className="rounded-full p-2 hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function ChatMessages({ chat }) {
    return (
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
            <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-background px-3.5 py-2 text-sm shadow-sm">
                    {chat.last}
                    <div className="mt-1 text-right text-[10px] text-muted-foreground">
                        {chat.time}
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-emerald-600 px-3.5 py-2 text-sm text-white shadow-sm">
                    Got it, thanks!
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-100">
                        12:44 PM <CheckCheck className="h-3 w-3" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatComposer() {
    return (
        <div className="flex items-center gap-2 border-t border-border bg-background px-4 py-3">
            <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <Smile className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <Paperclip className="h-5 w-5" />
            </button>
            <input
                placeholder="Type a message"
                className="flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Send className="h-4 w-4" />
            </button>
        </div>
    );
}

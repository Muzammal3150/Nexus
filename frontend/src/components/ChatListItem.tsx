import { CheckCheck } from "lucide-react";
import type { MouseEventHandler } from "react";
import { getInitials } from "./chats";

interface Chat {
  name: string;
  avatarColor: string;
  online?: boolean;
  unread: number;
  time: string;
  typing?: boolean;
  read?: boolean;
  last: string;
}

interface ChatListItemProps {
  chat: Chat;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function ChatListItem({
  chat,
  active,
  onClick,
}: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        active ? "bg-muted" : "hover:bg-muted/60"
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium text-white ${chat.avatarColor}`}
        >
          {getInitials(chat.name)}
        </div>
        {chat.online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium">{chat.name}</span>
          <span
            className={`shrink-0 text-xs ${
              chat.unread
                ? "font-medium text-emerald-600"
                : "text-muted-foreground"
            }`}
          >
            {chat.time}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={`flex items-center gap-1 truncate text-xs ${
              chat.typing ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            {chat.read && (
              <CheckCheck className="h-3.5 w-3.5 shrink-0 text-sky-500" />
            )}
            <span className="truncate">{chat.last}</span>
          </span>
          {chat.unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-medium text-white">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

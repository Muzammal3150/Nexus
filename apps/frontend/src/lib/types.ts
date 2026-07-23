import { User } from "better-auth";

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  typing?: boolean;
  read?: boolean;
  /** index into the theme's chart color tokens, 1-5 */
  colorIndex: 1 | 2 | 3 | 4 | 5;
}

export type MessageRole = "user" | "assistant";
export type MessageStatus = "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  user: User;
  isMine: boolean
}

export type NavKey =
  | "chats"
  | "calls"
  | "status"
  | "communities"
  | "archived"
  | "starred";

export interface NavItem {
  key: NavKey;
  label: string;
}

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
  role: MessageRole;
  text: string;
  time: string;
  status?: MessageStatus;
}

/* ---------------------------- Calls page ---------------------------- */

// export type CallDirection = "incoming" | "outgoing" | "missed";
// export type CallMethod = "video" | "audio";

// export interface FavouriteContact {
//   id: string;
//   name: string;
//   colorIndex: 1 | 2 | 3 | 4 | 5;
//   online?: boolean;
// }

// export interface RecentCall {
//   id: string;
//   name: string;
//   colorIndex: 1 | 2 | 3 | 4 | 5;
//   direction: CallDirection;
//   method: CallMethod;
//   time: string;
// }

// /* -------------------------- Video call page -------------------------- */

// export interface Participant {
//   id: string;
//   name: string;
//   colorIndex: 1 | 2 | 3 | 4 | 5;
//   isSelf?: boolean;
//   muted?: boolean;
//   cameraOff?: boolean;
//   speaking?: boolean;
//   screenSharing?: boolean;
// }

// /* --------------------------- New call dialog --------------------------- */

// export interface DirectoryUser {
//   id: string;
//   name: string;
//   username: string;
//   colorIndex: 1 | 2 | 3 | 4 | 5;
//   /** already has an open conversation with the current user */
//   isChatting?: boolean;
//   online?: boolean;
// }

// /** A person chosen in the New Call dialog — either a known directory user
//  * or someone typed in by username who isn't in the directory yet. */
// export interface CallSelection {
//   id: string;
//   name: string;
//   username: string;
//   colorIndex?: 1 | 2 | 3 | 4 | 5;
//   isUnknown?: boolean;
// }


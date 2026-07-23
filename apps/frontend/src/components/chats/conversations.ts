import type { Conversation, NavItem, ChatMessage } from "@/lib/types";

export const navItems: NavItem[] = [
  { key: "chats", label: "Chats" },
  { key: "status", label: "Status" },
  { key: "communities", label: "Communities" },
  { key: "archived", label: "Archived" },
  { key: "starred", label: "Starred" },
];

export const conversations: Conversation[] = [
  {
    id: "design-team",
    name: "Design Team",
    lastMessage: "Sara: sent the updated mockups",
    time: "12:41 PM",
    unread: 3,
    online: true,
    colorIndex: 1,
  },
  {
    id: "hamza-ali",
    name: "Hamza Ali",
    lastMessage: "Sounds good, see you then",
    time: "11:58 AM",
    unread: 0,
    online: true,
    colorIndex: 2,
  },
  {
    id: "ammar",
    name: "Ammar",
    lastMessage: "Typing…",
    time: "11:20 AM",
    unread: 0,
    typing: true,
    colorIndex: 3,
  },
  {
    id: "project-nova",
    name: "Project Nova",
    lastMessage: "You: I'll push the changes tonight",
    time: "9:03 AM",
    unread: 0,
    read: true,
    colorIndex: 4,
  },
  {
    id: "mom",
    name: "Mom",
    lastMessage: "Call me when you're free",
    time: "Yesterday",
    unread: 1,
    colorIndex: 5,
  },
  {
    id: "client-retail",
    name: "Client - Retail App",
    lastMessage: "Invoice #1042 has been paid",
    time: "Yesterday",
    unread: 0,
    read: true,
    colorIndex: 2,
  },
  {
    id: "cousins",
    name: "Cousins",
    lastMessage: "Bilal: who's coming this weekend",
    time: "Monday",
    unread: 12,
    colorIndex: 3,
  },
];

export const messagesByConversation: Record<string, ChatMessage[]> = {
  "design-team": [
    {
      id: "m1",
      role: "assistant",
      text: "Sara: sent the updated mockups. Take a look when you get a chance.",
      time: "12:38 PM",
    },
    {
      id: "m2",
      role: "user",
      text: "Got it, thanks! Looking now.",
      time: "12:41 PM",
      status: "read",
    },
  ],
  "hamza-ali": [
    {
      id: "m1",
      role: "assistant",
      text: "Are we still on for 4pm?",
      time: "11:50 AM",
    },
    {
      id: "m2",
      role: "user",
      text: "Yep, works for me.",
      time: "11:55 AM",
      status: "read",
    },
    {
      id: "m3",
      role: "assistant",
      text: "Sounds good, see you then.",
      time: "11:58 AM",
    },
  ],
};

export const defaultThread: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Hey! How's the project coming along?",
    time: "9:00 AM",
  },
  {
    id: "m2",
    role: "user",
    text: "Good progress — should have something to show by end of day.",
    time: "9:04 AM",
    status: "read",
  },
];

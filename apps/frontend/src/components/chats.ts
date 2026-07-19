export const chats = [
  {
    id: 1,
    name: "Design Team",
    last: "Sara: sent the updated mockups",
    time: "12:41 PM",
    unread: 3,
    online: true,
    avatarColor: "bg-primary",
  },
  {
    id: 2,
    name: "Hamza Ali",
    last: "Sounds good, see you then 👍",
    time: "11:58 AM",
    unread: 0,
    online: true,
    avatarColor: "bg-sky-500",
  },
  {
    id: 3,
    name: "Ammar (Brother)",
    last: "Typing…",
    time: "11:20 AM",
    unread: 0,
    typing: true,
    avatarColor: "bg-amber-500",
  },
  {
    id: 4,
    name: "Project Nova",
    last: "You: I'll push the changes tonight",
    time: "9:03 AM",
    unread: 0,
    read: true,
    avatarColor: "bg-violet-500",
  },
  {
    id: 5,
    name: "Mom",
    last: "Call me when you're free ❤️",
    time: "Yesterday",
    unread: 1,
    avatarColor: "bg-rose-500",
  },
  {
    id: 6,
    name: "Client - Retail App",
    last: "Invoice #1042 has been paid",
    time: "Yesterday",
    unread: 0,
    read: true,
    avatarColor: "bg-teal-500",
  },
  {
    id: 7,
    name: "Cousins 🎉",
    last: "Bilal: who's coming this weekend",
    time: "Monday",
    unread: 12,
    avatarColor: "bg-orange-500",
  },
];

export const railItems = [
  { key: "chats", label: "Chats" },
  { key: "status", label: "Status" },
  { key: "communities", label: "Communities" },
  { key: "archived", label: "Archived" },
  { key: "starred", label: "Starred" },
];

export function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

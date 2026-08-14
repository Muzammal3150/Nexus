export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  username: string;
};

export type PresenceStatus = "online" | "away" | "offline";

export interface Presence {
  status: PresenceStatus;
  lastSeen: Date;
  sharedGroups: number;
  mutualContacts: number;
}

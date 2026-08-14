import type { PresenceStatus } from "./types";

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const statusDotClass: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground/50",
};

export const statusLabel: Record<PresenceStatus, string> = {
  online: "Online now",
  away: "Away",
  offline: "Offline",
};

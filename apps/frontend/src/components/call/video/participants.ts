import type { Participant } from "@/lib/types";

export const participants: Participant[] = [
  { id: "you", name: "You", colorIndex: 2, isSelf: true, speaking: true },
  { id: "hamza", name: "Hamza Ali", colorIndex: 1 },
  { id: "sara", name: "Sara Khan", colorIndex: 3, cameraOff: true },
  { id: "ammar", name: "Ammar", colorIndex: 4 },
  { id: "bilal", name: "Bilal", colorIndex: 5, muted: true },
];

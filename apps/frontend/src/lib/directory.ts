import type { DirectoryUser } from "@/lib/types";

export const directory: DirectoryUser[] = [
  // People already chatting with (mirrors data/conversations.ts)
  {
    id: "design-team",
    name: "Design Team",
    username: "design.team",
    colorIndex: 1,
    isChatting: true,
    online: true,
  },
  {
    id: "hamza-ali",
    name: "Hamza Ali",
    username: "hamza.ali",
    colorIndex: 2,
    isChatting: true,
    online: true,
  },
  {
    id: "ammar",
    name: "Ammar",
    username: "ammar.k",
    colorIndex: 3,
    isChatting: true,
    online: true,
  },
  {
    id: "project-nova",
    name: "Project Nova",
    username: "project.nova",
    colorIndex: 4,
    isChatting: true,
  },
  {
    id: "mom",
    name: "Mom",
    username: "mom",
    colorIndex: 5,
    isChatting: true,
  },
  {
    id: "client-retail",
    name: "Client - Retail App",
    username: "retail.client",
    colorIndex: 2,
    isChatting: true,
  },
  {
    id: "cousins",
    name: "Cousins",
    username: "cousins.group",
    colorIndex: 3,
    isChatting: true,
  },

  // Wider org / app directory — not yet chatting with
  {
    id: "sara-khan",
    name: "Sara Khan",
    username: "sara.khan",
    colorIndex: 3,
    online: true,
  },
  {
    id: "bilal-ahmed",
    name: "Bilal Ahmed",
    username: "bilal.ahmed",
    colorIndex: 5,
  },
  {
    id: "usman-tariq",
    name: "Usman Tariq",
    username: "usman.t",
    colorIndex: 1,
    online: true,
  },
  {
    id: "fatima-noor",
    name: "Fatima Noor",
    username: "fatima.noor",
    colorIndex: 4,
  },
  {
    id: "zainab-malik",
    name: "Zainab Malik",
    username: "zainab.m",
    colorIndex: 2,
    online: true,
  },
];

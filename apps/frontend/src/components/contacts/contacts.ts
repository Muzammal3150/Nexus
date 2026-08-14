import { Contact } from "@/types/contacts";

export const contacts: Contact[] = [
  // Saved — in the user's address book
  {
    id: "hamza-ali",
    name: "Hamza Ali",
    username: "hamza.ali",
    colorIndex: 2,
    online: true,
    saved: true,
    about: "Busy building things",
  },
  {
    id: "ammar",
    name: "Ammar",
    username: "ammar.k",
    colorIndex: 3,
    online: true,
    saved: true,
    about: "At the gym 🏋️",
  },
  {
    id: "mom",
    name: "Mom",
    username: "mom",
    colorIndex: 5,
    saved: true,
    about: "Call anytime ❤️",
  },
  {
    id: "sara-khan",
    name: "Sara Khan",
    username: "sara.khan",
    colorIndex: 3,
    online: true,
    saved: true,
    about: "Design Team",
  },
  {
    id: "usman-tariq",
    name: "Usman Tariq",
    username: "usman.t",
    colorIndex: 1,
    online: true,
    saved: true,
    about: "Available",
  },

  // Not saved — people the user has crossed paths with but hasn't added
  {
    id: "client-retail",
    name: "Client - Retail App",
    username: "retail.client",
    colorIndex: 2,
    saved: false,
    about: "Invoice questions",
  },
  {
    id: "bilal-ahmed",
    name: "Bilal Ahmed",
    username: "bilal.ahmed",
    colorIndex: 5,
    saved: false,
  },
  {
    id: "fatima-noor",
    name: "Fatima Noor",
    username: "fatima.noor",
    colorIndex: 4,
    saved: false,
  },
  {
    id: "zainab-malik",
    name: "Zainab Malik",
    username: "zainab.m",
    colorIndex: 2,
    online: true,
    saved: false,
  },
];

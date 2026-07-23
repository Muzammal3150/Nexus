// lib/socket.js

import { io } from "socket.io-client";

const options = {
    autoConnect: false,
    withCredentials: true,
};

export const chatSocket = io(
    `http://localhost:8000/chat`,
    options
);


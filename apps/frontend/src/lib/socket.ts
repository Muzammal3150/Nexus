import { io } from "socket.io-client";

const options = {
    autoConnect: false,
    withCredentials: true,
};

export const chatSocket = io(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
    options
);
export const callSocket = io(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/call`,
    options
);

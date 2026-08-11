export const ChatEvents = {
    Chat: {

        Text: "chat:text",
        File: "chat:file",
        Received:"chat:received"
    },

    Room: {

        Create: "room:create",
        CreateBroadcast: "room:create-broadcast",
    },
    Error: "chat:error"

} as const
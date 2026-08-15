export const ChatEvents = {
    Chat: {

        Text: "chat:text",
        File: "chat:file",
        Received: "chat:received",
        Typing:"chat:typing"
    },

    Room: {
        Create: "room:create",
        CreateBroadcast: "room:create-broadcast",
    },

    Presence: {
        Subscribe: "presence:subscribe",
        Broadcast: "presence:broadcast"
    },

    Error: "chat:error"

} as const
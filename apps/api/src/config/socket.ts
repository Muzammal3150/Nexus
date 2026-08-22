import { CallSocket } from "../sockets/call/index.js"
import { ChatSocket } from "../sockets/chat/index.js"
import { SocketServer } from "../sockets/socket-server.js"


const socketServer = new SocketServer()
.register(new ChatSocket())
.register(new CallSocket())


export { socketServer }
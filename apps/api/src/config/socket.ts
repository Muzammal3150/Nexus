import { CallSocket } from "../modules/call/socket.js"
import { ChatSocket } from "../modules/chat/socket.js"

import { SocketServer } from "../sockets/socketServer.js"


const socketServer = new SocketServer()
.register(new ChatSocket())
.register(new CallSocket())


export { socketServer }


import { Router } from "express";
import { router as getRoomRouter } from './get-room.js'
import { createRoom } from "./create-room.js";
import { authorize } from "../authorize.js";
import { uploadRoomAvatar } from "../../config/roomAvatarUpload.js";
import { addMembers, removeMember, updateMember, leaveRoom } from "./member.js";
import { updateRoom } from "./update-room.js";

export const router: Router = Router();


// router.use('/members/',memberRouter)
router.use('/', getRoomRouter)
router.post("/", authorize, createRoom);


router.patch<{ roomId: string }>("/:roomId", authorize, uploadRoomAvatar.single("avatar"), updateRoom);
router.post<{ roomId: string }>("/:roomId/members", authorize, addMembers);
router.delete<{ roomId: string; userId: string }>("/:roomId/members/:userId", authorize, removeMember);
router.patch<{ roomId: string; userId: string }>("/:roomId/members/:userId", authorize, updateMember);
router.post<{ roomId: string; userId: string }>("/:roomId/leave", authorize, leaveRoom);

export default router;
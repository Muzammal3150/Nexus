import { Router } from "express";
import { uploadRoomAvatar } from "../../config/roomAvatarUpload.js";

import { createRoom } from "./controllers/createRoom.js";
import { getCommonRoom } from "./controllers/getCommonRoom.js";
import { addMembers, leaveRoom, removeMember, updateMember } from "./controllers/member.js";
import { updateRoom } from "./controllers/updateRoom.js";
import { getRooms, getRoom } from "./controllers/getRoom.js";


export const router: Router = Router();


router.get("/", getRooms);
router.post("/", createRoom);

router.get("/:roomId", getRoom);
router.patch<{ roomId: string }>("/:roomId", uploadRoomAvatar.single("avatar"), updateRoom);

router.post<{ roomId: string; userId: string }>("/:roomId/leave", leaveRoom);
router.post<{ roomId: string }>("/:roomId/members", addMembers);
router.delete<{ roomId: string; userId: string }>("/:roomId/members/:userId", removeMember);
router.patch<{ roomId: string; userId: string }>("/:roomId/members/:userId", updateMember);

router.get<{ userId: string }>('/common/:userId', getCommonRoom)

export default router;
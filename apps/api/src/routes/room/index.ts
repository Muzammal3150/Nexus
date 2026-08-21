import { Router } from "express";
import { router as getRoomRouter } from './get-room.js'
import { createRoom } from "./create-room.js";
import { updateRoom, addMembers, removeMember, leaveRoom } from "./update-room.js";
import { authorize } from "../authorize.js";
import { uploadRoomAvatar } from "../../config/roomAvatarUpload.js";

export const router: Router = Router();


// router.use('/members/',memberRouter)
router.use('/', getRoomRouter)
router.post("/", createRoom);


router.patch(
    "/:roomId",
    authorize,
    uploadRoomAvatar.single("avatar"),
    updateRoom
);
router.post("/:roomId/members", authorize, addMembers);
router.delete("/:roomId/members/:userId", authorize, removeMember);
router.post("/:roomId/leave", authorize, leaveRoom);

export default router;
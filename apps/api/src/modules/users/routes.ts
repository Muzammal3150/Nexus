import { Router } from "express";
import { uploadAvatar } from "../../config/avatarUpload.js";
import { updateAvatar } from "./controllers/updateAvatar.js";
import { getUser } from "./controllers/getUser.js";
import { getUsers } from "./controllers/getUsers.js";

export const router: Router = Router();




router.get("/", getUsers);
router.get("/:username", getUser);
router.post("/avatar", uploadAvatar.single("avatar"), updateAvatar);
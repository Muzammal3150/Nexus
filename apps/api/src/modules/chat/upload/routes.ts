import { Router } from "express";
import { chatUpload } from "../../../config/chatUpload.js";
import { uploadChatFile, uploadChatFiles } from "./controller.js";


export const router: Router = Router();

router.post("/chat", chatUpload.single("file"), uploadChatFile);
router.post("/chat/many", chatUpload.array("files", 50), uploadChatFiles);
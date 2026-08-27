import { Router } from "express";

import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth.js";

import { authenticate } from "../middleware/routeAuth.js";
import { router as chatUploadRouter } from "../modules/chat/upload/routes.js";
import { router as roomsRouter } from "../modules/rooms/routes.js";
import { router as usersRouter } from "../modules/users/routes.js";

export const router: Router = Router();


router.all("/auth/*splat", toNodeHandler(auth));
router.use('/rooms', authenticate, roomsRouter)

router.use('/users', authenticate, usersRouter)
router.use('/uploads', authenticate, chatUploadRouter)
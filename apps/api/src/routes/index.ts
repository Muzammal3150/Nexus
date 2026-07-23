import { Router } from "express";

import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth.js";

// import { router as roomsRouter } from "./room.js";
import { router as usersRouter } from "./users.js";

export const router: Router = Router();


router.all("/auth/*splat", toNodeHandler(auth));
// router.use('/rooms', roomsRouter)
router.use('/users', usersRouter)
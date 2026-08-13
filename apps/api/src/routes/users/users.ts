import { Router } from "express";
import { router as getUsersRouter } from './GetUser.js'
import { router as avatarRouter } from './Avatar.js'

export const router: Router = Router();



router.use('/', getUsersRouter)
router.use('/', avatarRouter)

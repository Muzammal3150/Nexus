import { Router } from "express";
import { router as getRoomRouter } from './get-room.js'
// import { router as memberRouter } from './member.js'
export const router: Router = Router();


// router.use('/members/',memberRouter)
router.use('/', getRoomRouter)

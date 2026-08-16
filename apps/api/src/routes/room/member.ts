// import { Router } from 'express';
// import { prisma } from '../lib/prisma';

// const router = Router();

// async function requireRoomMember(roomId: string, userId: string) {
//     const member = await prisma.roomMembers.findUnique({
//         where: { roomId_userId: { roomId, userId } },
//     });

//     if (!member) throw new Error('NOT_MEMBER');

//     return member;
// }

// async function addMember(roomId: string, actorId: string, userId: string) {
//     const actor = await requireRoomMember(roomId, actorId);

//     if (actor.role !== 'admin') throw new Error('FORBIDDEN');

//     const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { id: true },
//     });

//     if (!user) throw new Error('USER_NOT_FOUND');

//     return prisma.roomMembers.create({
//         data: { roomId, userId, role: 'client' },
//         include: { user: true },
//     });
// }

// async function removeMember(roomId: string, actorId: string, userId: string) {
//     const actor = await requireRoomMember(roomId, actorId);

//     if (actorId !== userId && actor.role !== 'admin') {
//         throw new Error('FORBIDDEN');
//     }

//     const member = await prisma.roomMembers.findUnique({
//         where: { roomId_userId: { roomId, userId } },
//     });

//     if (!member) throw new Error('NOT_MEMBER');

//     return prisma.roomMembers.delete({
//         where: { roomId_userId: { roomId, userId } },
//     });
// }

// async function updateMemberRole(
//     roomId: string,
//     actorId: string,
//     userId: string,
//     role: 'admin' | 'client',
// ) {
//     const actor = await requireRoomMember(roomId, actorId);

//     if (actor.role !== 'admin') throw new Error('FORBIDDEN');

//     const member = await prisma.roomMembers.findUnique({
//         where: { roomId_userId: { roomId, userId } },
//     });

//     if (!member) throw new Error('NOT_MEMBER');

//     if (member.role === 'admin' && role === 'client') {
//         const adminCount = await prisma.roomMembers.count({
//             where: { roomId, role: 'admin' },
//         });

//         if (adminCount <= 1) {
//             throw new Error('LAST_ADMIN');
//         }
//     }

//     return prisma.roomMembers.update({
//         where: { roomId_userId: { roomId, userId } },
//         data: { role },
//         include: { user: true },
//     });
// }


// router.post('/:roomId/members', async (req, res) => {
//     try {
//         const { roomId } = req.params;
//         const { userId } = req.body;

//         if (!userId) {
//             return res.status(400).json({ error: 'userId is required' });
//         }

//         const member = await addMember(roomId, req.user.id, userId);

//         return res.status(201).json(member);
//     } catch (error) {
//         if (error instanceof Error) {
//             if (error.message === 'FORBIDDEN') {
//                 return res.status(403).json({ error: 'Forbidden' });
//             }

//             if (error.message === 'NOT_MEMBER') {
//                 return res.status(403).json({ error: 'You are not a room member' });
//             }

//             if (error.message === 'USER_NOT_FOUND') {
//                 return res.status(404).json({ error: 'User not found' });
//             }
//         }

//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

// router.delete('/:roomId/members/:userId', async (req, res) => {
//     try {
//         const { roomId, userId } = req.params;

//         await removeMember(roomId, req.user.id, userId);

//         return res.sendStatus(204);
//     } catch (error) {
//         if (error instanceof Error) {
//             if (error.message === 'FORBIDDEN') {
//                 return res.status(403).json({ error: 'Forbidden' });
//             }

//             if (error.message === 'NOT_MEMBER') {
//                 return res.status(404).json({ error: 'Member not found' });
//             }
//         }

//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

// router.patch('/:roomId/members/:userId', async (req, res) => {
//     try {
//         const { roomId, userId } = req.params;
//         const { role } = req.body;

//         if (role !== 'admin' && role !== 'client') {
//             return res.status(400).json({
//                 error: 'role must be admin or client',
//             });
//         }

//         const member = await updateMemberRole(
//             roomId,
//             req.user.id,
//             userId,
//             role,
//         );

//         return res.json(member);
//     } catch (error) {
//         if (error instanceof Error) {
//             if (error.message === 'FORBIDDEN') {
//                 return res.status(403).json({ error: 'Forbidden' });
//             }

//             if (error.message === 'NOT_MEMBER') {
//                 return res.status(404).json({ error: 'Member not found' });
//             }
//         }

//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

// export {router};
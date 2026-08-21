import { Router } from 'express';
import { auth } from '../../config/auth.js';
import { uploadAvatar } from '../../config/avatarUpload.js';


export const router: Router = Router();

router.post('/avatar', uploadAvatar.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Avatar is required.',
            });
        }

        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session) {
            return res.status(401).json({
                message: 'Unauthorized.',
            });
        }


        await auth.api.updateUser({
            headers: req.headers,
            body: {
                image:`/uploads/avatars/${req.file.filename}`,
            },
        });

        return res.status(200).json({
            message: 'Avatar updated successfully.',
            image: `/uploads/avatars/${req.file.filename}`,
        });
    } catch {
        return res.status(500).json({
            message: 'Internal Server Error.',
        });
    }
},
);

export default router;
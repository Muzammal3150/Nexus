import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
    destination: './uploads/avatars',

    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${crypto.randomUUID()}${ext}`;

        cb(null, filename);
    },
});

export const uploadAvatar = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },

    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
        }

        cb(null, true);
    },
});
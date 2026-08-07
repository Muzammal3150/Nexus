// middleware/upload.ts

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads","chat");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,

    filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;

        cb(null, name);
    },
});

export const chatUpload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024 * 1024, // 1GB
    },
});
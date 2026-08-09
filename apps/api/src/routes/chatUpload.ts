import { Router } from "express";
import { chatUpload } from "../config/chatUpload.js";


export const router: Router = Router();

router.post("/chat", chatUpload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    res.json({
        success: true,
        file: parseFile(req.file),
    });
});

router.post("/chat/many", chatUpload.array("files", 50), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: "No files uploaded",
        });
    }

    const files = (req.files as Express.Multer.File[]).map((file) => parseFile(file));

    res.json({
        success: true,
        files,
    });
});


function parseFile({ filename, originalname, size, mimetype }: Express.Multer.File) {
    return {
        filename,
        originalname,
        size,
        mimetype,

    }
}
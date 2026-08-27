import type { Request, Response } from "express";

function parseFile({ filename, originalname, size, mimetype }: Express.Multer.File) {
    return { filename, originalname, size, mimetype };
}

export function uploadChatFile(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    return res.json({
        success: true,
        file: parseFile(req.file),
    });
}

export function uploadChatFiles(req: Request, res: Response) {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: "No files uploaded",
        });
    }

    const files = (req.files as Express.Multer.File[]).map(parseFile);

    return res.json({
        success: true,
        files,
    });
}
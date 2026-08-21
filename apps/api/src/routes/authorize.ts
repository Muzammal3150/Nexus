import { type Request, type Response, type NextFunction } from "express";
import { auth } from "../config/auth.js";

export async function authorize(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.session = session;
        req.user = session.user;

        next();
        
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: "Unauthorized",
        });
    }
}
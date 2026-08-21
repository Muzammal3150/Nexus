import { type RequestHandler } from "express";
import { auth } from "../config/auth.js";

export const authorize: RequestHandler = async function authorize(req, res, next) {
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
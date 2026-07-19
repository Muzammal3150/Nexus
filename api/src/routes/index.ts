import { Router } from "express";

export const router: Router = Router();

router.use("/users", (req, res) => {
    console.log("users")
    res.json({
        "hello": "hello"
    })
});


import express from "express";


const app = express();

app.use(express.json());

app.use("/hello", () => {
    console.log("hello")
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
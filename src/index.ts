import express from "express";
import dotenv from "dotenv";
dotenv.config(); // Load .env to process.env object
import userRouter from "./routes/user";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => res.send("Hello world"));
app.use("/users", userRouter);
app.listen(port, () => console.log("started!"));

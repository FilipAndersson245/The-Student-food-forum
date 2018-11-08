import express from "express";
import userRouter from "./routes/user";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => res.send("Hello world"));
app.use("/users", userRouter);
app.listen(port, () => console.log("started!"));

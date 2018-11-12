import express from "express";
import dotenv from "dotenv";
dotenv.config(); // Load .env to process.env object
import userRouter from "./routes/usersRoute";
import { GetConnection } from "./db/getConnection";
import { Users } from "./db/entity/users";
import votesRouter from "./routes/votesRouter";
import tagsRouter from "./routes/tagsRouter";
import recipesRouter from "./routes/recipesRouter";
import bodyparser from "body-parser";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(bodyparser.json());
app.use("/users", userRouter);
app.use("/votes", votesRouter);
app.use("/comments", votesRouter);
app.use("/tags", tagsRouter);
app.use("/recipes", recipesRouter);

app.listen(port, () => console.log("started!"));

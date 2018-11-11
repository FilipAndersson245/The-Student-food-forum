import express from "express";
import dotenv from "dotenv";
dotenv.config(); // Load .env to process.env object
import userRouter from "./routes/usersRoute";
import { GetConnection } from "./db/getConnection";
import { Users } from "./db/entity/users";
import votesRouter from "./routes/votesRouter";
import tagsRouter from "./routes/tagsRouter";
import recipesRouter from "./routes/recipesRouter";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (_req, res) => {
  const connection = await GetConnection();
  const user = new Users();
  user.Email = "123@gmail.com";
  user.hash = "adapjosfoidsvo5";
  user.Nickname = "Tommy";
  await connection.manager.save(user).catch((err) => console.error(err));
  res.send("Hello world");
});

app.use("/users", userRouter);
app.use("/votes", votesRouter);
app.use("/comments", votesRouter);
app.use("/tags", tagsRouter);
app.use("/recipes", recipesRouter);

app.listen(port, () => console.log("started!"));

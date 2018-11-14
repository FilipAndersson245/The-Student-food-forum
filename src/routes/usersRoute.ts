import express = require("express");
import { Users } from "../db/entity/users";
import { getRepository } from "typeorm";

const userRouter = express.Router();

userRouter.get("/", async (_req, res) => {
  const foo = await getRepository(Users)
    .createQueryBuilder("user")
    .select("user.nickname")
    .addSelect("user.image")
    .addSelect("user.id")
    .getMany();
  console.table(foo);
  res.status(200);
  res.json(foo);
});

userRouter.post("/", async (_req, res) => {
  // EXAMPLE
  const repo = getRepository(Users);
  const user = new Users();
  user.email = "abc12345@gmail.com";
  user.hash = "abcdef";
  user.nickname = "bob12345";

  await repo.insert(user).catch(console.error);
  res.sendStatus(200);
});

userRouter.delete("/{userId}", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.put("/{userId}", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.post("/login", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.post("/logout", async (_req, res) => {
  res.sendStatus(200);
});

export default userRouter;

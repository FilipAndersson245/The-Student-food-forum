import express = require("express");
import { Users } from "../db/entity/users";
import { getRepository } from "typeorm";
import { sqlpromiseHandler } from "../db/dbHelpers";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const query = getRepository(Users)
    .createQueryBuilder("user")
    .select(["user.nickname", "user.image", "user.id"])
    .where((qp) => {
      !!req.query.search &&
        qp.andWhere("user.nickname like :nickname", {
          nickname: `%${req.query.search}%`
        });
    })
    .offset(parseInt(req.query.offset, 10) || 0)
    .take(parseInt(req.query.limit, 10) || 25)
    .getMany();

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    console.log(error.errno);
    res.sendStatus(500);
  } else {
    res.json(data);
  }
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

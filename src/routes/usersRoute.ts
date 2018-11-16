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

userRouter.post("/", async (req, res) => {
  // EXAMPLE
  const repo = getRepository(Users);
  const user = new Users();

  if (req.body.email && req.body.nickname && req.body.password) {
    user.email = req.body.email;
    user.nickname = req.body.nickname;
    user.hash = `TEMPHASH_${req.body.password}`;

    console.table(user);

    const { error } = await sqlpromiseHandler(repo.insert(user));
    if (error) {
      res.sendStatus(500);
    } else {
      res.setHeader("location", 10);
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(400);
  }
});

userRouter.delete("/:userId", async (req, res) => {
  const userId: string = req.params.userId;
  console.log(userId);
  const repo = getRepository(Users);
  const query = repo
    .createQueryBuilder("user")
    .delete()
    .where("id = :id", { id: userId })
    .execute();

  const result = await sqlpromiseHandler(query);
  if (result.error) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
  }
});

userRouter.put("/:userId", async (req, res) => {
  const userId: string | undefined = req.params.userId;
  console.log(userId);
  if (!userId) {
    res.sendStatus(400);
    return;
  }
  const values = {
    ...(req.body.nickname ? { nickname: req.body.nickname } : null),
    ...(req.body.email ? { email: req.body.email } : null)
  };

  if (Object.keys(values).length === 0) {
    console.table(req.body);
    console.table(values);
    res.sendStatus(400);
    return;
  }

  const repo = getRepository(Users);
  const query = repo
    .createQueryBuilder("user")
    .update(Users)
    .where("users.id = :id", { id: userId })
    .set(values)
    .execute();
  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    res.sendStatus(500);
    return;
  } else {
    console.log(data!.generatedMaps);
    res.sendStatus(200);
    return;
  }
});

userRouter.post("/login", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.post("/logout", async (_req, res) => {
  res.sendStatus(200);
});

export default userRouter;

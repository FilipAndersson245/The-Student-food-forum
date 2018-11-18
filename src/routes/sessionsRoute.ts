import express = require("express");
import { getRepository } from "typeorm";
import { Users } from "../db/entity/users";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

const sessionRouter = express.Router();

sessionRouter.post("/", async (req, res) => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  const grantType: string = req.body.grant_type;
  console.table(req.body);
  if (!username || !password || !grantType) {
    res.status(400).json({ message: "Missing parameters" });
    return;
  }
  if (grantType !== "password") {
    res.sendStatus(400).json({ message: "grand_type not supported" });
  }
  const query = getRepository(Users)
    .createQueryBuilder("user")
    .select()
    .where("user.nickname = :username", { username })
    .getOne();

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    res.sendStatus(500);
    return;
  }
  if (await compare(password, data!.hash)) {
    const token = sign(
      { sub: data!.id, name: data!.nickname },
      process.env.TOKEN_SECRET!,
      {
        expiresIn: "5 days"
      }
    );
    res.status(200).send({ auth: true, token });
  } else {
    res.status(401).json({ message: "bad login attempt" });
    return;
  }
});

export default sessionRouter;

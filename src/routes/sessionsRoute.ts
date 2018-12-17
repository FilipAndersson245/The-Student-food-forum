import express = require("express");
import { getRepository } from "typeorm";
import { Accounts } from "../db/entity/accounts";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

const sessionRouter = express.Router();

sessionRouter.post("/", async (req, res) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const grantType: string = req.body.grant_type;
  if (!email || !password || !grantType) {
    res.status(400).json({ error: "Missing parameters!" });
    return;
  }
  if (grantType !== "password") {
    res.status(400).json({ error: "Grant type not supported!" });
    return;
  }
  const query = getRepository(Accounts)
    .createQueryBuilder("account")
    .select()
    .where("account.email = :email", { email })
    .getOne();

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    res.status(500).json({ error: "Internal server error!" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Account does not exist!" });
    return;
  }
  if (await compare(password, data!.passwordHash)) {
    const token = sign(
      { sub: data!.id, name: data!.nickname },
      process.env.TOKEN_SECRET!,
      {
        expiresIn: "5 days"
      }
    );
    res.status(200).json({ auth: true, token });
    return;
  } else {
    res.status(401).json({ error: "Bad login attempt!" });
    return;
  }
});

export default sessionRouter;

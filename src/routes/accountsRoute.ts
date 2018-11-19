import express = require("express");
import { Accounts } from "../db/entity/accounts";
import { getRepository } from "typeorm";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { hash } from "bcrypt";
import { authenticateHeader, verifyIdentity } from "../autentication";

const saltRounds = 7;

const accountsRouter = express.Router();

accountsRouter.get("/", async (req, res) => {
  const query = getRepository(Accounts)
    .createQueryBuilder("accounts")
    .select(["accounts.nickname", "accounts.image", "accounts.id"])
    .where((qp) => {
      !!req.query.search &&
        qp.andWhere("accounts.nickname like :nickname", {
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

accountsRouter.post("/", async (req, res) => {
  const repo = getRepository(Accounts);
  const account = new Accounts();

  if (req.body.email && req.body.nickname && req.body.password) {
    account.email = req.body.email;
    account.nickname = req.body.nickname;
    account.passwordHash = await hash(req.body.password, saltRounds);

    console.table(account);

    const { error } = await sqlpromiseHandler(repo.insert(account));
    if (error) {
      res.sendStatus(500);
    } else {
      res.setHeader("location", 10); // <---- Not right, change later.
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(400);
  }
});

accountsRouter.delete("/:accountId", async (req, res) => {
  const accountId: string | undefined = req.params.accountId;
  if (!accountId) {
    res.sendStatus(400);
    return;
  }

  const token = authenticateHeader(req.headers.authorization);
  if (!verifyIdentity(accountId, token)) {
    res.sendStatus(401);
    return;
  }

  console.log(accountId);

  const repo = getRepository(Accounts);
  const query = repo
    .createQueryBuilder("account")
    .delete()
    .where("account.id = :id", { id: accountId })
    .execute();

  const result = await sqlpromiseHandler(query);
  if (result.error) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
  }
});

accountsRouter.put("/:accountId", async (req, res) => {
  const accountId: string | undefined = req.params.userId;
  if (!accountId) {
    res.sendStatus(400);
    return;
  }
  const token = authenticateHeader(req.headers.authorization);
  if (!verifyIdentity(accountId, token)) {
    res.sendStatus(401);
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

  const repo = getRepository(Accounts);
  const query = repo
    .createQueryBuilder("account")
    .update(Accounts)
    .where("account.id = :id", { id: accountId })
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

accountsRouter.post("/login", async (_req, res) => {
  res.sendStatus(200);
});

accountsRouter.post("/logout", async (_req, res) => {
  res.sendStatus(200);
});

export default accountsRouter;

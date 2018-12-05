import express = require("express");
import { Accounts } from "../db/entity/accounts";
import { getRepository } from "typeorm";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { hash } from "bcrypt";
import { authenticateAndRespondWithMessages } from "../autentication";

const saltRounds = 7;

const accountsRouter = express.Router();

accountsRouter.get("/", async (req, res) => {
  const query = getRepository(Accounts)
    .createQueryBuilder("account")
    .select(["account.nickname", "account.image", "account.id"])
    .where((qp) => {
      !!req.query.search &&
        qp.andWhere("account.nickname like :nickname", {
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
    return res.status(400).json({ errorMessage: "Missing parameter" });
  }

  if (!authenticateAndRespondWithMessages(req, res)) {
    return;
  }

  const repo = getRepository(Accounts);
  const query = repo
    .createQueryBuilder("account")
    .delete()
    .where("account.id = :id", { id: accountId })
    .execute();

  const result = await sqlpromiseHandler(query);
  if (result.error) {
    return res.status(500).json({ errorMessage: "Deletion failed" });
  } else {
    return res.status(200).send();
  }
});

accountsRouter.put("/:accountId", async (req, res) => {
  const accountId: string | undefined = req.params.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }
  const values = {
    ...(req.body.nickname ? { nickname: req.body.nickname } : null),
    ...(req.body.email ? { email: req.body.email } : null)
  };

  if (Object.keys(values).length === 0) {
    return res.status(400).json({ errorMessage: "Missing parameters" });
  }

  const repo = getRepository(Accounts);
  const query = repo
    .createQueryBuilder("accounts")
    .update(Accounts)
    .where("accounts.id = :id", { id: accountId })
    .set(values)
    .execute();
  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error" });
  } else {
    console.log(data!.generatedMaps);
    return res.status(200).send();
  }
});

export default accountsRouter;

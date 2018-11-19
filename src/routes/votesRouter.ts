import express = require("express");
import { authenticateHeader, verifyIdentity } from "../autentication";
import { getRepository } from "typeorm";
import { Votes } from "../db/entity/votes";

const votesRouter = express.Router();

votesRouter.get("/", async (req, res) => {
  const id: string | undefined = req.query.accountId;
  if (!id) {
    res.status(400).send();
    return;
  }
  const token = authenticateHeader(req.headers.authorization);
  if (verifyIdentity(id, token)) {
    res.status(401).send();
    return;
  }

  getRepository(Votes)
    .createQueryBuilder("votes")
    .select(["votes.recieptId"])
    .where("votes.vote = 1")
    .andWhere("votes.accountId = :accountId", { accountId: id })
    .offset(parseInt(req.query.offset, 10) || 0)
    .take(parseInt(req.query.limit, 10) || 25)
    .getMany();
  res.sendStatus(200);
});

votesRouter.post("/", async (_req, res) => {
  res.sendStatus(200);
});

export default votesRouter;

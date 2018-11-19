import express = require("express");
import { authenticateHeader, verifyIdentity } from "../autentication";
import { getRepository } from "typeorm";
import { Votes } from "../db/entity/votes";
import { sqlpromiseHandler } from "../db/dbHelpers";

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

  const query = getRepository(Votes)
    .createQueryBuilder("votes")
    .select(["votes.recieptId"])
    .where("votes.vote = 1")
    .andWhere("votes.accountId = :accountId", { accountId: id })
    .offset(parseInt(req.query.offset, 10) || 0)
    .take(parseInt(req.query.limit, 10) || 25)
    .getMany();

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    res.status(500).send();
    return;
  }
  res.status(200).json(data);
});

votesRouter.post("/", async (_req, res) => {
  res.sendStatus(200);
});

export default votesRouter;

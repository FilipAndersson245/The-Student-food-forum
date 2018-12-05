import express = require("express");
import {
  authenticateHeader,
  authenticateAndRespondWithMessages
} from "../autentication";
import { getRepository } from "typeorm";
import { Votes } from "../db/entity/votes";
import { sqlpromiseHandler } from "../db/dbHelpers";

const votesRouter = express.Router();

votesRouter.get("/", async (req, res) => {
  const accountId: string | undefined = req.query.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }

  const query = getRepository(Votes).find({
    select: ["recipesId"],
    where: { accountId, vote: 1 },
    skip: parseInt(req.query.offset, 10) || 0,
    take: parseInt(req.query.limit, 10) || 25
  });

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).send();
  }
  return res.status(200).json(data);
});

votesRouter.post("/", async (req, res) => {
  const token = authenticateHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ errorMessage: "Unauthorized request!" });
  }

  const { accountsId, recipesId, vote } = req.body;
  if (!accountsId || !recipesId || !vote || vote > 1 || vote < -1) {
    return res.status(400).json({ errorMessage: "Missing requestParameter" });
  }

  if (token.sub !== accountsId) {
    return res
      .status(401)
      .json({ errorMessage: "Cannot create vote for other accounts" });
  }

  const voteObj = getRepository(Votes).create({ accountsId, recipesId, vote });
  const query = getRepository(Votes).insert(voteObj);
  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).send();
  }
  return res.sendStatus(200).send(data);
});

export default votesRouter;

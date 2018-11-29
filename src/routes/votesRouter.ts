import express = require("express");
import { authenticateHeader, verifyIdentity } from "../autentication";
import { getRepository } from "typeorm";
import { Votes } from "../db/entity/votes";
import { sqlpromiseHandler } from "../db/dbHelpers";

const votesRouter = express.Router();

votesRouter.get("/", async (req, res) => {
  // JWT AUTH CODE ################################################
  const id: string | undefined = req.query.accountId;
  if (!id) {
    return res.status(400).send();
  }
  const token = authenticateHeader(req.headers.authorization);
  if (!verifyIdentity(id, token)) {
    return res
      .status(401)
      .json({ errorMessage: "Unauthorized request!" })
      .end();
  }
  // END #########################################################

  const query = getRepository(Votes).find({
    select: ["recieptId"],
    where: { accountId: id, vote: 1 },
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

  const { accountId, recieptId, vote } = req.query;
  if (!accountId || !recieptId || !vote) {
    return res.status(400).json({ errorMessage: "Missing requestParameter" });
  }

  if (token.sub !== accountId) {
    return res
      .status(401)
      .json({ errorMessage: "Cannot create vote for other accounts" });
  }

  const voteObj = getRepository(Votes).create({ accountId, recieptId, vote });
  const query = getRepository(Votes).insert(voteObj);
  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).send();
  }
  return res.sendStatus(200).send(data);
});

export default votesRouter;

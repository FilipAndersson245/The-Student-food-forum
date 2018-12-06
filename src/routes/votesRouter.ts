import express = require("express");
import { authenticateAndRespondWithMessages } from "../autentication";
import { getRepository } from "typeorm";
import { Votes } from "../db/entity/votes";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { Accounts } from "../db/entity/accounts";
import { Recipes } from "../db/entity/recipes";

const votesRouter = express.Router();

votesRouter.get("/", async (req, res) => {
  const accountId: string | undefined = req.query.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }

  const repo = getRepository(Votes);
  const query = repo
    .createQueryBuilder("votes")
    .where("votes.accountsId = :accountId", { accountId })
    .andWhere("votes.vote", { vote: 1 })
    .execute();

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  }
  console.table(data);
  return res.status(200).json(data);
});

votesRouter.post("/", async (req, res) => {
  console.table(req.body);
  const token = authenticateAndRespondWithMessages(req, res);
  if (!token) {
    return;
  }

  const { accountsId, recipesId, vote } = req.body;
  if (
    !accountsId ||
    !recipesId ||
    vote === undefined ||
    vote > 1 ||
    vote < -1
  ) {
    return res.status(400).json({ errorMessage: "Missing requestParameter!" });
  }

  if (token.sub !== accountsId) {
    return res
      .status(401)
      .json({ errorMessage: "Cannot create vote for other accounts!" });
  }

  const voteObj = new Votes();
  try {
    voteObj.accounts = await getRepository(Accounts).findOneOrFail(accountsId);
    voteObj.recipes = await getRepository(Recipes).findOneOrFail(recipesId);
    voteObj.vote = vote;
  } catch {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  }
  const query = getRepository(Votes).save(voteObj);
  const { error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  }
  return res.status(200).send();
});

export default votesRouter;

import express = require("express");
import { authenticateAndRespondWithMessages } from "../autentication";
import { Comments } from "../db/entity/comments";
import { getRepository } from "typeorm";
import { Accounts } from "../db/entity/accounts";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";

const commentsRouter = express.Router();

commentsRouter.get("/", async (_req, res) => {
  res.sendStatus(200);
});

commentsRouter.post("/", async (req, res) => {
  const { content, recipeId } = req.body;
  if (!content || !recipeId) {
    return res.status(400).json({ errorMessage: "Missing parameter" });
  }

  const token = authenticateAndRespondWithMessages(req, res);
  if (!token) return;

  try {
    const recipe = await getRepository(Recipes).findOneOrFail({ id: recipeId });
    const account = await getRepository(Accounts).findOneOrFail({
      id: token.sub
    });
    const comment = new Comments();
    comment.content = content;
    comment.accounts = account;
    comment.recipes = recipe;
    const commentResult = await sqlpromiseHandler(
      getRepository(Comments).insert(comment)
    );
    if (commentResult.error) {
      return res.status(500).json({ errorMessage: "Failed creating comment" });
    }
  } catch (err) {
    return res.status(500).json({ errorMessage: "Internal server error." });
  }
  return res.status(200).send();
});

commentsRouter.delete("/:accountId", async (_req, res) => {
  return res.status(200).send();
});

commentsRouter.put("/:accountId", async (_req, res) => {
  return res.status(200).send();
});

export default commentsRouter;

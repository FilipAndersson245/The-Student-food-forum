import express = require("express");
import { authenticateAndRespondWithMessages } from "../autentication";
import { Comments } from "../db/entity/comments";
import { getRepository } from "typeorm";
import { Accounts } from "../db/entity/accounts";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";

const commentsRouter = express.Router();

commentsRouter.get("/", async (req, res) => {
  const { recipesId } = req.query;
  if (!recipesId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }
  const query = getRepository(Comments).find({
    select: ["id", "content", "updatedAt"],
    order: { updatedAt: "ASC" }, // Change doc
    skip: parseInt(req.query.offset, 10) || 0,
    take: parseInt(req.query.limit, 10) || 25
  });

  const { data, error } = await sqlpromiseHandler(query);
  if (error || !data) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  }
  return res.status(200).json(data);
});

commentsRouter.post("/", async (req, res) => {
  const { content, recipeId } = req.body;
  if (!content || !recipeId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
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
      return res.status(500).json({ errorMessage: "Failed creating comment!" });
    }
  } catch (err) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  }
  return res.status(201).send();
});

commentsRouter.put("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res
      .status(400)
      .json({ errorMessage: "Missing required parameter in request!" });
  }

  const token = authenticateAndRespondWithMessages(req, res);
  if (!token) {
    return;
  }

  try {
    const account = await getRepository(Accounts).findOneOrFail(token.sub);
    const comment = await getRepository(Comments).findOneOrFail({
      id: commentId,
      accounts: account
    });
    comment.content = req.body.content;

    const query = getRepository(Comments).save(comment);

    const { error } = await sqlpromiseHandler(query);
    if (error) {
      return res.status(500).json({ errorMessage: "Failed deleting comment!" });
    }
    return res.status(200).send();
  } catch (err) {
    return res.status(400).json({ errorMessage: "Internal server error!" });
  }
});

commentsRouter.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res
      .status(400)
      .json({ errorMessage: "Missing required parameter in request!" });
  }

  const token = authenticateAndRespondWithMessages(req, res);
  if (!token) {
    return;
  }

  try {
    const account = await getRepository(Accounts).findOneOrFail(token.sub);
    const query = getRepository(Comments).delete({
      id: commentId,
      accounts: account
    });

    const { error } = await sqlpromiseHandler(query);
    if (error) {
      return res.status(500).json({ errorMessage: "Failed deleting comment!" });
    }
    return res.status(200).send();
  } catch (err) {
    return res.status(400).json({ errorMessage: "Internal server error!" });
  }
});

export default commentsRouter;

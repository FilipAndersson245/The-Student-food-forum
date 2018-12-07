import express = require("express");
import { getRepository, Like } from "typeorm";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { authenticateAndRespondWithMessages } from "../autentication";
import { Accounts } from "../db/entity/accounts";

const recipesRouter = express.Router();

recipesRouter.get("/", async (req, res) => {
  const query = getRepository(Recipes).find({
    select: ["id", "title", "content", "image", "rating", "updatedAt"],
    where: {
      ...(req.query.id ? { id: Like(`%${req.query.id}%`) } : null),
      ...(req.query.title ? { title: Like(`%${req.query.title}%`) } : null),
      ...(req.query.rating ? { rating: Like(`%${req.query.rating}%`) } : null),
      ...(req.query.updatedAt
        ? { updatedAt: Like(`%${req.query.updatedAt}%`) }
        : null)
    },
    skip: parseInt(req.query.offset, 10) || 0,
    take: parseInt(req.query.limit, 10) || 25
  });
  console.log(req.query);

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    console.log(error.errno);
    res.sendStatus(500);
  } else {
    console.table(data);
    res.json(data);
  }
});

recipesRouter.post("/", async (req, res) => {
  const accountId: string | undefined = req.query.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }

  if (req.body.title && req.body.content) {
    const repo = getRepository(Recipes);
    const recipe = new Recipes();

    try {
      recipe.accounts = await getRepository(Accounts).findOneOrFail(accountId);
    } catch (error) {
      return res.status(401).json({ errorMessage: "Cannot find account!" });
    }

    recipe.title = req.body.title;
    recipe.content = req.body.content;
    recipe.image = req.body.image;

    const { data, error } = await sqlpromiseHandler(repo.insert(recipe));
    if (error) {
      return res.status(500).json({ errorMessage: "Internal server error!" });
    } else {
      res.setHeader("location", `/recipes?id=${data!.identifiers[0].id}`);
      return res.status(200).send();
    }
  } else {
    return res.sendStatus(400);
  }
});

recipesRouter.put("/:recipeId", async (req, res) => {
  const recipeId = req.params.recipeId;
  if (!recipeId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  const token = authenticateAndRespondWithMessages(req, res);
  if (!token) {
    return;
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ errorMessage: "No changes sent!" });
  }

  let changedRecipe: Recipes;
  const repo = getRepository(Recipes);
  try {
    changedRecipe = await repo.findOneOrFail(recipeId, {
      relations: ["accounts"]
    });
  } catch {
    return res.status(500).json({ errorMessage: "Failed to find recipe!" });
  }

  if (!(changedRecipe.accounts.id === token.sub)) {
    return res
      .status(401)
      .json({ errorMessage: "This recipe does not belong to this account!" });
  }

  changedRecipe.title = req.body.title ? req.body.title : changedRecipe.title;
  changedRecipe.content = req.body.content
    ? req.body.content
    : changedRecipe.content;
  changedRecipe.image = req.body.image ? req.body.image : changedRecipe.image;

  const { data, error } = await sqlpromiseHandler(
    repo.update(changedRecipe.id, changedRecipe)
  );

  if (error) {
    return res.sendStatus(500);
  } else {
    console.log(data!.generatedMaps);
    return res.sendStatus(200);
  }
});

recipesRouter.delete("/:recipeId", async (req, res) => {
  const recipeId = req.params.recipeId;
  if (!recipeId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  const token = authenticateAndRespondWithMessages(req, res);
  if (!token) {
    return;
  }

  const repo = getRepository(Recipes);
  let changedRecipe: Recipes;
  try {
    changedRecipe = await repo.findOneOrFail(recipeId, {
      relations: ["accounts"]
    });
  } catch {
    return res.status(500).json({ errorMessage: "Failed to find recipe!" });
  }

  if (!(changedRecipe.accounts.id === token.sub)) {
    return res
      .status(401)
      .json({ errorMessage: "This recipe does not belong to this account!" });
  }

  const result = await sqlpromiseHandler(repo.delete(recipeId));
  if (result.error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    return res.sendStatus(200);
  }
});

export default recipesRouter;

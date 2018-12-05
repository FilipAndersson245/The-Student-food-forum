import express = require("express");
import { getRepository, Like } from "typeorm";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { authenticateHeader, verifyIdentity } from "../autentication";
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
  // JWT AUTH CODE ################################################
  const id: string | undefined = req.query.accountId;
  if (!id) {
    return res
      .status(400)
      .json({ errorMessage: "Missing ID!" })
      .end();
  }
  const token = authenticateHeader(req.headers.authorization);
  if (!verifyIdentity(id, token)) {
    return res
      .status(401)
      .json({ errorMessage: "Unauthorized request!" })
      .end();
  }
  // END #########################################################

  if (req.body.title && req.body.content) {
    const repo = getRepository(Recipes);
    const recipe = new Recipes();

    try {
      recipe.accounts = await getRepository(Accounts).findOneOrFail(id);
    } catch (error) {
      return res.status(401).json({ errorMessage: "Cannot find account!" });
    }

    recipe.title = req.body.title;
    recipe.content = req.body.content;
    recipe.image = req.body.image;
    recipe.tags = req.body.tags;

    const { error } = await sqlpromiseHandler(repo.insert(recipe));
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

recipesRouter.put("/:recipeId", async (req, res) => {
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

  const values = {
    ...(req.body.title ? { title: req.body.title } : null),
    ...(req.body.content ? { content: req.body.content } : null),
    ...(req.body.image ? { image: req.body.image } : null)
  };

  if (Object.keys(values).length === 0) {
    console.table(req.body);
    console.table(values);
    res.sendStatus(400);
    return;
  }

  const repo = getRepository(Recipes);
  const query = repo
    .createQueryBuilder("recipe")
    .update(Recipes)
    .where("recipe.id = :recipeId", { recipeId: req.query.recipeId })
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

recipesRouter.delete("/:recipeId", async (req, res) => {
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

  console.log(id);

  const repo = getRepository(Recipes);
  const query = repo
    .createQueryBuilder("recipe")
    .delete()
    .where("recipe.id = :recipeId", { recipeId: req.query.recipeId })
    .andWhere("recipe.users = :userId", { userId: id })
    .execute();

  const result = await sqlpromiseHandler(query);
  if (result.error) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
  }
});

export default recipesRouter;

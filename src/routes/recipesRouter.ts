import express = require("express");
import { getRepository } from "typeorm";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";

const recipesRouter = express.Router();

recipesRouter.get("/", async (req, res) => {
  const query = getRepository(Recipes)
    .createQueryBuilder("recipe")
    .select([
      "recipe.id",
      "recipe.title",
      "recipe.content",
      "recipe.image",
      "recipe.rating",
      "recipe.updatedAt",
      "recipe.users"
    ])
    .where((qp) => {
      !!req.query.search &&
        qp.andWhere("recipe.title like :title", {
          title: `%${req.query.search}%`
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

recipesRouter.post("/", async (req, res) => {
  // const repo = getRepository(Recipes);
  // const recipe = new Recipes();
  // if (req.body.userId && req.body.title && req.body.content) {
  //   recipe.users = recipe.nickname = req.body.nickname;
  //   recipe.hash = `TEMPHASH_${req.body.password}`;
  //   console.table(user);
  //   const { error } = await sqlpromiseHandler(repo.insert(user));
  //   if (error) {
  //     res.sendStatus(500);
  //   } else {
  //     res.setHeader("location", 10);
  //     res.sendStatus(200);
  //   }
  // } else {
  //   res.sendStatus(400);
  // }
});

recipesRouter.delete("/{userId}", async (_req, res) => {
  res.sendStatus(200);
});

recipesRouter.put("/{userId}", async (_req, res) => {
  res.sendStatus(200);
});

export default recipesRouter;

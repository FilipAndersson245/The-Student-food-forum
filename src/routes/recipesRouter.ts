import express = require("express");
import { getRepository, Like } from "typeorm";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { authenticateAndRespondWithMessages } from "../autentication";
import { Accounts } from "../db/entity/accounts";
import { v4 } from "uuid";
import multer from "multer";
import { uploadToS3 } from "../s3";

const recipesRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

recipesRouter.get("/", async (req, res) => {
  const query = getRepository(Recipes).find({
    select: ["id", "title", "content", "imageId", "updatedAt"],
    relations: ["votes"],
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

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    console.log(error.errno);
    res.sendStatus(500);
  } else {
    const dataWithVotes = data!.map((selectedRecepts) => {
      let vote = 0;
      selectedRecepts.votes.forEach((selectedVote) => {
        vote += selectedVote.vote;
      });
      return { ...selectedRecepts, vote, votes: undefined };
    });
    console.table(dataWithVotes);
    res.json(dataWithVotes);
  }
});

recipesRouter.post("/", upload.single("image"), async (req, res) => {
  const accountId: string | undefined = req.query.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }

  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ errorMessage: "Missing parameters" });
  }
  const repo = getRepository(Recipes);
  const recipe = new Recipes();

  try {
    recipe.accounts = await getRepository(Accounts).findOneOrFail(accountId);
  } catch (error) {
    return res.status(401).json({ errorMessage: "Cannot find account!" });
  }

  if (req.file) {
    if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ errorMessage: "Expected image file!" });
    }
    try {
      const generatedUUID = v4();
      console.log(req.file.buffer[0]);
      const paths = req.file.mimetype.split("/");
      const extension = paths[paths.length - 1];
      await uploadToS3(
        req.file.buffer,
        `${generatedUUID}.${extension}`,
        (s3error) => {
          if (s3error) {
            console.log(s3error);
            throw s3error;
          } else {
            recipe.imageId = generatedUUID;
          }
        }
      );
    } catch {
      return res.status(500).json({ errorMessage: "Image upload failed!" });
    }

    recipe.title = req.body.title;
    recipe.content = req.body.content;

    const { data, error } = await sqlpromiseHandler(repo.insert(recipe));
    if (error) {
      return res.status(500).json({ errorMessage: "Internal server error!" });
    } else {
      res.setHeader("location", `/recipes?id=${data!.identifiers[0].id}`);
      return res.status(200).send();
    }
  } else {
    return res.status(400).json({ errorMessage: "Bad request!" });
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
  changedRecipe.imageId = req.body.image
    ? req.body.image
    : changedRecipe.imageId;

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

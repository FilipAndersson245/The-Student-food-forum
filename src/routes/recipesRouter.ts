import express = require("express");
import { getRepository, Like } from "typeorm";
import { Recipes } from "../db/entity/recipes";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { authenticateAndRespondWithMessages } from "../autentication";
import { Accounts } from "../db/entity/accounts";
import { v4 } from "uuid";
import multer from "multer";
import {
  uploadRecipeImageToS3,
  deleteRecipeImageInS3,
  createLinkToS3FromId
} from "../s3";

const recipesRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() }).single("image");

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
    res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    const dataWithVotesAndImage = data!.map((selectedRecepts) => {
      let vote = 0;
      selectedRecepts.votes.forEach((selectedVote) => {
        vote += selectedVote.vote;
      });
      const image = createLinkToS3FromId("recipes", selectedRecepts.imageId);
      return { ...selectedRecepts, vote, image, votes: undefined };
    });
    res.status(200).json(dataWithVotesAndImage);
  }
});

recipesRouter.post("/", upload, async (req, res) => {
  const accountId: string | undefined = req.body.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }

  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ errorMessage: "Missing parameters!" });
  }
  const repo = getRepository(Recipes);
  const recipe = new Recipes();

  try {
    recipe.accounts = await getRepository(Accounts).findOneOrFail(accountId);
  } catch (error) {
    return res.status(404).json({ errorMessage: "Cannot find account!" });
  }

  if (req.file) {
    if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ errorMessage: "Expected image file!" });
    }
    try {
      const generatedUUID = v4();
      await uploadRecipeImageToS3(
        req.file.buffer,
        generatedUUID,
        req.file.mimetype,
        (s3error) => {
          if (s3error) {
            throw s3error;
          }
        }
      );
      recipe.imageId = generatedUUID;
    } catch {
      return res.status(500).json({ errorMessage: "Image upload failed!" });
    }
  }

  recipe.title = req.body.title;
  recipe.content = req.body.content;

  const { data, error } = await sqlpromiseHandler(repo.insert(recipe));
  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    res.setHeader("location", `/recipes?id=${data!.identifiers[0].id}`);
    return res.status(201).send();
  }
});

recipesRouter.patch("/:recipeId", upload, async (req, res) => {
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

  if (req.file) {
    if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ errorMessage: "Expected image file!" });
    }
    try {
      await uploadRecipeImageToS3(
        req.file.buffer,
        changedRecipe.imageId,
        req.file.mimetype,
        (s3error) => {
          if (s3error) {
            throw s3error;
          }
        }
      );
    } catch {
      return res.status(500).json({ errorMessage: "Image upload failed!" });
    }
  }

  changedRecipe.title = req.body.title ? req.body.title : changedRecipe.title;
  changedRecipe.content = req.body.content
    ? req.body.content
    : changedRecipe.content;

  const { error } = await sqlpromiseHandler(
    repo.update(changedRecipe.id, changedRecipe)
  );

  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    return res.status(200).send();
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
  let toBeDeletedRecipe: Recipes;
  try {
    toBeDeletedRecipe = await repo.findOneOrFail(recipeId, {
      relations: ["accounts"]
    });
  } catch {
    return res.status(404).json({ errorMessage: "Failed to find recipe!" });
  }

  if (!(toBeDeletedRecipe.accounts.id === token.sub)) {
    return res
      .status(401)
      .json({ errorMessage: "This recipe does not belong to this account!" });
  }

  try {
    await deleteRecipeImageInS3(toBeDeletedRecipe.imageId, (error) => {
      if (error) {
        throw error;
      }
    });
  } catch {
    return res.status(500).json({ errorMessage: "Failed deleting image!" });
  }

  const result = await sqlpromiseHandler(repo.delete(recipeId));

  if (result.error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    return res.status(200).send();
  }
});

export default recipesRouter;

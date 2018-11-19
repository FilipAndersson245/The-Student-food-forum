import express = require("express");

const recipesRouter = express.Router();

recipesRouter.get("/", async (_req, res) => {
  res.sendStatus(200);
});

recipesRouter.post("/", async (_req, res) => {
  res.sendStatus(200);
});

recipesRouter.delete("/:accountId", async (_req, res) => {
  res.sendStatus(200);
});

recipesRouter.put("/:accountId", async (_req, res) => {
  res.sendStatus(200);
});

export default recipesRouter;

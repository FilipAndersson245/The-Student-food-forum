import express = require("express");

const recipesRouter = express.Router();

recipesRouter.get("/", async (_req, res) => {
  res.send(200);
});

recipesRouter.post("/", async (_req, res) => {
  res.send(200);
});

recipesRouter.delete("/{userId}", async (_req, res) => {
  res.send(200);
});

recipesRouter.put("/{userId}", async (_req, res) => {
  res.send(200);
});

export default recipesRouter;

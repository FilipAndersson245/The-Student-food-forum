import express = require("express");

const votesRouter = express.Router();

votesRouter.get("/", async (_req, res) => {
  res.sendStatus(200);
});

votesRouter.post("/", async (_req, res) => {
  res.sendStatus(200);
});

export default votesRouter;

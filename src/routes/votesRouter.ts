import express = require("express");

const votesRouter = express.Router();

votesRouter.get("/", (_req, res) => {
  res.send(200);
});

votesRouter.post("/", (_req, res) => {
  res.send(200);
});

export default votesRouter;

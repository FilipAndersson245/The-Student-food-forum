import express = require("express");

const commentsRouter = express.Router();

commentsRouter.get("/", async (_req, res) => {
  res.sendStatus(200);
});

commentsRouter.post("/", async (_req, res) => {
  res.sendStatus(200);
});

commentsRouter.delete("/:accountId", async (_req, res) => {
  res.sendStatus(200);
});

commentsRouter.put("/:accountId", async (_req, res) => {
  res.sendStatus(200);
});

export default commentsRouter;

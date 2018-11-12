import express = require("express");

const tagsRouter = express.Router();

tagsRouter.get("/", async (_req, res) => {
  res.sendStatus(200);
});

export default tagsRouter;

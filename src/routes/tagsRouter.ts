import express = require("express");

const tagsRouter = express.Router();

tagsRouter.get("/", (_req, res) => {
  res.send(200);
});

export default tagsRouter;

import express = require("express");

const commentsRouter = express.Router();

commentsRouter.get("/", (_req, res) => {
  res.send(200);
});

commentsRouter.post("/", (_req, res) => {
  res.send(200);
});

commentsRouter.delete("/{userId}", async (_req, res) => {
  res.send(200);
});

commentsRouter.put("/{userId}", async (_req, res) => {
  res.send(200);
});

export default commentsRouter;

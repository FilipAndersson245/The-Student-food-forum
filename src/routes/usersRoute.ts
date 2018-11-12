import express = require("express");

const userRouter = express.Router();

userRouter.get("/", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.post("/", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.delete("/{userId}", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.put("/{userId}", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.post("/login", async (_req, res) => {
  res.sendStatus(200);
});

userRouter.post("/logout", async (_req, res) => {
  res.sendStatus(200);
});

export default userRouter;

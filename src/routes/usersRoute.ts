import express = require("express");

const userRouter = express.Router();

userRouter.get("/", (_req, res) => {
  res.send(200);
});

userRouter.post("/", (_req, res) => {
  res.send(200);
});

export default userRouter;

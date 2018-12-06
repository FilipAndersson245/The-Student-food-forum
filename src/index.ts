import express from "express";
import dotenv from "dotenv";
dotenv.config(); // Load .env to process.env object
import accountsRouter from "./routes/accountsRoute";
import votesRouter from "./routes/votesRouter";
import recipesRouter from "./routes/recipesRouter";
import bodyparser from "body-parser";
import morgan from "morgan";
import { GetConnection } from "./db/getConnection";
import sessionRouter from "./routes/sessionsRoute";
import commentsRouter from "./routes/commentsRoute";

GetConnection().then((_connection) => {
  const app = express();
  const port = process.env.PORT || 3000;

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    import("errorhandler").then((errorHandler) =>
      app.use(errorHandler.default())
    );
  }

  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: false }));
  app.use("/accounts", accountsRouter);
  app.use("/votes", votesRouter);
  app.use("/comments", commentsRouter);
  app.use("/recipes", recipesRouter);
  app.use("/sessions", sessionRouter);

  app.listen(port, () => console.log(`started webserver on:${port}`));
});

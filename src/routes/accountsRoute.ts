import express = require("express");
import { Accounts } from "../db/entity/accounts";
import { getRepository } from "typeorm";
import { sqlpromiseHandler } from "../db/dbHelpers";
import { hash } from "bcrypt";
import { authenticateAndRespondWithMessages } from "../autentication";
import multer from "multer";
import { uploadAccountImageToS3, deleteAccountImageInS3 } from "../s3";
import { v4 } from "uuid";
const saltRounds = 7;

const accountsRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() }).single("image");

accountsRouter.get("/", async (req, res) => {
  const query = getRepository(Accounts)
    .createQueryBuilder("account")
    .select(["account.nickname", "account.imageId", "account.id"])
    .where((qp) => {
      !!req.query.search &&
        qp.andWhere("account.nickname like :nickname", {
          nickname: `%${req.query.search}%`
        });
    })
    .offset(parseInt(req.query.offset, 10) || 0)
    .take(parseInt(req.query.limit, 10) || 25)
    .getMany();

  const { data, error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    return res.status(200).json(data);
  }
});

accountsRouter.post("/", async (req, res) => {
  const repo = getRepository(Accounts);
  const account = new Accounts();

  if (req.body.email && req.body.nickname && req.body.password) {
    account.email = req.body.email;
    account.nickname = req.body.nickname;
    account.passwordHash = await hash(req.body.password, saltRounds);
    account.imageId = v4();

    const { data, error } = await sqlpromiseHandler(repo.insert(account));
    if (error) {
      if (error.errno === 1062) {
        res.status(409).json({ errorMessage: "Email already taken!" });
      }
      res.status(500).json({ errorMessage: "Internal server error!" });
    } else {
      res.setHeader("location", `/accounts${data!.identifiers[0].id}`);
      res.status(201).send();
    }
  } else {
    res
      .status(400)
      .json({ errorMessage: "Missing required input parameter in body!" });
  }
});

accountsRouter.patch("/:accountId", upload, async (req, res) => {
  const accountId: string | undefined = req.params.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res, accountId)) {
    return;
  }

  let account: Accounts;
  try {
    account = await getRepository(Accounts).findOneOrFail(accountId);
  } catch (error) {
    return res.status(401).json({ errorMessage: "Cannot find account!" });
  }

  if (req.file) {
    if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ errorMessage: "Expected image file!" });
    }
    try {
      await uploadAccountImageToS3(
        req.file.buffer,
        account.imageId,
        req.file.mimetype,
        (s3error) => {
          if (s3error) {
            throw s3error;
          }
        }
      );
    } catch {
      return res.status(500).json({ errorMessage: "Image upload failed!" });
    }
  }

  const values = {
    ...(req.body.nickname ? { nickname: req.body.nickname } : null),
    ...(req.body.password
      ? { passwordHash: await hash(req.body.password, saltRounds) }
      : null)
  };

  if (Object.keys(values).length === 0) {
    return res.status(400).json({ errorMessage: "Missing parameters!" });
  }

  const repo = getRepository(Accounts);
  const query = repo
    .createQueryBuilder("accounts")
    .update(Accounts)
    .where("accounts.id = :id", { id: accountId })
    .set(values)
    .execute();
  const { error } = await sqlpromiseHandler(query);
  if (error) {
    return res.status(500).json({ errorMessage: "Internal server error!" });
  } else {
    return res.status(200).send();
  }
});

accountsRouter.delete("/:accountId", async (req, res) => {
  const accountId: string | undefined = req.params.accountId;
  if (!accountId) {
    return res.status(400).json({ errorMessage: "Missing parameter!" });
  }

  if (!authenticateAndRespondWithMessages(req, res)) {
    return;
  }

  let account: Accounts;
  try {
    account = await getRepository(Accounts).findOneOrFail(accountId);
  } catch {
    return res.status(404).json({ errorMessage: "Account was not found!" });
  }
  try {
    deleteAccountImageInS3(account.imageId, (error) => {
      if (error) {
        throw error;
      }
    });
  } catch {
    return res.status(500).json({ errorMessage: "Failed deleting image!" });
  }

  const repo = getRepository(Accounts);
  const query = repo
    .createQueryBuilder("accounts")
    .delete()
    .where("accounts.id = :id", { id: accountId })
    .execute();

  const result = await sqlpromiseHandler(query);
  if (result.error) {
    return res.status(500).json({ errorMessage: "Deletion failed!" });
  } else {
    return res.status(200).send();
  }
});

export default accountsRouter;

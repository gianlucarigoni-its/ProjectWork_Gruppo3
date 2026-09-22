import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";
import { home } from "./account.controller";

const router = Router({ mergeParams: true });

//router.use("/:accountId");
router.get("/home", home);

export default router;

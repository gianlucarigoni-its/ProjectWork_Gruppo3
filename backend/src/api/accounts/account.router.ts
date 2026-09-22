import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";
import { home } from "./account.controller";

const router = Router({ mergeParams: true });

router.use("/:accountId/transactions", transactionsRouter);
router.get("/home", home);

export default router;

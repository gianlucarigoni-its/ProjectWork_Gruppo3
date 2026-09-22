import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";

const router = Router({ mergeParams: true });

router.use("/:accountId/transactions", transactionsRouter);

export default router;

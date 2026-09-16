import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";

const router = Router();

router.use("/:accountId/transactions", transactionsRouter);

export default router;

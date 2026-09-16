import { Router } from "express";
import TransactionRouter from "./Transactions/Transaction.router";

const router = Router();

router.use("/trasiction", TransactionRouter);

export default router;

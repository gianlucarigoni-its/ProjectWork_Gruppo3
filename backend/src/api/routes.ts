import { Router } from "express";
import TransactionRouter from "./transactions/transaction.router";

const router = Router();

router.use("/trasiction", TransactionRouter);

export default router;

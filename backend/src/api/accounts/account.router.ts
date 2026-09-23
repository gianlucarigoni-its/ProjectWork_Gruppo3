import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";
import { home, getAccountById } from "./account.controller";

const router = Router({ mergeParams: true });


// Rotte per la Dashboard / Home dell'account
router.get("/home", home);


// Rotta per recuperare l'account specifico
router.get("/:accountId", getAccountById);

export default router;
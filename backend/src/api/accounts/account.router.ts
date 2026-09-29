import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";
import { home, profile } from "./account.controller";

const router = Router({ mergeParams: true });

// Rotte per i dettagli/home del conto
router.get("/home", home);

// Rotta per recuperare l'account specifico tramite ID
router.get("/profile", profile);

export default router;

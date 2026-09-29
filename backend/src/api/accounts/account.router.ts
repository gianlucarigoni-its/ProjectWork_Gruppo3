import { Router } from "express";
import transactionsRouter from "../transactions/transaction.router";
import { home, getAccountById } from "./account.controller";

const router = Router({ mergeParams: true });

// Rotte per i dettagli/home del conto
router.get("/home", home);
router.get("/dettagli", home); // <-- AGGIUNTA: permette al frontend di chiamare /api/conto/dettagli

// Rotta per recuperare l'account specifico tramite ID
router.get("/:accountId", getAccountById);

export default router;
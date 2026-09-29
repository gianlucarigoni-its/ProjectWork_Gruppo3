import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { find, topUp, transfer } from "./transaction.controller";
import { Filter, TopUpDto, TransferDto } from "./transaction.dto";

const router = Router({ mergeParams: true });

// Rotta per recuperare i movimenti (gestisce sia la radice che /recenti per il frontend)
router.get("/", validate(Filter, "query"), find);
router.get("/recenti", validate(Filter, "query"), find); // <-- AGGIUNTA: Risolve l'errore 404 su /api/movimenti/recenti

router.post("/transfer", validate(TransferDto, "body"), transfer);
router.post("/topup", validate(TopUpDto, "body"), topUp);

export default router;
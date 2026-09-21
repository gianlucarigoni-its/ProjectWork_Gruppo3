import { Router } from "express";
import { RicaricaController } from "./recharge/recharge.controller";
import { BonificoController } from "./transer/transfer.controller";
const router = Router();

router.use();
router.post("/recharge", RicaricaController.handleRicarica);
router.post("/transfer", BonificoController.handleBonifico);

export default router;

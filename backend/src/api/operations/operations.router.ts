import { Router } from "express";
import { RicaricaController } from "./recharge/recharge.controller";
import { BonificoController } from "./transer/transfer.controller";
import { authMiddleware } from "../../middleware/auth-middleware";
const router = Router();

router.post("/recharge", RicaricaController.handleRicarica);
router.post("/transfer", BonificoController.handleBonifico);

export default router;

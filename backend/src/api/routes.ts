import { Router } from "express";
import accountsRouter from "./accounts/accounts.router";
import { RicaricaController } from "../api/ricarica/ricarica.controller";
import { authMiddleware } from "../middleware/auth-middleware";
import { BonificoController } from "./ricarica/bonifco.controller";

const apiRouter = Router();

apiRouter.post("/operations/recharge", authMiddleware, RicaricaController.handleRicarica);
apiRouter.post("/operations/transfer", authMiddleware, BonificoController.handleBonifico);

export default apiRouter;

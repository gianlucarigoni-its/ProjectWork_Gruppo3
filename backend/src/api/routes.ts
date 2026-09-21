import { Router } from "express";
import accountsRouter from "./accounts/accounts.router";
<<<<<<< HEAD
import { RicaricaController } from '../api/ricarica/ricarica.controller';
import { authMiddleware } from '../middleware/auth-middleware';
import { BonificoController } from './ricarica/bonifco.controller';
=======
import transactionsRouter from "./transactions/transaction.router";
>>>>>>> 0029d5f (.)

const apiRouter = Router();

<<<<<<< HEAD
apiRouter.post('/operations/recharge',authMiddleware, RicaricaController.handleRicarica);
apiRouter.post('/operations/transfer', authMiddleware, BonificoController.handleBonifico);
=======
router.use("/accounts", accountsRouter);
router.use("/transactions", transactionsRouter);
>>>>>>> 0029d5f (.)

export default apiRouter;

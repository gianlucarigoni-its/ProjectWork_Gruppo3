import { Router } from "express";
import { isAuthenticated } from "../lib/auth/authenticated.middleware";
import accountsRouter from "./accounts/account.router";
import authRouter from "./auth/auth.router";
import transactionsRouter from "./transactions/transaction.router";

const apiRouter = Router();

// Rotta pubblica per l'autenticazione
apiRouter.use("/auth", authRouter);

// Middleware di autenticazione per le rotte protette
apiRouter.use(isAuthenticated);

apiRouter.use("/accounts", accountsRouter);

// Rotte per i movimenti/transazioni (sia in inglese che in italiano)
apiRouter.use("/transactions", transactionsRouter);

export default apiRouter;

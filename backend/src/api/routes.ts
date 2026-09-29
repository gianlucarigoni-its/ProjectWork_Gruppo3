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

// Rotte per il conto (sia in inglese che in italiano)
apiRouter.use("/account", accountsRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/conto", accountsRouter); // Mappatura per il frontend (/api/conto)

// Rotte per i movimenti/transazioni (sia in inglese che in italiano)
apiRouter.use("/transactions", transactionsRouter);
apiRouter.use("/movimenti", transactionsRouter); // Mappatura per il frontend (/api/movimenti)

export default apiRouter;
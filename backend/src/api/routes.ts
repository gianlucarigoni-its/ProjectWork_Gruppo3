import { Router } from "express";
import { isAuthenticated } from "../lib/auth/authenticated.middleware";
import accountsRouter from "./accounts/account.router";
import authRouter from "./auth/auth.router";
import transactionsRouter from "./transactions/transaction.router";
const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/account", accountsRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/transactions", transactionsRouter);

export default apiRouter;
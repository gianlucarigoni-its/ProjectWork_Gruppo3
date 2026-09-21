import { Router } from "express";
import accountsRouter from "./accounts/accounts.router";
import operationsRouter from "./operations/operations.router";
import authRouter from "./auth/auth.router";
import { authMiddleware } from "../middleware/auth-middleware";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/operations", operationsRouter);

export default apiRouter;

import { Router } from "express";
import accountsRouter from "./accounts/accounts.router";
import operationsRouter from "./operations/operations.router";
import { authMiddleware } from "../middleware/auth-middleware";

const apiRouter = Router();

apiRouter.use(authMiddleware);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/operations", operationsRouter);

export default apiRouter;

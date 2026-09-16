import { Router } from "express";
import { find } from "./transaction.controller";

const router = Router({ mergeParams: true });

router.use("/", find);

export default router;

import { Router } from "express";
import { find } from "./transaction.controller";

const router = Router();

router.get("/", find);

export default router;

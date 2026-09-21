import { Router } from "express";
import { richiedeAutenticazione } from "../../lib/auth.middleware";
import { getHomeData, getDettaglioMovimento } from "./account.controller";

const router = Router();

router.get("/home", richiedeAutenticazione, getHomeData);
router.get("/movimenti/:id", richiedeAutenticazione, getDettaglioMovimento);

export default router;
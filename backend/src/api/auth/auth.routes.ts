import { Router } from "express";
import { registra, confermaRegistrazione, login } from "./auth.service";

const router = Router();

router.post("/registra", registra);
router.get("/conferma/:token", confermaRegistrazione);
router.post("/login", login);

export default router;
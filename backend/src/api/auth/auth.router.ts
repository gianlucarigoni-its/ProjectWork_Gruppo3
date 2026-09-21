import { Router } from "express";
import { registra, confermaRegistrazione, login } from "./auth.service";

const router = Router();

router.post("/registrer", registra);
router.get("/confirm/:token", confermaRegistrazione);
router.post("/login", login);

export default router;

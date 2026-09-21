import { Router } from "express";
import { validate } from "../../utils/validation-middleware";
import { LoginDto, RegisterDto } from "./auth.dto";
import { register, login, confirmRegistration } from "./auth.controller";

const router = Router();

router.post("/register", validate(RegisterDto, "body"), register);
router.get("/confirm/:token", confirmRegistration);
router.post("/login", validate(LoginDto, "body"), login);

export default router;

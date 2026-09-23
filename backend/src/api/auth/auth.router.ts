import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { login, register, changePassword, logout } from "./auth.controller";
import { ChangePasswordDto, LoginDto, RegisterDto } from "./auth.dto";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";

const router = Router();

router.post("/register", validate(RegisterDto, "body"), register);
router.post("/login", validate(LoginDto, "body"), login);
router.patch("/password", isAuthenticated, validate(ChangePasswordDto, "body"), changePassword);
router.post("/logout", logout);

export default router;

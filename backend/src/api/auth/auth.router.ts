import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { login, register, changePassword, verifyEmail } from "./auth.controller";
import { ChangePasswordDto, LoginDto, RegisterDto, VerifyEmailDto } from "./auth.dto";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";

const router = Router();

router.get("/verify-email", validate(VerifyEmailDto, "query"), verifyEmail);
router.post("/register", validate(RegisterDto, "body"), register);
router.post("/login", validate(LoginDto, "body"), login);
router.patch("/password", isAuthenticated, validate(ChangePasswordDto, "body"), changePassword);
//router.post("/logout", logout);

export default router;

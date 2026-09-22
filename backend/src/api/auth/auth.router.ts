import { Router } from "express";
import { validate } from "../../lib/validate-body.middleware";
import { LoginDto, RegisterDto } from "./auth.dto";
import { register, login } from "./auth.controller";

const router = Router();

router.post('/register', validate(RegisterDto, 'body'), register);
router.post('/login', validate(LoginDto, 'body'), login);

export default router;

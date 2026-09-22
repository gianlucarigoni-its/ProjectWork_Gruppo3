import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "../../lib/auth/local/local-strategy";
import { TypedRequest } from "../../utils/typed-request.interface";
import { RegisterDto } from "./auth.dto";
import accountSrv from "../accounts/account.service";
import { UserExistsError } from "../../errors/user-exists.error";

export const register = async (req: TypedRequest<RegisterDto>, res: Response, next: NextFunction) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    const newAccount = await accountSrv.add({ firstName, lastName }, { username, password });

    res.json({
      message: "Registrazione effettuata. Ora puoi accedere.",
      account: newAccount,
    });
  } catch (err) {
    if (err instanceof UserExistsError) {
      res.status(400);
      res.json({ error: err.name, message: err.message });
    } else {
      next(err);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate(
      "local",
      { session: false },
      (loginErr: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
        if (loginErr) {
          next(loginErr);
          return;
        }

        if (!user) {
          res.status(401);
          res.json({ error: "LoginError", message: info?.message });
          return;
        }

        const token = jwt.sign({ sub: (user as { id: string }).id }, process.env.JWT_SECRET as string, {
          expiresIn: "7 days",
        });

        res.json({ user, token });
      },
    )(req, res, next);
  } catch (err) {
    next(err);
  }
};

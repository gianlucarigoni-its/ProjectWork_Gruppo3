import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "../../lib/auth/local/local.strategy";
import { TypedRequest } from "../../utils/typed-request";
import { RegisterDto } from "./auth.dto";
import accountSrv from "../account/account.service";
import { UserExistsError } from "../../errors/user-exists.error";
import { InvalidTokenError } from "../../errors/invalid-token.error";
import { AccessLogModel } from "../access-log/access-log.model";

export const register = async (
  req: TypedRequest<RegisterDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    const newAccount = await accountSrv.add(
      { username, firstName, lastName },
      { username, password },
    );

    res.json({
      message: "Registrazione effettuata. Controlla la tua email per confermare l'account.",
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

export const confirmRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;
    const account = await accountSrv.confirmRegistration(token);
    res.json({ message: "Registrazione confermata, ora puoi accedere.", account });
  } catch (err) {
    if (err instanceof InvalidTokenError) {
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
      async (loginErr: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
        try {
          if (loginErr) {
            next(loginErr);
            return;
          }

          await AccessLogModel.create({
            username: req.body.username,
            ip: req.ip,
            timestamp: new Date(),
            success: !!user,
          });

          if (!user) {
            res.status(401);
            res.json({ error: "LoginError", message: info?.message });
            return;
          }

          const token = jwt.sign(
            { sub: (user as { id: string }).id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7 days" },
          );

          res.json({ user, token });
        } catch (err) {
          next(err);
        }
      },
    )(req, res, next);
  } catch (err) {
    next(err);
  }
};

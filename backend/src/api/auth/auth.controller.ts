import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "../../lib/auth/local/local-strategy";
import { TypedRequest } from "../../lib/typed-request.interface";
import { RegisterDto } from "./auth.dto";
import accountSrv from "../accounts/account.service";
import { UserExistsError } from "../../errors/user-exists.error";

export const register = async (req: TypedRequest<RegisterDto>, res: Response, next: NextFunction) => {
  try {
    const { username, password, confermaPassword, firstName, lastName } = req.body;

    if (password != confermaPassword) throw new Error(); //da cambiare

    const newAccount = await accountSrv.add({ firstName, lastName }, { username, password });

    res.json(newAccount);
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
    passport.authenticate("local", { session: false }, (loginErr, user, info) => {
      if (loginErr) {
        next(loginErr);
        return;
      }

      if (!user) {
        res.status(401);
        res.json({
          error: "LoginError",
          message: info.message,
        });
        return;
      }

      const account = user.toObject();
      // generare token
      const token = jwt.sign(account, "my_jwt_secret", { expiresIn: "7 days" });
      res.json({
        account,
        token,
      });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

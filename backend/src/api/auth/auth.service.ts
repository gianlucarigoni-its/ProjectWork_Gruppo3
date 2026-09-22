import { NextFunction, Request, Response } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import { RegisterDto } from "./auth.dto";
import accountSrv from "../accounts/account.service";
import { omit, pick } from "lodash";
import { UserExistsError } from "../../errors/user-exists.error";
import passport from "passport";
import * as jwt from "jsonwebtoken";

export const register = async (req: TypedRequest<RegisterDto>, res: Response, next: NextFunction) => {
  try {
    if (req.body.confermaPassword !== req.body.password) throw new Error();

    const userData = omit(req.body, "username", "password", "confermaPassword");
    const credentials = pick(req.body, "username", "password");

    const newUser = await accountSrv.add(userData, credentials);
    res.json(newUser);
  } catch (err) {
    if (err instanceof UserExistsError) {
      res.status(400);
      res.json({
        error: err.name,
        message: err.message,
      });
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

      // generare token
      const token = jwt.sign(user, "ITS_ProjectWork_Gruppo3_2527_BankingApp!?!", { expiresIn: "1 hour" });
      res.json({
        user,
        token,
      });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

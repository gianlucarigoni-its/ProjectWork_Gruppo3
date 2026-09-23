import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { UserExistsError } from "../../errors/user-exists.error";
import passport from "../../lib/auth/local/local-strategy";
import { TypedRequest } from "../../lib/typed-request.interface";
import accountSrv from "../accounts/account.service";
import { AuthLog, AuthStatus, AuthType } from "./auth.entity";
import { ChangePasswordDto, RegisterDto } from "./auth.dto";
import authSrv from "./auth.service";

export const register = async (req: TypedRequest<RegisterDto>, res: Response, next: NextFunction) => {
  try {
    const { username, password, confermaPassword, firstName, lastName } = req.body;

    if (password != confermaPassword) throw new Error(); //da cambiare

    const ip = accountSrv.getClientIp(req.headers, req.socket, req.ip);

    const newAccount = await accountSrv.add(
      { firstName, lastName },
      { username, password },
      { ipAddress: ip, type: AuthType.register },
    );

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
    passport.authenticate("local", { session: false }, async (loginErr, user, info) => {
      const ip = authSrv.getClientIp(req.headers, req.socket, req.ip);
      if (loginErr || !user) {
        await authSrv.createAuthLog({
          accountId: null,
          ipAddress: ip,
          type: AuthType.login,
          status: AuthStatus.failed,
        });

        if (loginErr) return next(loginErr);
        res.status(401).json({ error: "LoginError", message: info?.message ?? "Credenziali non valide" });
        return;
      }

      const account = user.toObject();
      // generare token
      const token = jwt.sign(account, "my_jwt_secret", { expiresIn: "7 days" });

      const logData: AuthLog = {
        accountId: account.id,
        ipAddress: ip,
        type: AuthType.login,
        status: AuthStatus.success,
      };
      const authLog = await authSrv.createAuthLog(logData);

      res.json({
        account,
        token,
      });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: TypedRequest<ChangePasswordDto>, res: Response, next: NextFunction) => {
  try {
    const checkCredentials = await authSrv.checkCredentials(req.account.username, req.body.oldPassword);
    if (!checkCredentials)
      //lancia errore credenziali errate
      throw new Error();

    await authSrv.changePassword(req.account.username, req.body.newPassword);

    res.status(200).json({ message: "Password cambiata con successo" });
  } catch (err) {
    next(err);
  }
};

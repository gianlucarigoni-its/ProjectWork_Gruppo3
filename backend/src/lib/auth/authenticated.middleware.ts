import { NextFunction, Request, Response } from "express";
import passport from "passport";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: info?.message || "Token non valido o scaduto",
      });
    }

    // Copia req.user su req.account
    (req as any).account = user;

    next();
  })(req, res, next);
};

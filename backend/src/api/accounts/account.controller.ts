import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import accountSrv from "./account.service";

export const home = async (req: TypedRequest, res: Response, next: NextFunction) => {
  try {
    const home = await accountSrv.getHome(req.account.id, 5);
    res.status(200).json(home);
  } catch (err) {
    next(err);
  }
};

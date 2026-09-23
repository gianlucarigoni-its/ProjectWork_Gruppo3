import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import accountSrv from "./account.service";
import { AccountModel } from "./account.model";

export const home = async (req: TypedRequest, res: Response, next: NextFunction) => {
  try {
    const homeData = await accountSrv.getHome(req.account.id, 5);
    res.status(200).json(homeData);
  } catch (err) {
    next(err);
  }
};

export const getAccountById = async (req: TypedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.accountId || (req as any).user?.id;
    const account = await accountSrv.getAccountById(id);
    res.status(200).json(account);
  } catch (err) {
    next(err);
  }
};

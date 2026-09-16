import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { Filter } from "./transaction.dto";
import transactionSrv from "./transaction.service";

export const find = async (req: TypedRequest<unknown, Filter>, res: Response, next: NextFunction) => {
  try {
    const result = await transactionSrv.filter(req.query, req.params.accountId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { Download, Filter } from "./transaction.dto";
import transactionSrv from "./transaction.service";

export const find = async (req: TypedRequest<unknown, Filter>, res: Response, next: NextFunction) => {
  try {
    const result = await transactionSrv.filter(req.query, req.params.accountId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const download = async (req: TypedRequest<unknown, Download>, res: Response, next: NextFunction) => {
  try {
    const result = await transactionSrv.filter(req.query, req.params.accountId);
    const csv = transactionSrv.buildCsv(result.transactions, result.balance);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="movimenti.csv"');
    res.send("\uFEFF" + csv);
  } catch (err) {
    next(err);
  }
};

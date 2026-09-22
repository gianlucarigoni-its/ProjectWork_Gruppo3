import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { Download, Filter, TransferDto } from "./transaction.dto";
import transactionSrv from "./transaction.service";
import { IsIBAN } from "class-validator";

export const find = async (req: TypedRequest<unknown, Filter>, res: Response, next: NextFunction) => {
  try {
    const result = await transactionSrv.filter(req.query, req.account.id);
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

export const transfer = async (req: TypedRequest<TransferDto>, res: Response, next: NextFunction) => {
  try {
    const clientIp = transactionSrv.getClientIp(req.headers, req.socket, req.ip);

    const result = await transactionSrv.executeTransfer(
      req.account.id,
      clientIp,
      req.body.IBAN.trim(),
      req.body.amount,
    );

    if (!result.success) {
      res.status(result.statusCode).json({ message: result.message });
      return;
    }
    res.status(200).json({
      message: "Bonifico eseguito con successo.",
      newBalance: result.newBalance,
      transaction: result.transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Errore interno durante l'esecuzione del bonifico.",
      error: error.message,
    });
  }
};

// export const topUp(req:TypedRequest, res:Response, next: NextFunction){

// }

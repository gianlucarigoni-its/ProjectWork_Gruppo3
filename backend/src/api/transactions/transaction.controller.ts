import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { DownloadDTO, Filter, TopUpDto, TransferDto, TypeID } from "./transaction.dto";
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

export const findById = async (req: TypedRequest<unknown, unknown, TypeID>, res: Response, next: NextFunction) => {
  try {
    const transactionId = req.params.id;
    const accountId = req.account.id;

    const result = await transactionSrv.getById(transactionId, accountId);

    if (!result.success) {
      res.status(result.statusCode).json({
        error: result.error,
        message: result.message,
      });
      return;
    }
    res.status(200).json({
      id: result.data?._id,
      accountId: result.data?.accountId,
      amount: result.data?.amount,
      description: result.data?.description,
      category: result.data?.category,
      type: result.data?.type,
      date: result.data?.date,
    });
  } catch (err) {
    next(err);
  }
};

export const download = async (req: TypedRequest<unknown, DownloadDTO>, res: Response, next: NextFunction) => {
  try {
    const result = await transactionSrv.filter(req.query, req.account.id);
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

export const topUp = async (req: TypedRequest<TopUpDto>, res: Response, next: NextFunction) => {
  try {
    const clientIp = transactionSrv.getClientIp(req.headers, req.socket, req.ip);

    const result = await transactionSrv.executeTopUp(
      req.account.id,
      clientIp,
      req.body.phoneNumber,
      req.body.operator,
      req.body.amount,
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import accountSrv from "./account.service";
import { AccountModel } from "./account.model";

export const home = async (req: TypedRequest, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    // 1. Cerca identificativi inviati via Query String dal client
    const queryEmail = req.query.email as string;
    const queryAccountId = req.query.accountId as string;

    // 2. Cerca identificativi estratti dal Token JWT autenticato
    const jwtIdentifier = user?.email || user?.username || user?.user || user?.id || user?._id;

    let homeData;

    if (queryEmail) {
      homeData = await accountSrv.getHomeByEmail(queryEmail, 5);
    } else if (queryAccountId) {
      homeData = await accountSrv.getHome(queryAccountId, 5);
    } else if (jwtIdentifier) {
      // Prova prima a cercarlo per email/username, altrimenti per ID
      const accountByEmail = await AccountModel.findOne({
        $or: [
          { email: jwtIdentifier },
          { username: jwtIdentifier }
        ]
      }).exec();

      if (accountByEmail) {
        homeData = await accountSrv.getHome(accountByEmail._id.toString(), 5);
      } else {
        homeData = await accountSrv.getHome(jwtIdentifier, 5);
      }
    } else {
      res.status(401).json({ message: "Utente non autenticato o parametri mancanti" });
      return;
    }

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
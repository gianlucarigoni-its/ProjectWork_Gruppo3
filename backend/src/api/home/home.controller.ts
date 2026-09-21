import { Response, NextFunction } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import { HomeResponse } from "./home.response";
import homeSrv from "./home.service";

// export const home = async (req: TypedRequest, res: Response, next: NextFunction) => {
//   try {
//     if (!req.account) {
//       return res.status(401).json({
//         message: "Utente non autenticato",
//       });
//     }

//     const transactions = await homeSrv.getLatestTransactions(5, req.account.id);

//     const home: HomeResponse = {
//       account: req.account,
//       transactions,
//     };

//     return res.status(200).json(home);
//   } catch (error) {
//     next(error);
//   }
// };

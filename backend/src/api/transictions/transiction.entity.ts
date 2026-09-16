import { Types } from "mongoose";

export type AccountTransiction = {
  id: string;
  accountId: Types.ObjectId;
  amount: number; //importo movimento
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  date: Date;
};

export enum TransactionCategory {
  AccountOpening = "accountOpening",
  IncomingTransfer = "incomingTransfer",
  OutgoingTransfer = "outgoingTransfer",
  CashWithdrawal = "cashWithdrawal",
  UtilityPayment = "utilityPayment",
  TopUp = "topUp",
  AtmDeposit = "atmDeposit",
}

export enum TransactionType {
  Income = "income",
  Outcome = "outcome",
}

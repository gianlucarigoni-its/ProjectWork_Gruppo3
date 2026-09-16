import { Types } from "mongoose";

export type AccountTransition = {
  id: string;
  bankAccountId: Types.ObjectId;
  amount: number; //importo movimento
  balance: number; //saldo conto dopo il movimento
  decription: string;
  category: TransactionCategory;
  type: TransactionType;
};

// 1. L'Enum con le categorie
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
  income = "income",
  outcome = "outcome",
}

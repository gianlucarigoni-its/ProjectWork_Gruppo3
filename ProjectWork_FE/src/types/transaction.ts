export const TransactionCategory = {
  AccountOpening : "accountOpening",
  IncomingTransfer : "incomingTransfer",
  OutgoingTransfer : "outgoingTransfer",
  CashWithdrawal : "cashWithdrawal",
  UtilityPayment : "utilityPayment",
  TopUp : "topUp",
  AtmDeposit : "atmDeposit",
} as const;

export type TransactionCategory = typeof TransactionCategory[keyof typeof TransactionCategory];

export const TransactionType = {
  Income : "income",
  Outcome : "outcome",
} as const 

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  date: string;
}

export interface TransactionFilterParams {
  limit?: number;
  category?: TransactionCategory;
  from?: string; // Formato YYYY-MM-DD (sostituisce dateFrom)
  to?: string;   // Formato YYYY-MM-DD (sostituisce dateTo)
  format?: "csv" | "xlsx";
}

export interface TransactionResponse {
  transactions: Transaction[];
  balance?: number; // Presente solo senza filtri specifici (category/from/to)
}


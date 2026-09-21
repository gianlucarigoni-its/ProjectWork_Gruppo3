import { Account } from "../accounts/accounts.entity";
import { Transaction } from "../transactions/transaction.entity";

export type HomeResponse = {
  account: Account;
  transactions: Transaction[];
};

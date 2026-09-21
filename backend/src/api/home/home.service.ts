import { AccountModel } from "../accounts/accounts.model";
import { Transaction } from "../transactions/transaction.entity";
import { TransactionModel } from "../transactions/transaction.model";

export class HomeService {
  async getLatestTransactions(num: number, accountId): Promise<Transaction[]> {
    return await TransactionModel.find({ accountId: accountId }).sort({ date: -1 }).limit(num);
  }
}

export default new HomeService();

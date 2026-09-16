import { queryObjects } from "node:v8";
import { Filter } from "./transaction.dto";
import { QueryFilter, Types } from "mongoose";
import { Transaction } from "./transaction.entity";
import { TransactionModel } from "./transaction.model";
import { AccountModel } from "../accounts/accounts.model";

export class transactionService {
  async filter(filters: Filter, accountId: string) {
    let transactions: Transaction[];
    const { num, category, from, to } = filters;
    let queryFilter: QueryFilter<Transaction> = { accountId };
    let limit = 0;
    const account = await AccountModel.findById(accountId).select("balance").exec();

    if (num != undefined && category == undefined && from == undefined && to == undefined) {
      transactions = await TransactionModel.find({ accountId }).sort({ date: -1 }).limit(num).exec();
      return {
        transactions,
        balance: account?.balance,
      };
    } else if (num != undefined) limit = num;

    if (category != undefined) queryFilter.category = category;

    if (from !== undefined || to !== undefined) {
      queryFilter.date = {};

      if (from !== undefined) {
        queryFilter.date.$gte = new Date(`${from}T00:00:00.000Z`);
      }

      if (to !== undefined) {
        queryFilter.date.$lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    if (limit === 0) transactions = await TransactionModel.find(queryFilter).sort({ date: -1 });
    else transactions = await TransactionModel.find(queryFilter).sort({ date: -1 }).limit(limit);

    return transactions;
  }
}

export default new transactionService();

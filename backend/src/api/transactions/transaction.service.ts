import { QueryFilter } from "mongoose";
import { AccountModel } from "../accounts/accounts.model";
import { Filter, TransactionResponse } from "./transaction.dto";
import { Transaction } from "./transaction.entity";
import { TransactionModel } from "./transaction.model";

export class transactionService {
  async filter(filters: Filter, accountId: string): Promise<TransactionResponse> {
    let transactions: Transaction[];
    const { num, category, from, to } = filters;
    let queryFilter: QueryFilter<Transaction> = { accountId };
    let limit = 0;
    const account = await AccountModel.findById(accountId).select("balance").exec();

    if (category == undefined && from == undefined && to == undefined) {
      if (num != undefined) {
        transactions = await TransactionModel.find({ accountId }).sort({ date: -1 }).limit(num).exec();
        return {
          transactions,
          balance: account?.balance,
        };
      } else {
        transactions = await TransactionModel.find({ accountId }).sort({ date: -1 }).exec();
        return {
          transactions,
          balance: account?.balance,
        };
      }
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

    return { transactions };
  }

  buildCsv(transactions: Transaction[], balance?: number): string {
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const header = ["Data", "Importo", "Categoria"].join(";");

    const rows = transactions.map((t) =>
      [
        escape(new Date(t.date).toLocaleDateString("it-IT")),
        String(t.amount).replace(".", ","),
        escape(t.category),
      ].join(";"),
    );

    let csv = [header, ...rows].join("\r\n");

    if (balance !== undefined) {
      csv += `\r\n\r\n"Saldo finale";${String(balance).replace(".", ",")}`;
    }

    return csv;
  }
}

export default new transactionService();

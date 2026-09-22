import { Types } from "mongoose";
import { TransactionModel } from "./transaction.model";
import { Filter, TransactionResponse } from "./transaction.dto";

export class TransactionService {
  async filter(query: Filter, accountId: string): Promise<TransactionResponse[]> {
    const match: Record<string, unknown> = {
      accountId: new Types.ObjectId(accountId),
    };

    if (query.category) {
      match.category = query.category;
    }

    if (query.from || query.to) {
      const dateFilter: Record<string, Date> = {};
      if (query.from) dateFilter.$gte = new Date(query.from);
      if (query.to) dateFilter.$lte = new Date(query.to);
      match.date = dateFilter;
    }

    const transactions = await TransactionModel.find(match).sort({ date: 1 });

    let runningBalance = 0;
    const withBalance: TransactionResponse[] = transactions.map((t) => {
      runningBalance += t.type === "income" ? t.amount : -t.amount;
      return {
        id: t.id,
        accountId: t.accountId as Types.ObjectId,
        amount: t.amount,
        description: t.description,
        category: t.category,
        type: t.type,
        date: t.date,
        balance: runningBalance,
      };
    });

    withBalance.reverse();

    return query.num ? withBalance.slice(0, query.num) : withBalance;
  }
}

export default new TransactionService();

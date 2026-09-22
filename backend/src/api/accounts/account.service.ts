import * as bcrypt from "bcrypt";
import { UserExistsError } from "../../errors/user-exists.error";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import { Account } from "./account.entity";
import { AccountModel } from "./account.model";
import { generateRandomIban } from "../../lib/iban-generator";
import transactionSrv from "../transactions/transaction.service";

export class AccountService {
  async getAccountById(id: string): Promise<Account> {
    const account = await AccountModel.findById(id).exec();
    return account!.toObject();
  }

  async add(
    account: Omit<Account, "id" | "username" | "IBAN" | "balance" | "createdAt">,
    credentials: { username: string; password: string },
  ): Promise<Account> {
    try {
      const existingIdentity = await UserIdentityModel.findOne({
        "credentials.username": credentials.username,
      });
      if (existingIdentity) throw new UserExistsError();

      const session = await AccountModel.startSession();
      session.startTransaction();

      try {
        const iban = generateRandomIban("IT");

        const [newAccount] = await AccountModel.create(
          [{ ...account, username: credentials.username, IBAN: iban, balance: 0 }],
          { session },
        );

        const hashedPassword = await bcrypt.hash(credentials.password, 10);

        await UserIdentityModel.create(
          [
            {
              provider: "local",
              user: newAccount._id.toString(),
              credentials: { username: credentials.username, hashedPassword },
            },
          ],
          { session },
        );

        await session.commitTransaction();
        return newAccount;
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (err) {
      throw err;
    }
  }

  async getHome(id: string, limit?: number) {
    const account = await this.getAccountById(id);
    const transactions = await transactionSrv.getTransactions(id, limit);

    return {
      account,
      transactions,
    };
  }
}

export default new AccountService();

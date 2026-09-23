import * as bcrypt from "bcrypt";
import { IncomingHttpHeaders } from "node:http";
import { Socket } from "node:net";
import { UserExistsError } from "../../errors/user-exists.error";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import { generateRandomIban } from "../../lib/iban-generator";
import { AuthLog, AuthStatus } from "../auth/auth.entity";
import authService from "../auth/auth.service";
import transactionSrv from "../transactions/transaction.service";
import { Account } from "./account.entity";
import { AccountModel } from "./account.model";

export class AccountService {
  getClientIp(headers: IncomingHttpHeaders, socket: Socket, ip: string | undefined): string {
    const forwarded = headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return ip || socket.remoteAddress || "127.0.0.1";
  }

  async getAccountById(id: string): Promise<Account> {
    const account = await AccountModel.findById(id).exec();
    if (!account) throw new Error("Account non trovato");
    return account.toObject ? account.toObject() : account;
  }

  /**
   * Registra un nuovo account con IBAN e credenziali salvate in modo atomico
   */
  async add(
    account: Omit<Account, "id" | "username" | "IBAN" | "balance" | "createdAt">,
    credentials: { username: string; password: string },
    logData: Omit<AuthLog, "accountId" | "status">,
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
              account: newAccount.id,
              credentials: { username: credentials.username, hashedPassword },
            },
          ],
          { session },
        );

        await session.commitTransaction();

        await authService.createAuthLog({
          accountId: newAccount.id,
          ipAddress: logData.ipAddress,
          type: logData.type,
          status: AuthStatus.success,
        });
        return newAccount;
      } catch (err) {
        await session.abortTransaction();
        await authService.createAuthLog({
          accountId: null,
          ipAddress: logData.ipAddress,
          type: logData.type,
          status: AuthStatus.failed,
        });
        throw err;
      } finally {
        session.endSession();
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Recupera le informazioni della Dashboard per ID Account
   */
  async getHome(id: string, limit?: number) {
    const account = await this.getAccountById(id);
    const transactions = await transactionSrv.getTransactions(account.id, limit);

    return {
      account,
      transactions,
    };
  }
}

export default new AccountService();

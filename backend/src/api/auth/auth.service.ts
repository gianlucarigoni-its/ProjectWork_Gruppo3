import * as bcrypt from "bcrypt";
import { IncomingHttpHeaders } from "http";
import { isIP, Socket } from "net";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import { AuthLogModel } from "./auth-log.model";
import { AuthLog } from "./auth.entity";
import { TransactionLogModel } from "../transactions/transacition-log.model";
import { TransactionModel } from "../transactions/transaction.model";
import { TransactionCategory, TransactionType } from "../transactions/transaction.entity";
import { Account } from "../accounts/account.entity";

export class AuthService {
  async getHashedPasswordById(id: string): Promise<string | null> {
    const identity = await UserIdentityModel.findOne({ account: id }).exec();
    if (!identity) return null;
    return identity.credentials.hashedPassword;
  }

  getClientIp(headers: IncomingHttpHeaders, socket: Socket, ip: string | undefined): string {
    const forwarded = headers["x-forwarded-for"];

    let candidate: string;

    if (typeof forwarded === "string") {
      candidate = forwarded.split(",")[0].trim();
    } else {
      candidate = ip || socket.remoteAddress || "127.0.0.1";
    }

    return this.normalizeIp(candidate);
  }

  private normalizeIp(rawIp: string): string {
    let ip = rawIp.trim();

    if (ip.startsWith("::ffff:")) {
      ip = ip.slice(7);
    }

    if (isIP(ip) === 0) {
      return "127.0.0.1";
    }

    return ip;
  }

  async createAuthLog(logData: AuthLog) {
    try {
      await AuthLogModel.create({
        accountId: logData.accountId,
        ipAddress: logData.ipAddress,
        type: logData.type,
        status: logData.status,
      });
    } catch (err) {
      throw err;
    }
  }

  async checkCredentials(username: string, oldPassword: string): Promise<boolean> {
    const userIdentity = await UserIdentityModel.findOne({ "credentials.username": username }).exec();
    if (!userIdentity) return false;

    const match = await bcrypt.compare(oldPassword, userIdentity.credentials.hashedPassword);

    if (!match) return false;

    return true;
  }

  async changePassword(username: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await UserIdentityModel.updateOne(
      { "credentials.username": username },
      { $set: { "credentials.hashedPassword": hashedPassword } },
    );

    console.log("CHANGE PASSWORD RESULT:", updated);

    if (updated.matchedCount === 0) {
      throw new Error("Utente non trovato");
    }

    if (updated.modifiedCount === 0) {
      throw new Error("Password non modificata");
    }
  }

  async verifyEmail(token: string): Promise<{ accountId: string } | null> {
    const identity = await UserIdentityModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // non scaduto
      isVerified: false,
    });

    if (!identity) return null; //InvalidTokenError();

    identity.isVerified = true;
    identity.verificationToken = null;
    identity.verificationTokenExpiry = null;
    await identity.save();

    const accountId = (identity.account as unknown as Account).id;
    const username = (identity.account as unknown as Account).username;
    const password = await this.getHashedPasswordById(accountId);
    if (!password) return null;
    return { accountId };
  }

  async openAccount(accountId: string): Promise<boolean> {
    const transaction = await TransactionModel.create({
      accountId: accountId,
      amount: 0,
      description: "Apertura conto",
      category: TransactionCategory.AccountOpening,
      type: TransactionType.Income,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (!transaction) return false;

    return true;
  }
}

export default new AuthService();

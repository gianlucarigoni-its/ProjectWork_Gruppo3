import { IncomingHttpHeaders } from "http";
import { Socket } from "net";
import { AuthLogModel } from "./auth-log.model";
import { AuthLog } from "./auth.entity";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import * as bcrypt from "bcrypt";
import { Account } from "../accounts/account.entity";

export class AuthService {
  getClientIp(headers: IncomingHttpHeaders, socket: Socket, ip: string | undefined): string {
    const forwarded = headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return ip || socket.remoteAddress || "127.0.0.1";
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
}

export default new AuthService();

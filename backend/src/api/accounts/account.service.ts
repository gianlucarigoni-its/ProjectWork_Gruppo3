import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { UserExistsError } from "../../errors/user-exists.error";
import { InvalidTokenError } from "../../errors/invalid-token.error";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import mailSrv from "../../lib/mail/mail.service";
import movementSrv from "../movement/movement.service";
import { Account } from "./accounts.entity";
import { AccountModel } from "./accounts.model";

const CONFIRMATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 ore

export class AccountService {
  async add(
    account: Omit<Account, "id" | "IBAN" | "balance" | "createdAt">,
    credentials: { username: string; password: string },
  ): Promise<Account> {
    const existingIdentity = await UserIdentityModel.findOne({
      "credentials.username": credentials.username.toLowerCase(),
    });
    if (existingIdentity) {
      throw new UserExistsError();
    }

    // IBAN e balance non arrivano dalla registrazione: IBAN verrà caricato
    // a mano in seguito, balance parte da 0 (schema DB).
    const newAccount = await AccountModel.create({
      ...account,
      username: credentials.username.toLowerCase(),
    });

    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    await UserIdentityModel.create({
      provider: "local",
      user: newAccount._id,
      credentials: {
        username: credentials.username.toLowerCase(),
        hashedPassword,
        isConfirmed: false,
        confirmationToken,
        confirmationExpires: new Date(Date.now() + CONFIRMATION_TOKEN_TTL_MS),
      },
    });

    await mailSrv.sendConfirmationEmail(credentials.username, confirmationToken);

    return newAccount;
  }

  /**
   * Conferma la registrazione tramite il token ricevuto via email e crea
   * il movimento di apertura a saldo/importo zero sul conto appena attivato.
   */
  async confirmRegistration(token: string): Promise<Account> {
    const identity = await UserIdentityModel.findOne({
      "credentials.confirmationToken": token,
      "credentials.confirmationExpires": { $gt: new Date() },
    }).populate<{ user: Account }>("user");

    if (!identity) {
      throw new InvalidTokenError();
    }

    identity.credentials.isConfirmed = true;
    identity.credentials.confirmationToken = null;
    identity.credentials.confirmationExpires = null;
    await identity.save();

    await movementSrv.createOpeningMovement(identity.user.id);

    return identity.user;
  }
}

export default new AccountService();

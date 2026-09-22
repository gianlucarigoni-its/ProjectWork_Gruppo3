import * as bcrypt from "bcrypt";
import { UserExistsError } from "../../errors/user-exists.error";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import { Account } from "./accounts.entity";
import { AccountModel } from "./accounts.model";
import { generateRandomIban } from "../../lib/iban-generator";

export class AccountService {
  async add(
    account: Omit<Account, "id" | "username" | "IBAN" | "balance" | "createdAt">,
    credentials: { username: string; password: string },
  ): Promise<Account> {
    const existingIdentity = await UserIdentityModel.findOne({
      "credentials.username": credentials.username,
    });
    if (existingIdentity) {
      throw new UserExistsError();
    }

    const iban = generateRandomIban("IT");

    const newAccount = await AccountModel.create({
      ...account,
      username: credentials.username,
      IBAN: iban,
      balance: 0,
    });

    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    await UserIdentityModel.create({
      provider: "local",
      user: newAccount.toObject().id.toString(),
      credentials: {
        username: credentials.username,
        hashedPassword,
      },
    });

    return newAccount;
  }
}

export default new AccountService();

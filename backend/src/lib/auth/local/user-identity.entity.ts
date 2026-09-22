import { Account } from "../../../api/accounts/accounts.entity";

export type UserIdentity = {
  id: string;
  provider: string;
  credentials: {
    username: string;
    hashedPassword: string;
  };
  user: Account;
};

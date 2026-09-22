import { Account } from "../../api/accounts/account.entity";
import "./local/local-strategy";
import "./jwt/jwt-strategy";

declare global {
  namespace Express {
    interface Request {
      account: Account;
    }
  }
}

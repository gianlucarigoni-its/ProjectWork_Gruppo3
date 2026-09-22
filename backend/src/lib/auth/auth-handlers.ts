import { Account } from "../../api/accounts/accounts.entity";
import './local/local-strategy';

declare global {
  namespace Express {
    interface User extends Account {}
  }
}

import { Types } from "mongoose";

export enum AuthStatus {
  success = "SUCCESS",
  failed = "FAILED",
}

export enum AuthType {
  register = "Register",
  login = "Login",
}

export type AuthLog = {
  accountId: string | Types.ObjectId | null;
  ipAddress: string;
  type: AuthType;
  status: AuthStatus;
  date?: Date;
};

import { Types } from "mongoose";

export type UserIdentity = {
  id: string;
  provider: string;
  credentials: {
    username: string;
    hashedPassword: string;
  };
  account: Types.ObjectId | string;
};

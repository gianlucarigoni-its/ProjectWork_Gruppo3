import { Schema, model, Types } from "mongoose";
import { UserIdentity } from "./user-identity.entity";

export const userIdentitySchema = new Schema<UserIdentity>({
  account: { type: Schema.Types.ObjectId, ref: "Account" },
  provider: { type: String, default: "local" },
  credentials: {
    type: {
      username: String,
      hashedPassword: String,
    },
    _id: false,
  },
});

userIdentitySchema.pre("findOne", function () {
  this.populate("account");
});

export const UserIdentityModel = model<UserIdentity>("UserIdentity", userIdentitySchema);

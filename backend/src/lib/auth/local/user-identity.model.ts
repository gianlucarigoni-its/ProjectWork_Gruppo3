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
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpiry: { type: Date, default: null },
});

userIdentitySchema.pre("findOne", function () {
  this.populate("account");
});

userIdentitySchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

userIdentitySchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserIdentityModel = model<UserIdentity>("UserIdentity", userIdentitySchema);

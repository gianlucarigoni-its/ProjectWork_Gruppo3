import { Model, model, Schema } from "mongoose";
import { Account } from "./accounts.entity";

const AccountSchema = new Schema<Account>(
  {
    username: String,
    firstName: String,
    lastName: String,
    IBAN: String,
    balance: Number,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  },
);

AccountSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

AccountSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

AccountSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AccountModel = model<Account>("Account", AccountSchema);

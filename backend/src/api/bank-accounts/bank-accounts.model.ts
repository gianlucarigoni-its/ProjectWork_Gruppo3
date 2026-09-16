import { Model, model, Schema } from "mongoose";
import { Accounts } from "./bank-accounts.entity";

const BannkAccountSchema = new Schema<Accounts>(
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

BannkAccountSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

BannkAccountSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

BannkAccountSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const BannkAccountModel = model<Accounts>("Accounts", BannkAccountSchema);

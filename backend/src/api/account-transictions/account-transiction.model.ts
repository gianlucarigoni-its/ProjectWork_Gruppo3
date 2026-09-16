import { model, Schema } from "mongoose";
import { AccountTransiction, TransactionCategory, TransactionType } from "./account-transiction.entity";

const AccountTransictionSchema = new Schema<AccountTransiction>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Accounts",
    },
    amount: Number,
    description: String,
    category: {
      type: String,
      enum: TransactionCategory,
    },
    type: {
      type: String,
      enum: TransactionType,
    },
  },
  {
    timestamps: {
      createdAt: "date",
      updatedAt: false,
    },
  },
);

AccountTransictionSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

AccountTransictionSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AccountTransictionModel = model<AccountTransiction>("Transiction", AccountTransictionSchema);

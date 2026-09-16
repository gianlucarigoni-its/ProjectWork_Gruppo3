import { model, Schema } from "mongoose";
import { AccountTransaction, TransactionCategory, TransactionType } from "./Transaction.entity";

const AccountTransactionSchema = new Schema<AccountTransaction>(
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

AccountTransactionSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

AccountTransactionSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AccountTransactionModel = model<AccountTransaction>("Transaction", AccountTransactionSchema);

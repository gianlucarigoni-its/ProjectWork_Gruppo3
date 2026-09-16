import { model, Schema } from "mongoose";
import { Transaction, TransactionCategory, TransactionType } from "./transaction.entity";

const TransactionSchema = new Schema<Transaction>(
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

TransactionSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

TransactionSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TransactionModel = model<Transaction>("Transaction", TransactionSchema);

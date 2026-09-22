import { Schema, model, Types } from "mongoose";

export type TransactionLog = {
  transactionId?: Types.ObjectId | null;
  operationType: "RICARICA" | "BONIFICO";
  ipAddress: string;
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
  date?: Date;
};

const TransactionLogSchema = new Schema<TransactionLog>(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: false,
      default: null,
    },
    operationType: {
      type: String,
      enum: ["RICARICA", "BONIFICO"],
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "date", updatedAt: false },
  },
);

TransactionLogSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

TransactionLogSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TransactionLogModel = model<TransactionLog>("TransactionLog", TransactionLogSchema);

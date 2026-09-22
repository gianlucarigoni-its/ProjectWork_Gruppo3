import { Schema, model, Types } from "mongoose";

export type AuditLog = {
  transactionID?: Types.ObjectId | null;
  operationType: "RICARICA" | "BONIFICO";
  ipAddress: string;
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
  date?: Date;
};

const AuditLogSchema = new Schema<AuditLog>(
  {
    transictionID: {
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

AuditLogSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

AuditLogSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AuditLogModel = model<AuditLog>("AuditLog", AuditLogSchema);

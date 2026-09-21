import { Schema, model, Types } from "mongoose";

export type AuditLog = {
  transictionID?: Types.ObjectId | null;
  operationType: "RICARICA" | "BONIFICO";
  ipAddress: string;
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
  date?: Date;
};

// 2. Schema Mongoose
const AuditLogSchema = new Schema<AuditLog>(
  {
    transictionID: { 
      type: Schema.Types.ObjectId, 
      ref: "Transaction", 
      required: false, 
      default: null 
    },
    operationType: { 
      type: String, 
      enum: ["RICARICA", "BONIFICO"], 
      required: true 
    },
    ipAddress: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["SUCCESS", "FAILED"], 
      required: true 
    },
    failureReason: { 
      type: String 
    },
  },
  {
    timestamps: { createdAt: "date", updatedAt: false },
  }
);

export const AuditLogModel = model<AuditLog>("AuditLog", AuditLogSchema);
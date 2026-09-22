import { Schema, model, Types } from "mongoose";
import { AuthLog, AuthStatus, AuthType } from "./auth.entity";

const AuthLogSchema = new Schema<AuthLog>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: false,
      default: null,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: AuthType,
      required: true,
    },
    status: {
      type: String,
      enum: AuthStatus,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "date", updatedAt: false },
  },
);

AuthLogSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

AuthLogSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AuthLogModel = model<AuthLog>("AuthLog", AuthLogSchema);

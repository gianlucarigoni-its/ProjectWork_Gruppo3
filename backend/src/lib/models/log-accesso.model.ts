import { Schema, model } from "mongoose";

export interface AccessLog {
  username: string;
  ip: string;
  timestamp: Date;
  success: boolean;
}

const accessLogSchema = new Schema<AccessLog>({
  username: { type: String, required: true },
  ip: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  success: { type: Boolean, required: true },
});

export const AccessLogModel = model<AccessLog>("AccessLog", accessLogSchema);

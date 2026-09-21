import { Schema, model, Document, Types } from "mongoose";

export interface ILogAccesso extends Document {
  contoCorrenteId?: Types.ObjectId;
  emailUtilizzata: string;
  indirizzoIp: string;
  dataOra: Date;
  esito: boolean;
  motivoFallimento?: string;
}

const logAccessoSchema = new Schema<ILogAccesso>({
  contoCorrenteId: { type: Schema.Types.ObjectId, ref: "ContoCorrente", default: null },
  emailUtilizzata: { type: String, required: true, trim: true, lowercase: true },
  indirizzoIp: { type: String, required: true },
  dataOra: { type: Date, required: true, default: () => new Date() },
  esito: { type: Boolean, required: true },
  motivoFallimento: { type: String, default: null },
});

export const LogAccesso = model<ILogAccesso>(
  "LogAccesso",
  logAccessoSchema,
  "TLogAccessi"
);
import { Schema, model, Document, Types } from "mongoose";

export interface IContoCorrente extends Document {
  email: string;
  passwordHash: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  iban?: string;
  saldoAttuale: number;
  confermato: boolean;
  tokenConferma?: string;
  tokenConfermaScadenza?: Date;
  dataRegistrazione: Date;
}

const contoCorrenteSchema = new Schema<IContoCorrente>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  nomeTitolare: { type: String, required: true, trim: true },
  cognomeTitolare: { type: String, required: true, trim: true },
  iban: { type: String, default: null },
  saldoAttuale: { type: Number, required: true, default: 0 },
  confermato: { type: Boolean, required: true, default: false },
  tokenConferma: { type: String, default: null },
  tokenConfermaScadenza: { type: Date, default: null },
  dataRegistrazione: { type: Date, required: true, default: () => new Date() },
});

export const ContoCorrente = model<IContoCorrente>(
  "ContoCorrente",
  contoCorrenteSchema,
  "TContiCorrenti"
);

export type ContoCorrenteId = Types.ObjectId;
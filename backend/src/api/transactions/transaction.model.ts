import { Schema, model } from "mongoose";
import { Movement } from "./movement.entity";

const movementSchema = new Schema<Movement>({
  account: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  data: { type: Date, required: true, default: Date.now },
  tipo: { type: String, enum: ["Entrata", "Uscita"], required: true },
  importo: { type: Number, required: true },
  saldo: { type: Number, required: true },
  descrizioneEstesa: { type: String, required: true },
});

export const MovementModel = model<Movement>("Movement", movementSchema);

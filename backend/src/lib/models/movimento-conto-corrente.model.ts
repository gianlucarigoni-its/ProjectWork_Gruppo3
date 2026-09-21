import { Schema, model, Document, Types } from "mongoose";

export interface IMovimentoContoCorrente extends Document {
  contoCorrenteId: Types.ObjectId;
  data: Date;
  importo: number;
  saldo: number;
  categoriaMovimentoId: Types.ObjectId;
  descrizioneEstesa: string;
}

const movimentoSchema = new Schema<IMovimentoContoCorrente>({
  contoCorrenteId: { type: Schema.Types.ObjectId, ref: "ContoCorrente", required: true },
  data: { type: Date, default: Date.now },
  importo: { type: Number, required: true },
  saldo: { type: Number, required: true },
  categoriaMovimentoId: { type: Schema.Types.ObjectId, ref: "CategoriaMovimento", required: true },
  descrizioneEstesa: { type: String, required: true },
});

export const MovimentoContoCorrente = model<IMovimentoContoCorrente>(
  "MovimentoContoCorrente",
  movimentoSchema,
  "TMovimentiContoCorrente"
);

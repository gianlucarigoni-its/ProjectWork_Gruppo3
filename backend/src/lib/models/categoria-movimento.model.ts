import { Schema, model, Document } from "mongoose";

export type TipologiaMovimento = "Entrata" | "Uscita";

export interface ICategoriaMovimento extends Document {
  nomeCategoria: string;
  tipologia: TipologiaMovimento;
}

const categoriaSchema = new Schema<ICategoriaMovimento>({
  nomeCategoria: { type: String, required: true },
  tipologia: { type: String, enum: ["Entrata", "Uscita"], required: true },
});

export const CategoriaMovimento = model<ICategoriaMovimento>(
  "CategoriaMovimento",
  categoriaSchema,
  "TCategorieMovimenti"
);

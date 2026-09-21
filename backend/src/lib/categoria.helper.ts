import { Types } from "mongoose";
import { CategoriaMovimento, TipologiaMovimento } from "./models/categoria-movimento.model";

export async function trovaOCreaCategoria(
  nomeCategoria: string,
  tipologia: TipologiaMovimento
): Promise<Types.ObjectId> {
  const esistente = await CategoriaMovimento.findOne({ nomeCategoria });
  if (esistente) {
    return esistente._id as Types.ObjectId;
  }
  const nuova = await CategoriaMovimento.create({ nomeCategoria, tipologia });
  return nuova._id as Types.ObjectId;
}
import { RequestHandler } from "express";
import { ContoCorrente } from "../../lib/models/conto-corrente.model";
import { MovimentoContoCorrente } from "../../lib/models/movimento-conto-corrente.model";

export const getHomeData: RequestHandler = async (req, res) => {
  const conto = await ContoCorrente.findById(req.contoCorrenteId);
  if (!conto) {
    res.status(404).json({ message: "Conto corrente non trovato" });
    return;
  }

  const ultimiMovimenti = await MovimentoContoCorrente.find({ contoCorrenteId: conto._id })
    .sort({ data: -1 })
    .limit(5)
    .populate("categoriaMovimentoId", "nomeCategoria tipologia");

  res.status(200).json({
    benvenuto: `Benvenuto ${conto.nomeTitolare} ${conto.cognomeTitolare}`,
    saldo: conto.saldoAttuale,
    ultimiMovimenti: ultimiMovimenti.map((m: any) => ({
      id: m.id,
      data: m.data,
      descrizioneEstesa: m.descrizioneEstesa,
      importo: m.importo,
      saldo: m.saldo,
      categoria: m.categoriaMovimentoId?.nomeCategoria,
      tipologia: m.categoriaMovimentoId?.tipologia,
    })),
  });
};

export const getDettaglioMovimento: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const movimento = await MovimentoContoCorrente.findOne({
    _id: id,
    contoCorrenteId: req.contoCorrenteId,
  }).populate("categoriaMovimentoId", "nomeCategoria tipologia");

  if (!movimento) {
    res.status(404).json({ message: "Movimento non trovato" });
    return;
  }
  res.status(200).json(movimento);
};
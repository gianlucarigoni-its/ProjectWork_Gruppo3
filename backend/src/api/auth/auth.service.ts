import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ContoCorrente } from "../../lib/models/conto-corrente.model";
import { MovimentoContoCorrente } from "../../lib/models/movimento-conto-corrente.model";
import { LogAccesso } from "../../lib/models/log-accesso.model";
import { trovaOCreaCategoria } from "../../lib/categoria.helper";
import { sendConfirmationEmail } from "../../lib/mailer";
import { firmaToken } from "../../lib/jwt.util";
import { RegisterDto, LoginDto } from "./auth.dto";

const SALT_ROUNDS = 12;
const TOKEN_CONFERMA_VALIDITA_ORE = 24;

export const registra: RequestHandler = async (req, res) => {
  const { email, password, nomeTitolare, cognomeTitolare } = req.body as RegisterDto;
  const emailNormalizzata = email.trim().toLowerCase();

  const contoEsistente = await ContoCorrente.findOne({ email: emailNormalizzata });
  if (contoEsistente) {
    res.status(409).json({ message: "Email già registrata" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const tokenConferma = crypto.randomBytes(32).toString("hex");
  const tokenConfermaScadenza = new Date(Date.now() + TOKEN_CONFERMA_VALIDITA_ORE * 60 * 60 * 1000);

  const nuovoConto = await ContoCorrente.create({
    email: emailNormalizzata,
    passwordHash,
    nomeTitolare: nomeTitolare.trim(),
    cognomeTitolare: cognomeTitolare.trim(),
    saldoAttuale: 0,
    confermato: false,
    tokenConferma,
    tokenConfermaScadenza,
  });

  try {
    await sendConfirmationEmail(nuovoConto.email, tokenConferma);
  } catch (errore) {
    console.error("Errore invio mail di conferma:", errore);
  }

  res.status(201).json({
    message: "Registrazione effettuata. Controlla la tua email per confermare l'account.",
  });
};

export const confermaRegistrazione: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const conto = await ContoCorrente.findOne({ tokenConferma: token });

  if (!conto) {
    res.status(400).json({ message: "Token di conferma non valido" });
    return;
  }
  if (conto.confermato) {
    res.status(200).json({ message: "Account già confermato in precedenza" });
    return;
  }
  if (!conto.tokenConfermaScadenza || conto.tokenConfermaScadenza < new Date()) {
    res.status(400).json({ message: "Il link di conferma è scaduto" });
    return;
  }

  conto.confermato = true;
  conto.tokenConferma = undefined;
  conto.tokenConfermaScadenza = undefined;
  await conto.save();

  const categoriaAperturaId = await trovaOCreaCategoria("Apertura Conto", "Entrata");
  await MovimentoContoCorrente.create({
    contoCorrenteId: conto._id,
    data: new Date(),
    descrizioneEstesa: "Apertura Conto",
    categoriaMovimentoId: categoriaAperturaId,
    importo: 0,
    saldo: 0,
  });

  res.status(200).json({ message: "Registrazione confermata. Ora puoi effettuare il login." });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginDto;
  const indirizzoIp = req.ip || req.socket.remoteAddress || "sconosciuto";

  const registraTentativo = (esito: boolean, contoCorrenteId?: string, motivo?: string) =>
    LogAccesso.create({
      contoCorrenteId: contoCorrenteId || undefined,
      emailUtilizzata: email.trim().toLowerCase(),
      indirizzoIp,
      dataOra: new Date(),
      esito,
      motivoFallimento: motivo || undefined,
    });

  const conto = await ContoCorrente.findOne({ email: email.trim().toLowerCase() });

  if (!conto) {
    await registraTentativo(false, undefined, "Email non trovata");
    res.status(401).json({ message: "Credenziali non valide" });
    return;
  }
  if (!conto.confermato) {
    await registraTentativo(false, conto.id, "Account non confermato");
    res.status(403).json({ message: "Devi prima confermare la registrazione via email" });
    return;
  }

  const passwordCorretta = await bcrypt.compare(password, conto.passwordHash);
  if (!passwordCorretta) {
    await registraTentativo(false, conto.id, "Password errata");
    res.status(401).json({ message: "Credenziali non valide" });
    return;
  }

  await registraTentativo(true, conto.id);
  const token = firmaToken({ contoCorrenteId: conto.id });

  res.status(200).json({
    token,
    nomeTitolare: conto.nomeTitolare,
    cognomeTitolare: conto.cognomeTitolare,
  });
};

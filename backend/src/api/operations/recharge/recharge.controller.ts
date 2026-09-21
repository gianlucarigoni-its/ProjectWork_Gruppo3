import { Request, Response } from "express";
import { RicaricaService } from "./reacherge.service";

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "0.0.0.0";
};

export class RicaricaController {
  static async handleRicarica(req: Request, res: Response): Promise<void> {
    try {
      const accountId = (req as any).user?.id;
      const clientIp = getClientIp(req);
      const { phoneNumber, operator, amount } = req.body;

      if (!phoneNumber || !operator || !amount || Number(amount) <= 0) {
        res.status(400).json({ message: "Dati di ricarica incompleti o non validi." });
        return;
      }

      const result = await RicaricaService.executeRicarica(accountId, clientIp, {
        phoneNumber,
        operator,
        amount: Number(amount),
      });

      if (!result.success) {
        res.status(result.statusCode).json({ message: result.message });
        return;
      }

      res.status(200).json({
        message: "Ricarica eseguita con successo.",
        newBalance: result.newBalance,
        transaction: result.transaction,
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        message: "Errore interno durante l'esecuzione della ricarica.",
        error: error.message,
      });
      return;
    }
  }
}

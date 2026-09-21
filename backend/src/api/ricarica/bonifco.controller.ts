import { Request, Response } from 'express';
import { BonificoService } from './bonifico.service';

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

export class BonificoController {
  
  static async handleBonifico(req: Request, res: Response): Promise<void> {
    try {
      const senderAccountId = (req as any).user?.id;
      const clientIp = getClientIp(req);
      const { recipientIBAN, amount, description } = req.body;

      if (!recipientIBAN || !amount || Number(amount) <= 0) {
        res.status(400).json({
          message: 'Dati per il bonifico incompleti o non validi. IBAN e importo maggiore di zero sono obbligatori.',
        });
        return;
      }

      const result = await BonificoService.execute(senderAccountId, clientIp, {
        recipientIBAN: recipientIBAN.trim(),
        amount: Number(amount),
        description: description ? description.trim() : undefined,
      });

      if (!result.success) {
        res.status(result.statusCode).json({ message: result.message });
        return;
      }

      res.status(200).json({
        message: 'Bonifico eseguito con successo.',
        newBalance: result.newBalance,
        transaction: result.transaction,
      });
      
    } catch (error: any) {
      res.status(500).json({
        message: 'Errore interno durante l\'esecuzione del bonifico.',
        error: error.message,
      });
    }
  }
}
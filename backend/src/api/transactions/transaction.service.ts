import { MovementModel } from "./movement.model";
import { Movement } from "./movement.entity";

export class MovementService {
  /**
   * Crea il movimento di apertura conto con importo e saldo a zero,
   * come richiesto subito dopo la conferma della registrazione.
   */
  async createOpeningMovement(accountId: string): Promise<Movement> {
    return MovementModel.create({
      account: accountId,
      data: new Date(),
      tipo: "Entrata",
      importo: 0,
      saldo: 0,
      descrizioneEstesa: "Apertura Conto",
    });
  }
}

export default new MovementService();

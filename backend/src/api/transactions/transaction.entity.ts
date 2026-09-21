export type MovementType = "Entrata" | "Uscita";

export interface Movement {
  id: string;
  account: string; // ref -> Account
  data: Date;
  tipo: MovementType;
  importo: number;
  saldo: number; // saldo risultante dopo il movimento
  descrizioneEstesa: string;
}

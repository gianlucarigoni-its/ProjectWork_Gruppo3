export const TypeCategory = {
  ENTRATA: 'Entrata',
  USCITA: 'Uscita',
} as const;

export const TransitionCategory = {
  APERTURA_CONTO: 'Apertura Conto',
  BONIFICO_ENTRATA: 'Bonifico Entrata',
  BONIFICO_USCITA: 'Bonifico Uscita',
  PRELIEVO_CONTANTI: 'Prelievo contanti',
  PAGAMENTO_UTENZE: 'Pagamento Utenze',
  RICARICA: 'Ricarica',
  VERSAMENTO_BANCOMAT: 'Versamento Bancomat',
} as const;

export type TypeCategory = (typeof TypeCategory)[keyof typeof TypeCategory];
export type TransitionCategory = (typeof TransitionCategory)[keyof typeof TransitionCategory];

export interface Account {
  id: string;
  username: string;
  firstName: string;
  lastname: string;
  IBAN: string;
  balance: number;
  createdAt: string;
}

export interface Transition {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: TransitionCategory;
  type: TypeCategory;
  date: string;
}

// DTO per i Form di Input
export interface RegisterDTO {
  username: string;
  password?: string;
  firstName: string;
  lastname: string;
}

export interface RicaricaDTO {
  phoneNumber: string;
  operator: string;
  amount: number;
}

export interface BonificoDTO {
  recipientIBAN: string;
  amount: number;
  description: string;
}
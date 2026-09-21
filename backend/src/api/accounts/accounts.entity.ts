export interface Account {
  id: string;
  username: string; // email, usato anche come identificativo di login
  firstName: string;
  lastName: string;
  IBAN: string; // caricato a mano dopo la registrazione, quindi opzionale a creazione
  balance: number;
  createdAt: Date;
}

export interface ContoCorrente {
  id: string;
  email: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  saldoAttuale: number;
  iban?: string;
  createdAt?: string;
}

export interface Movimento {
  _id?: string;
  id?: string;
  data: string;
  descrizioneEstesa: string;
  importo: number;
  saldo: number;
  categoria?: string;
  tipologia?: string;
}

export interface HomeData {
  benvenuto: string;
  saldo: number;
  ultimiMovimenti: Movimento[];
}

export interface MovimentoDettaglio {
  _id: string;
  contoCorrenteId: string;
  data: string;
  descrizioneEstesa: string;
  categoriaMovimentoId?: {
    nomeCategoria: string;
    tipologia: string;
  };
  importo: number;
  saldo: number;
}

export interface LoginResponse {
  token: string;
  nomeTitolare: string;
  cognomeTitolare: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  confermaPassword: string;
  nomeTitolare: string;
  cognomeTitolare: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RigaMovimento {
  _id?: string;
  id?: string;
  data: string;
  importo: number;
  categoriaMovimentoId?: {
    _id?: string;
    nomeCategoria: string;
    tipologia?: string;
  };
}

export interface Categoria {
  _id: string;
  nomeCategoria: string;
}

export interface RisultatoRicerca {
  saldo?: number;
  movimenti: RigaMovimento[];
}

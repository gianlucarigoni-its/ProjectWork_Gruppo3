export interface RicaricaPayload {
    phoneNumber : string;
    operator: string;
    amount: number;
}

export interface  BonificoPayload{
    recipientIBAN : string;
    amount: number;
    description? : string;
}
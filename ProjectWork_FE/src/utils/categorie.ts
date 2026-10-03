import { TransactionCategory } from "../types/transaction";

export const ETICHETTE_CATEGORIE: Record<TransactionCategory, string> = {
  accountOpening: "Apertura conto",
  incomingTransfer: "Bonifico in entrata",
  outgoingTransfer: "Bonifico in uscita",
  cashWithdrawal: "Prelievo contanti",
  utilityPayment: "Pagamento utenze",
  topUp: "Ricarica telefonica",
  atmDeposit: "Versamento ATM",
};

import "dotenv/config";
import mongoose from "mongoose";

import { TransactionModel } from "./api/transactions/transaction.model";

// Modifica l'import se hai rinominato il file/modello
import { AccountModel } from "./api/accounts/account.model";

import { TransactionCategory, TransactionType } from "./api/transactions/transaction.entity";

const dbPassword = process.env.DB_PASSWORD;

if (!dbPassword) {
  throw new Error("DB_PASSWORD non configurata nel file .env");
}

const mongoUri =
  `mongodb+srv://gianlucarigoni_db_user:${encodeURIComponent(dbPassword)}` +
  "@bankinappdb.wiep7c5.mongodb.net/bankingApp";

async function seedDatabase(): Promise<void> {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const accountsCount = await AccountModel.countDocuments();

    if (accountsCount > 0) {
      console.log("Database già popolato: seed saltato");
      return;
    }

    const accounts = await AccountModel.create([
      {
        username: "gianluca",
        firstName: "Gianluca",
        lastName: "Rigoni",
        balance: 1424.5,
        IBAN: "IT60X0542811101000000123456",
      },
      {
        username: "mario",
        firstName: "Mario",
        lastName: "Rossi",
        balance: 1820.0,
        IBAN: "IT60X0542811101000000654321",
      },
    ]);

    const [gianlucaAccount, marioAccount] = accounts;

    await TransactionModel.create([
      {
        accountId: gianlucaAccount._id,
        amount: 0, //Apertura a ZERO
        description: "Apertura Conto",
        category: TransactionCategory.AccountOpening,
        type: TransactionType.Income,
      },
      {
        accountId: gianlucaAccount._id,
        amount: 1500,
        description: "Versamento Bancomat iniziale",
        category: TransactionCategory.AtmDeposit,
        type: TransactionType.Income,
      },
      {
        accountId: gianlucaAccount._id,
        amount: 75.5,
        description: "Pagamento Utenze - Addebito diretto Enel Energia",
        category: TransactionCategory.UtilityPayment,
        type: TransactionType.Outcome,
      },
      {
        accountId: gianlucaAccount._id,
        amount: 10,
        description: "Ricarica TIM - Num. 3401234567",
        category: TransactionCategory.TopUp,
        type: TransactionType.Outcome,
      },
      {
        accountId: gianlucaAccount._id,
        amount: 100,
        description: "Prelievo contanti presso Sportello Bancomat",
        category: TransactionCategory.CashWithdrawal,
        type: TransactionType.Outcome,
      },
      {
        accountId: gianlucaAccount._id,
        amount: 90,
        description: "Bonifico disposto da Mario Rossi - Causale: Rimborso spese",
        category: TransactionCategory.IncomingTransfer,
        type: TransactionType.Income,
      },

      //CONTO 2: MARIO ROSSI
      {
        accountId: marioAccount._id,
        amount: 0, //Apertura a ZERO
        description: "Apertura Conto",
        category: TransactionCategory.AccountOpening,
        type: TransactionType.Income,
      },
      {
        accountId: marioAccount._id,
        amount: 2000,
        description: "Versamento Bancomat iniziale",
        category: TransactionCategory.AtmDeposit,
        type: TransactionType.Income,
      },
      {
        accountId: marioAccount._id,
        amount: 90,
        description: "Bonifico disposto a favore di Gianluca Rigoni",
        category: TransactionCategory.OutgoingTransfer,
        type: TransactionType.Outcome,
      },
      {
        accountId: marioAccount._id,
        amount: 40,
        description: "Pagamento Utenze - Servizio Idrico",
        category: TransactionCategory.UtilityPayment,
        type: TransactionType.Outcome,
      },
      {
        accountId: marioAccount._id,
        amount: 50,
        description: "Prelievo contanti",
        category: TransactionCategory.CashWithdrawal,
        type: TransactionType.Outcome,
      },
    ]);

    console.log("Database popolato con successo con 2 conti e 11 movimenti!");
  } catch (error) {
    console.error("Errore durante il seed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

void seedDatabase();

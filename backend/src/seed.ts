import "dotenv/config";

import mongoose from "mongoose";

import { BannkAccountModel } from "./api/accounts/accounts.model";
import { AccountTransactionModel } from "./api/Transactions/Transaction.model";

import { TransactionCategory, TransactionType } from "./api/Transactions/Transaction.entity";

const dbPassword = process.env.DB_PASSWORD;

if (!dbPassword) {
  throw new Error("DB_PASSWORD non configurata nel file .env");
}

const mongoUri = `mongodb+srv://gianlucarigoni_db_user:${encodeURIComponent(dbPassword)}` + "@bankinappdb.wiep7c5.mongodb.net/bankingApp";

async function seedDatabase(): Promise<void> {
  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");

    const accountsCount = await BannkAccountModel.countDocuments();

    if (accountsCount > 0) {
      console.log("Database già popolato: seed saltato");
      return;
    }

    const accounts = await BannkAccountModel.create([
      {
        username: "gianluca",
        firstName: "Gianluca",
        lastName: "Rigoni",
        balance: 1500,
        IBAN: "IT60X0542811101000000123456",
      },
      {
        username: "mario",
        firstName: "Mario",
        lastName: "Rossi",
        IBAN: "IT60X0542811101000000654321",
        balance: 2000,
      },
    ]);

    const [gianlucaAccount, marioAccount] = accounts;

    await AccountTransactionModel.create([
      {
        accountId: gianlucaAccount._id,
        amount: 1500,
        description: "Apertura conto",
        category: TransactionCategory.AccountOpening,
        type: TransactionType.Income,
      },
      {
        accountId: gianlucaAccount._id,
        amount: 75.5,
        description: "Pagamento utenza elettrica",
        category: TransactionCategory.UtilityPayment,
        type: TransactionType.Outcome,
      },
      {
        accountId: marioAccount._id,
        amount: 2000,
        description: "Apertura conto",
        category: TransactionCategory.AccountOpening,
        type: TransactionType.Income,
      },
      {
        accountId: marioAccount._id,
        amount: 250,
        description: "Bonifico in uscita",
        category: TransactionCategory.OutgoingTransfer,
        type: TransactionType.Outcome,
      },
    ]);

    console.log("Database popolato con dati di prova");
  } catch (error) {
    console.error("Errore durante il seed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

void seedDatabase();

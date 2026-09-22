import { QueryFilter } from "mongoose";
import { AccountModel } from "../accounts/account.model";
import { Filter, TransactionResponse } from "./transaction.dto";
import { Transaction, TransactionCategory, TransactionType } from "./transaction.entity";
import { TransactionModel } from "./transaction.model";
import { IncomingHttpHeaders } from "node:http";
import { Socket, SocketAddress } from "node:net";
import { AuditLogModel } from "../auditLog/audit-log.schema";
import { forEach } from "lodash";

export class TransactionService {
  async filter(filters: Filter, accountId: string): Promise<TransactionResponse> {
    let transactions: Transaction[];
    const { num, category, from, to } = filters;
    let queryFilter: QueryFilter<Transaction> = { accountId };
    let limit = 0;
    const account = await AccountModel.findById(accountId).select("balance").exec();

    if (category == undefined && from == undefined && to == undefined) {
      if (num != undefined) {
        transactions = await TransactionModel.find({ accountId }).sort({ date: -1 }).limit(num).exec();
        return {
          transactions,
          balance: account?.balance,
        };
      } else {
        transactions = await TransactionModel.find({ accountId }).sort({ date: -1 }).exec();
        return {
          transactions,
          balance: account?.balance,
        };
      }
    } else if (num != undefined) limit = num;

    if (category != undefined) queryFilter.category = category;

    if (from !== undefined || to !== undefined) {
      queryFilter.date = {};

      if (from !== undefined) {
        queryFilter.date.$gte = new Date(`${from}T00:00:00.000Z`);
      }

      if (to !== undefined) {
        queryFilter.date.$lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    if (limit === 0) transactions = await TransactionModel.find(queryFilter).sort({ date: -1 });
    else transactions = await TransactionModel.find(queryFilter).sort({ date: -1 }).limit(limit);

    return { transactions };
  }

  buildCsv(transactions: Transaction[], balance?: number): string {
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const header = ["Data", "Importo", "Categoria"].join(";");

    const rows = transactions.map((t) =>
      [
        escape(new Date(t.date).toLocaleDateString("it-IT")),
        String(t.amount).replace(".", ","),
        escape(t.category),
      ].join(";"),
    );

    let csv = [header, ...rows].join("\r\n");

    if (balance !== undefined) {
      csv += `\r\n\r\n"Saldo finale";${String(balance).replace(".", ",")}`;
    }

    return csv;
  }

  async getTransactions(id: string, num?: number): Promise<Transaction[]> {
    if (!num) return await TransactionModel.find({ accountId: id }).exec();
    return await TransactionModel.find({ accountId: id }).limit(num).sort({ date: -1 }).exec();
  }

  getClientIp(headers: IncomingHttpHeaders, socket: Socket, ip: string | undefined): string {
    const forwarded = headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return ip || socket.remoteAddress || "127.0.0.1";
  }

  async executeTransfer(senderId: string, clientIp: string, IBAN: string, amount: number) {
    const session = await TransactionModel.startSession();
    session.startTransaction();
    try {
      // 1. Verifica esistenza mittente
      const sender = await AccountModel.findById(senderId).session(session);
      if (!sender) {
        throw new Error("Mittente non trovato");
      }

      // 2. Controllo bonifico verso se stessi
      if (sender.IBAN === IBAN) {
        await AuditLogModel.create(
          [
            {
              transactionID: null,
              operationType: "BONIFICO",
              ipAddress: clientIp,
              status: "FAILED",
              failureReason: "Bonifico verso il proprio IBAN",
            },
          ],
          { session },
        );
        await session.commitTransaction();
        return {
          success: false,
          statusCode: 400,
          message: "Impossibile effettuare un bonifico verso il proprio IBAN.",
        };
      }

      // 3. Verifica disponibilità saldo mittente
      if (sender.balance < amount) {
        await AuditLogModel.create(
          [
            {
              transactionID: null,
              operationType: "BONIFICO",
              ipAddress: clientIp,
              status: "FAILED",
              failureReason: "Saldo insufficiente",
            },
          ],
          { session },
        );
        await session.commitTransaction();
        return {
          success: false,
          statusCode: 400,
          message: "Saldo insufficiente per disporre il bonifico.",
        };
      }

      // 4. Verifica esistenza IBAN destinatario
      const recipient = await AccountModel.findOne({ IBAN: IBAN }).session(session);
      if (!recipient) {
        await AuditLogModel.create(
          [
            {
              transactionID: null,
              operationType: "BONIFICO",
              ipAddress: clientIp,
              status: "FAILED",
              failureReason: "IBAN destinatario inesistente",
            },
          ],
          { session },
        );
        await session.commitTransaction();
        return {
          success: false,
          statusCode: 404,
          message: "IBAN destinatario non presente nei nostri sistemi.",
        };
      }

      // 5. Aggiornamento saldi di entrambi i conti
      sender.balance -= amount;
      recipient.balance += amount;
      await sender.save({ session });
      await recipient.save({ session });

      // 6. Creazione movimento in USCITA per il mittente
      const [outgoingTransaction] = await TransactionModel.create(
        [
          {
            accountId: sender._id,
            amount,
            description: `Bonifico disposto a favore di ${recipient.firstName} ${recipient.lastName} - IBAN: ${IBAN}.`,
            category: TransactionCategory.OutgoingTransfer,
            type: TransactionType.Outcome,
          },
        ],
        { session },
      );

      // 7. Creazione movimento in ENTRATA per il destinatario
      await TransactionModel.create(
        [
          {
            accountId: recipient._id,
            amount,
            description: `Bonifico disposto da ${sender.firstName} ${sender.lastName} - IBAN: ${sender.IBAN}`,
            category: TransactionCategory.IncomingTransfer,
            type: TransactionType.Income,
          },
        ],
        { session },
      );

      // 8. Audit Log di successo collegato all'ID del transfer
      await AuditLogModel.create(
        [
          {
            transactionID: outgoingTransaction._id,
            operationType: "BONIFICO",
            ipAddress: clientIp,
            status: "SUCCESS",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return {
        success: true,
        statusCode: 200,
        newBalance: sender.balance,
        transaction: outgoingTransaction,
      };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async executeTopUp(accountId: string, clientIp: string, phoneNumber: string, operator: string, amount: number) {
    const session = await TransactionModel.startSession();
    session.startTransaction();

    try {
      const account = await AccountModel.findById(accountId).session(session);
      if (!account) {
        throw new Error("Account non trovato");
      }

      // Controllo saldo
      if (account.balance < amount) {
        await AuditLogModel.create(
          [
            {
              transactionID: null,
              operationType: "RICARICA",
              ipAddress: clientIp,
              status: "FAILED",
              failureReason: "Saldo insufficiente",
            },
          ],
          { session },
        );
        await session.commitTransaction();
        return { success: false, statusCode: 400, message: "Saldo insufficiente per la ricarica." };
      }

      // Aggiornamento Saldo
      account.balance -= amount;
      await account.save({ session });

      // Creazione Movimento
      const [transaction] = await TransactionModel.create(
        [
          {
            accountId: account._id,
            amount,
            description: `Ricarica ${operator} - Num. ${phoneNumber}`,
            category: TransactionCategory.TopUp,
            type: TransactionType.Outcome,
          },
        ],
        { session },
      );

      // Audit Log di Successo
      await AuditLogModel.create(
        [
          {
            transactionID: transaction._id,
            operationType: "RICARICA",
            ipAddress: clientIp,
            status: "SUCCESS",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return { success: true, statusCode: 200, balance: account.balance, transaction };
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new TransactionService();

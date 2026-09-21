import mongoose from 'mongoose';
import { AccountModel } from '../accounts/accounts.model'; // Corretto typo BankAccountModel
import { TransactionModel } from '../transactions/transaction.model';
import { TransactionCategory, TransactionType } from '../transactions/transaction.entity';
import { AuditLogModel } from '../auditLog/audit-log.schema';

export class RicaricaService {

    static async executeRicarica(
        accountId: string,
        clientIp: string,
        data: { phoneNumber: string; operator: string; amount: number }
    ) {
        const { phoneNumber, operator, amount } = data;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const account = await AccountModel.findById(accountId).session(session);
            if (!account) {
                throw new Error('Account non trovato');
            }

            // Controllo saldo
            if (account.balance < amount) {
                await AuditLogModel.create(
                    [{ accountID: account._id, operationType: 'RICARICA', ipAddress: clientIp, status: 'FAILED', failureReason: 'Saldo insufficiente' }],
                    { session }
                );
                await session.commitTransaction();
                return { success: false, statusCode: 400, message: 'Saldo insufficiente per la ricarica.' };
            }

            // Aggiornamento Saldo
            account.balance -= amount;
            await account.save({ session });

            // Creazione Movimento (Usa accountId come da Schema)
            const [transaction] = await TransactionModel.create(
                [{
                    accountId: account._id,
                    amount,
                    description: `Ricarica ${operator} - Num. ${phoneNumber}`,
                    category: TransactionCategory.TopUp,
                    type: TransactionType.Outcome,
                }],
                { session }
            );

            // Audit Log di Successo
            await AuditLogModel.create(
                [{ accountID: account._id, operationType: 'RICARICA', ipAddress: clientIp, status: 'SUCCESS' }],
                { session }
            );

            await session.commitTransaction();
            return { success: true, statusCode: 200, newBalance: account.balance, transaction };

        } catch (error: any) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
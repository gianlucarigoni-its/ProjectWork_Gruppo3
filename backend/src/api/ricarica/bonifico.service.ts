import mongoose from 'mongoose';
import {  AccountModel } from '../accounts/accounts.model';
import { TransactionModel } from '../transactions/transaction.model';
import { TransactionCategory, TransactionType } from '../transactions/transaction.entity';
import { AuditLogModel } from '../auditLog/audit-log.schema';

export class BonificoService {

    static async execute(
        senderAccountId: string,
        clientIp: string,
        data: { recipientIBAN: string; amount: number; description?: string }
    ) {
        const { recipientIBAN, amount, description } = data;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            //Verifica esistenza mittente
            const sender = await AccountModel.findById(senderAccountId).session(session);
            if (!sender) {
                throw new Error('Mittente non trovato');
            }

            if (sender.IBAN === recipientIBAN) {
                await AuditLogModel.create(
                    [{ 
                        accountID: sender._id, 
                        operationType: 'BONIFICO', 
                        ipAddress: clientIp, 
                        status: 'FAILED', 
                        failureReason: 'Bonifico verso il proprio IBAN' 
                    }],
                    { session }
                );
                await session.commitTransaction();
                return { success: false, statusCode: 400, message: 'Impossibile effettuare un bonifico verso il proprio IBAN.' };
            }

            //Verifica disponibilità saldo mittente
            if (sender.balance < amount) {
                await AuditLogModel.create(
                    [{ 
                        accountID: sender._id, 
                        operationType: 'BONIFICO', 
                        ipAddress: clientIp, 
                        status: 'FAILED', 
                        failureReason: 'Saldo insufficiente' 
                    }],
                    { session }
                );
                await session.commitTransaction();
                return { success: false, statusCode: 400, message: 'Saldo insufficiente per disporre il bonifico.' };
            }

            //Verifica esistenza IBAN destinatario
            const recipient = await AccountModel.findOne({ IBAN: recipientIBAN }).session(session);
            if (!recipient) {
                await AuditLogModel.create(
                    [{ 
                        accountID: sender._id, 
                        operationType: 'BONIFICO', 
                        ipAddress: clientIp, 
                        status: 'FAILED', 
                        failureReason: 'IBAN destinatario inesistente' 
                    }],
                    { session }
                );
                await session.commitTransaction();
                return { success: false, statusCode: 404, message: 'IBAN destinatario non presente nei nostri sistemi.' };
            }

            //Aggiornamento saldi di entrambi i conti
            sender.balance -= amount;
            recipient.balance += amount;
            await sender.save({ session });
            await recipient.save({ session });

            //Creazione movimento in USCITA per il mittente
            const [outgoingTransaction] = await TransactionModel.create(
                [{
                    accountId: sender._id,
                    amount,
                    description: `Bonifico disposto a favore di ${recipient.firstName} ${recipient.lastName} - IBAN: ${recipientIBAN}. Causale: ${description || 'Nessuna'}`,
                    category: TransactionCategory.OutgoingTransfer,
                    type: TransactionType.Outcome,
                }],
                { session }
            );

            //Creazione movimento in ENTRATA per il destinatario
            await TransactionModel.create(
                [{
                    accountId: recipient._id,
                    amount,
                    description: `Bonifico disposto da ${sender.firstName} ${sender.lastName} - IBAN: ${sender.IBAN}. Causale: ${description || 'Nessuna'}`,
                    category: TransactionCategory.IncomingTransfer,
                    type: TransactionType.Income,
                }],
                { session }
            );

            //Audit Log di successo per il mittente
            await AuditLogModel.create(
                [{ 
                    accountID: sender._id, 
                    operationType: 'BONIFICO', 
                    ipAddress: clientIp, 
                    status: 'SUCCESS' 
                }],
                { session }
            );

            await session.commitTransaction();
            return { success: true, statusCode: 200, newBalance: sender.balance, transaction: outgoingTransaction };

        } catch (error: any) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
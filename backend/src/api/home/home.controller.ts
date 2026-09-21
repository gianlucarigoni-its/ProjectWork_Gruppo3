import { RequestHandler } from 'express';
import { AccountModel } from '../accounts/accounts.model';
import { TransactionModel } from '../transactions/transaction.model';

export const getHomeDashboard: RequestHandler = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Se viene passato un accountId usa quello, altrimenti prende il PRIMO account disponibile nel DB
    let account = accountId 
      ? await AccountModel.findById(accountId)
      : await AccountModel.findOne();

    if (!account) {
      res.status(404).json({ message: 'Nessun account trovato nel database' });
      return;
    }

    // Cerca le ultime 5 transazioni filtrate per l'ID effettivo dell'account trovato
    const transactions = await TransactionModel.find({ 
      accountId: account._id || account.id 
    })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      account,
      transactions,
    });
  } catch (error) {
    console.error('Errore getHomeDashboard:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};
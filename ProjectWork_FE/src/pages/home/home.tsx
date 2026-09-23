import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import { BonificoButton } from '../../components/BonificoButton';

interface Account {
  id?: string;
  _id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  nomeTitolare?: string;
  cognomeTitolare?: string;
  IBAN?: string;
  iban?: string;
  balance?: number;
  saldo?: number;
}

interface Transaction {
  id?: string;
  _id?: string;
  accountId?: string;
  amount?: number;
  importo?: number;
  description?: string;
  descrizione?: string;
  category?: string;
  categoria?: string;
  type?: string;
  date?: string;
  data?: string;
}

interface HomeDashboardData {
  account?: Account;
  transactions?: Transaction[];
  conto?: Account;
  ultimiMovimenti?: Transaction[];
}

export const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashBoardData = () => {
    const token = localStorage.getItem('token');
    const accountId = localStorage.getItem('accountId');
    const userEmail = localStorage.getItem('userEmail');

    // Costruisce i parametri da inviare nella query string
    const params = new URLSearchParams();
    if (userEmail) params.append('email', userEmail);
    if (accountId) params.append('accountId', accountId);

    const queryString = params.toString();
    const url = queryString
      ? `http://localhost:3000/api/account/home?${queryString}`
      : 'http://localhost:3000/api/account/home';

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Errore HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((dashboardData: HomeDashboardData) => {
        setData(dashboardData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Errore nel recupero dati:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashBoardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p>Caricamento dati conto in corso...</p>
      </div>
    );
  }

  const rawAccount = data?.account || data?.conto;
  const rawTransactions = data?.transactions || data?.ultimiMovimenti || [];

  if (!rawAccount) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p>Impossibile recuperare i dati dell'account.</p>
      </div>
    );
  }

  // Normalizzazione delle proprietà
  const account = {
    firstName: rawAccount.firstName || rawAccount.nomeTitolare || rawAccount.username || '',
    lastName: rawAccount.lastName || rawAccount.cognomeTitolare || '',
    iban: rawAccount.IBAN || rawAccount.iban || 'In fase di assegnazione',
    balance: rawAccount.balance ?? rawAccount.saldo ?? 0,
  };

  return (
    <div className="dashboard-container">
      {/* Intestazione */}
      <header className="dashboard-header">
        <h1 className="welcome-title">
          Benvenuto, {account.firstName} {account.lastName}
        </h1>
        <div className="iban-badge">
          <span>IBAN:</span>
          <span className="iban-value">{account.iban}</span>
        </div>
      </header>

      {/* Pulsante Bonifico */}
      <BonificoButton onTransactionComplete={fetchDashBoardData} />

      {/* Scheda Saldo */}
      <section className="cards-grid">
        <div className="balance-card">
          <div className="card-label">Saldo Disponibile</div>
          <h2 className="card-amount">
            € {account.balance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </section>

      {/* Tabella Movimenti */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Ultimi Movimenti</h2>
          <Link to="/movimenti" className="btn-view-all">
            Mostra tutti →
          </Link>
        </div>

        <div className="table-card">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Descrizione</th>
                <th style={{ textAlign: 'right' }}>Importo</th>
              </tr>
            </thead>
            <tbody>
              {rawTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Nessun movimento trovato.
                  </td>
                </tr>
              ) : (
                rawTransactions.map((mov) => {
                  const valAmount = mov.amount ?? mov.importo ?? 0;
                  const valCategory = mov.category || mov.categoria || 'Generico';
                  const valDescription = mov.description || mov.descrizione || '-';
                  const valDate = mov.date || mov.data;
                  const isPositive = valAmount >= 0;

                  return (
                    <tr key={mov.id || mov._id || Math.random()}>
                      <td>
                        {valDate
                          ? new Date(valDate).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td>
                        <span className="category-badge">{valCategory}</span>
                      </td>
                      <td>{valDescription}</td>
                      <td
                        style={{ textAlign: 'right' }}
                        className={isPositive ? 'amount-positive' : 'amount-negative'}
                      >
                        {isPositive ? '+' : ''}
                        € {valAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
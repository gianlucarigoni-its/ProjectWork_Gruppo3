import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

interface Account {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  IBAN?: string;
  balance?: number;
}

interface Transaction {
  id?: string;
  accountId?: string;
  amount: number;
  description?: string;
  category?: string;
  type?: string;
  date: string;
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

  useEffect(() => {
    fetch('http://localhost:3000/api/home')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Errore HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: HomeDashboardData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Errore nel recupero dati:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p>Caricamento dati conto in corso...</p>
      </div>
    );
  }

  const account = data?.account || data?.conto;
  const transactions = data?.transactions || data?.ultimiMovimenti || [];

  if (!account) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p>Impossibile recuperare i dati dell'account.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Intestazione */}
      <header className="dashboard-header">
        <h1 className="welcome-title">
          Benvenuto, {account.firstName || ''} {account.lastName || ''}
        </h1>
        <div className="iban-badge">
          <span>IBAN:</span>
          <span className="iban-value">{account.IBAN || 'In fase di assegnazione'}</span>
        </div>
      </header>

      {/* Scheda Saldo */}
      <section className="cards-grid">
        <div className="balance-card">
          <div className="card-label">Saldo Disponibile</div>
          <h2 className="card-amount">
            € {(account.balance ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Nessun movimento trovato.
                  </td>
                </tr>
              ) : (
                transactions.map((mov) => {
                  const isPositive = mov.amount >= 0;
                  return (
                    <tr key={mov.id || Math.random()}>
                      <td>
                        {mov.date
                          ? new Date(mov.date).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td>
                        <span className="category-badge">{mov.category || 'Generico'}</span>
                      </td>
                      <td>{mov.description || '-'}</td>
                      <td
                        style={{ textAlign: 'right' }}
                        className={isPositive ? 'amount-positive' : 'amount-negative'}
                      >
                        {isPositive ? '+' : ''}
                        € {(mov.amount ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
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
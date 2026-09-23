import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import { BonificoButton } from '../../components/BonificoButton';

interface Account {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;

  firstName?: string;
  lastName?: string;

  nomeTitolare?: string;
  cognomeTitolare?: string;

  IBAN?: string;
  iban?: string;

  balance?: number;
  saldo?: number;

  cardLast4?: string;
  ultime4?: string;
  cardNumber?: string;
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
  tipo?: string;

  date?: string;
  data?: string;
}

interface HomeDashboardData {
  account?: Account;
  conto?: Account;

  transactions?: Transaction[];
  ultimiMovimenti?: Transaction[];
}

interface NormalizedTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date?: string;
}

interface CategoryData {
  name: string;
  percentage: number;
}

type IconName =
  | 'home'
  | 'accounts'
  | 'card'
  | 'transfer'
  | 'payments'
  | 'investments'
  | 'loan'
  | 'help'
  | 'search'
  | 'bell'
  | 'eye'
  | 'arrow'
  | 'wallet'
  | 'shopping'
  | 'utilities'
  | 'travel'
  | 'other'
  | 'plus'
  | 'dots'
  | 'chart';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Icon: React.FC<{
  name: IconName;
  size?: number;
  strokeWidth?: number;
}> = ({ name, size = 20, strokeWidth = 1.8 }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'home':
      return (
        <svg {...commonProps}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );

    case 'accounts':
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10M7 12h5M7 16h3" />
        </svg>
      );

    case 'card':
      return (
        <svg {...commonProps}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 9h19" />
          <path d="M6 14h4" />
        </svg>
      );

    case 'transfer':
      return (
        <svg {...commonProps}>
          <path d="M4 7h15" />
          <path d="m15 3 4 4-4 4" />
          <path d="M20 17H5" />
          <path d="m9 13-4 4 4 4" />
        </svg>
      );

    case 'payments':
      return (
        <svg {...commonProps}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h3M15 15h1" />
        </svg>
      );

    case 'investments':
      return (
        <svg {...commonProps}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="m7 15 4-4 3 2 5-6" />
          <path d="M16 7h3v3" />
        </svg>
      );

    case 'loan':
      return (
        <svg {...commonProps}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case 'help':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.2-1.7 2.7" />
          <path d="M12 17h.01" />
        </svg>
      );

    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...commonProps}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case 'eye':
      return (
        <svg {...commonProps}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...commonProps}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case 'wallet':
      return (
        <svg {...commonProps}>
          <path d="M4 7V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v2" />
          <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1Z" />
          <path d="M16 13h5" />
          <circle cx="16" cy="13" r=".7" fill="currentColor" />
        </svg>
      );

    case 'shopping':
      return (
        <svg {...commonProps}>
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );

    case 'utilities':
      return (
        <svg {...commonProps}>
          <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />
        </svg>
      );

    case 'travel':
      return (
        <svg {...commonProps}>
          <path d="m3 12 18-7-7 18-3-8-8-3Z" />
          <path d="m11 15 4-4" />
        </svg>
      );

    case 'other':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );

    case 'plus':
      return (
        <svg {...commonProps}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case 'dots':
      return (
        <svg {...commonProps}>
          <circle cx="5" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="19" cy="12" r="1" fill="currentColor" />
        </svg>
      );

    case 'chart':
      return (
        <svg {...commonProps}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="m7 15 4-5 3 3 5-7" />
        </svg>
      );

    default:
      return null;
  }
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatShortCurrency = (value: number): string => {
  const sign = value >= 0 ? '+' : '-';
  return `${sign} ${formatCurrency(Math.abs(value))}`;
};

const formatDate = (value?: string): string => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
  });
};

const getCategoryIcon = (category: string): IconName => {
  const value = category.toLowerCase();

  if (
    value.includes('spesa') ||
    value.includes('shopping') ||
    value.includes('aliment')
  ) {
    return 'shopping';
  }

  if (
    value.includes('uten') ||
    value.includes('enel') ||
    value.includes('bollet')
  ) {
    return 'utilities';
  }

  if (
    value.includes('viagg') ||
    value.includes('travel') ||
    value.includes('trasport')
  ) {
    return 'travel';
  }

  return 'other';
};

export const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      const token = localStorage.getItem('token');
      const accountId = localStorage.getItem('accountId');
      const userEmail = localStorage.getItem('userEmail');

      const params = new URLSearchParams();

      if (userEmail) {
        params.append('email', userEmail);
      }

      if (accountId) {
        params.append('accountId', accountId);
      }

      const queryString = params.toString();

      const url = `${API_URL}/api/account/home${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}`);
      }

      const dashboardData: HomeDashboardData = await response.json();

      setData(dashboardData);
    } catch (err) {
      console.error('Errore nel recupero dei dati:', err);

      setError(
        'Non è stato possibile recuperare i dati del conto. Riprova tra poco.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const rawAccount = data?.account || data?.conto;

  const rawTransactions =
    data?.transactions || data?.ultimiMovimenti || [];

  const account = useMemo(() => {
    if (!rawAccount) {
      return null;
    }

    const firstName =
      rawAccount.firstName ||
      rawAccount.nomeTitolare ||
      rawAccount.username ||
      'Utente';

    const lastName =
      rawAccount.lastName ||
      rawAccount.cognomeTitolare ||
      '';

    const balance =
      rawAccount.balance ??
      rawAccount.saldo ??
      0;

    const iban =
      rawAccount.IBAN ||
      rawAccount.iban ||
      'In fase di assegnazione';

    const cardLast4 =
      rawAccount.cardLast4 ||
      rawAccount.ultime4 ||
      (
        rawAccount.cardNumber
          ? rawAccount.cardNumber.slice(-4)
          : '4821'
      );

    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      balance: Number(balance),
      iban,
      cardLast4,
    };
  }, [rawAccount]);

  const transactions = useMemo<NormalizedTransaction[]>(() => {
    return rawTransactions.map((transaction, index) => {
      const amount = Number(
        transaction.amount ??
          transaction.importo ??
          0
      );

      return {
        id:
          transaction.id ||
          transaction._id ||
          `transaction-${index}`,

        amount,

        description:
          transaction.description ||
          transaction.descrizione ||
          'Movimento',

        category:
          transaction.category ||
          transaction.categoria ||
          'Altro',

        date:
          transaction.date ||
          transaction.data,
      };
    });
  }, [rawTransactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      })
      .slice(0, 5);
  }, [transactions]);

  const categoryData = useMemo<CategoryData[]>(() => {
    const expenses = transactions.filter(
      (transaction) => transaction.amount < 0
    );

    const totals = new Map<string, number>();

    expenses.forEach((transaction) => {
      const category = transaction.category || 'Altro';

      totals.set(
        category,
        (totals.get(category) || 0) +
          Math.abs(transaction.amount)
      );
    });

    const total = Array.from(totals.values()).reduce(
      (sum, value) => sum + value,
      0
    );

    if (total === 0) {
      return [
        {
          name: 'Casa',
          percentage: 32,
        },
        {
          name: 'Alimentari',
          percentage: 18,
        },
        {
          name: 'Viaggi',
          percentage: 14,
        },
        {
          name: 'Altro',
          percentage: 36,
        },
      ];
    }

    return Array.from(totals.entries())
      .map(([name, value]) => ({
        name,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);
  }, [transactions]);

  const chartData = useMemo(() => {
    const expenses = transactions
      .filter((transaction) => transaction.amount < 0)
      .slice(0, 12)
      .reverse();

    if (expenses.length === 0) {
      return [18, 32, 24, 48, 36, 62, 44, 55, 38, 52, 31, 45];
    }

    const max = Math.max(
      ...expenses.map((transaction) =>
        Math.abs(transaction.amount)
      )
    );

    return expenses.map((transaction) => {
      if (max === 0) return 20;

      return Math.max(
        12,
        Math.min(
          72,
          (Math.abs(transaction.amount) / max) * 72
        )
      );
    });
  }, [transactions]);

  if (loading) {
    return (
      <div className="bank-loading">
        <div className="loading-logo">
          <img
            src="/img/3Vision_DigitalBank_LogoRMBG_white.png"
            alt="3Vision Digital Bank"
            className="loading-logo-img"
          />
        </div>

        <div className="loading-spinner" />

        <p>Caricamento della tua area personale...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="bank-error">
        <div className="error-card">
          <div className="error-icon">
            <Icon name="help" size={28} />
          </div>

          <h1>Ops, qualcosa è andato storto</h1>

          <p>
            {error ||
              'Impossibile recuperare i dati del tuo account.'}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setLoading(true);
              void fetchDashboardData();
            }}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-app">
      <aside className="sidebar">
        <div className="brand">
          <img
            src="/img/3Vision_DigitalBank_LogoRMBG_white.png"
            alt="Logo"
            className="brand-logo"
          />
        </div>

        <nav className="sidebar-navigation">
          <Link
            to="/"
            className="sidebar-link active"
          >
            <Icon name="home" size={19} />
            <span>Home</span>
          </Link>

          <Link
            to="/conti"
            className="sidebar-link"
          >
            <Icon name="accounts" size={19} />
            <span>Conti</span>
          </Link>

          <Link
            to="/carte"
            className="sidebar-link"
          >
            <Icon name="card" size={19} />
            <span>Carte</span>
          </Link>

          <Link
            to="/bonifici"
            className="sidebar-link"
          >
            <Icon name="transfer" size={19} />
            <span>Bonifici</span>
          </Link>

          <Link
            to="/pagamenti"
            className="sidebar-link"
          >
            <Icon name="payments" size={19} />
            <span>Pagamenti</span>
          </Link>

          <Link
            to="/investimenti"
            className="sidebar-link"
          >
            <Icon name="investments" size={19} />
            <span>Risparmio e investimenti</span>
          </Link>

          <Link
            to="/prestiti"
            className="sidebar-link"
          >
            <Icon name="loan" size={19} />
            <span>Prestiti</span>
          </Link>

          <Link
            to="/assistenza"
            className="sidebar-link"
          >
            <Icon name="help" size={19} />
            <span>Assistenza</span>
          </Link>
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon">
            <Icon name="investments" size={21} />
          </div>

          <div className="promo-arrow">
            <Icon name="arrow" size={15} />
          </div>

          <strong>
            Il tuo futuro
            <br />
            è nelle tue mani
          </strong>

          <p>
            Scopri i nostri strumenti
            <br />
            di investimento.
          </p>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div className="search-box">
            <Icon name="search" size={18} />

            <input
              type="text"
              placeholder="Cerca movimenti, beneficiari, servizi..."
              aria-label="Cerca"
            />
          </div>

          <div className="topbar-user">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifiche"
            >
              <Icon name="bell" size={19} />
              <span className="notification-dot" />
            </button>

            <div className="avatar">
              {account.firstName.charAt(0).toUpperCase()}
            </div>

            <span className="user-name">
              {account.fullName}
            </span>

            <span className="user-chevron">⌄</span>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <h1>
                Ciao {account.firstName},
              </h1>

              <p>
                ecco la panoramica del tuo conto.
              </p>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="left-column">
              <article className="balance-card">
                <div className="balance-card-content">
                  <div className="balance-label">
                    Saldo totale
                  </div>

                  <div className="balance-value-row">
                    <h2>
                      {formatCurrency(account.balance)}
                    </h2>

                    <button
                      type="button"
                      className="visibility-button"
                      aria-label="Mostra saldo"
                    >
                      <Icon name="eye" size={19} />
                    </button>
                  </div>

                  <div className="balance-change">
                    <span>+</span>
                    <span>
                      € 320,45
                    </span>
                    <span>
                      rispetto al mese scorso
                    </span>
                  </div>
                </div>

                <div className="balance-decoration">
                  <span />
                  <span />
                  <span />
                </div>
              </article>

              <article className="movements-card">
                <div className="card-header">
                  <div>
                    <h2>Movimenti recenti</h2>
                  </div>

                  <Link
                    to="/movimenti"
                    className="view-all-link"
                  >
                    Vedi tutti
                  </Link>
                </div>

                <div className="movements-list">
                  {recentTransactions.length === 0 ? (
                    <div className="empty-movements">
                      Nessun movimento trovato.
                    </div>
                  ) : (
                    recentTransactions.map(
                      (transaction) => {
                        const positive =
                          transaction.amount >= 0;

                        return (
                          <div
                            className="movement-row"
                            key={transaction.id}
                          >
                            <div
                              className={`movement-icon ${positive ? 'income' : ''}`}
                            >
                              <Icon
                                name={getCategoryIcon(
                                  transaction.category
                                )}
                                size={18}
                              />
                            </div>

                            <div className="movement-info">
                              <strong>
                                {transaction.description}
                              </strong>

                              <span>
                                {transaction.category}
                              </span>
                            </div>

                            <div
                              className={`movement-amount ${
                                positive
                                  ? 'positive'
                                  : 'negative'
                              }`}
                            >
                              {formatShortCurrency(
                                transaction.amount
                              )}
                            </div>

                            <div className="movement-date">
                              {formatDate(
                                transaction.date
                              )}
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </article>
            </div>

            <div className="right-column">
              <article className="credit-card-wrapper">
                <div className="card-header card-header-light">
                  <h2>Le tue carte</h2>

                  <Link
                    to="/carte"
                    className="view-all-link"
                  >
                    Vedi tutte
                  </Link>
                </div>

                <div className="bank-card">
                  <div className="bank-card-top">
                    <div className="mini-brand">
                      <img
                        src="/img/3Vision_DigitalBank_LogoRMBG_white.png"
                        alt="3Vision Digital Bank"
                        className="card-logo-img"
                      />
                    </div>

                    <strong>VISA</strong>
                  </div>

                  <div className="card-chip">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="card-number">
                    • • • • &nbsp; {account.cardLast4}
                  </div>

                  <div className="bank-card-bottom">
                    <span>Debito</span>

                    <div>
                      <strong>
                        {formatCurrency(
                          Math.max(account.balance, 0)
                        )}
                      </strong>

                      <small>Disponibile</small>
                    </div>
                  </div>
                </div>
              </article>

              <article className="spending-card">
                <div className="card-header">
                  <h2>Andamento spese</h2>

                  <div className="chart-periods">
                    <button type="button">1M</button>
                    <button type="button">3M</button>
                    <button type="button">6M</button>
                    <button type="button">1A</button>
                  </div>
                </div>

                <div className="bar-chart">
                  <div className="chart-grid-line line-1" />
                  <div className="chart-grid-line line-2" />
                  <div className="chart-grid-line line-3" />

                  <div className="bars">
                    {chartData.map(
                      (height, index) => (
                        <div
                          className="bar-container"
                          key={`bar-${index}`}
                        >
                          <div
                            className="bar"
                            style={{
                              height: `${height}px`,
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="categories-title">
                  <h3>Categorie principali</h3>
                </div>

                <div className="categories-list">
                  {categoryData.map(
                    (category) => (
                      <div
                        className="category-row"
                        key={category.name}
                      >
                        <div className="category-left">
                          <span className="category-icon">
                            <Icon
                              name={getCategoryIcon(
                                category.name
                              )}
                              size={15}
                            />
                          </span>

                          <span>
                            {category.name}
                          </span>
                        </div>

                        <strong>
                          {category.percentage}%
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="quick-actions-section">
            <div className="section-heading">
              <h2>Azioni rapide</h2>
            </div>

            <div className="quick-actions">
              <div className="quick-action">
                <div className="quick-action-icon">
                  <Icon name="transfer" size={20} />
                </div>

                <div>
                  <strong>Nuovo bonifico</strong>
                  <span>Invia denaro</span>
                </div>

                <div className="quick-action-button">
                  <BonificoButton
                    onTransactionComplete={
                      fetchDashboardData
                    }
                  />
                </div>
              </div>

              <Link
                to="/movimenti"
                className="quick-action"
              >
                <div className="quick-action-icon">
                  <Icon name="chart" size={20} />
                </div>

                <div>
                  <strong>Movimenti</strong>
                  <span>Controlla le operazioni</span>
                </div>

                <Icon name="arrow" size={17} />
              </Link>

              <Link
                to="/carte"
                className="quick-action"
              >
                <div className="quick-action-icon">
                  <Icon name="card" size={20} />
                </div>

                <div>
                  <strong>Le tue carte</strong>
                  <span>Gestisci le carte</span>
                </div>

                <Icon name="arrow" size={17} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
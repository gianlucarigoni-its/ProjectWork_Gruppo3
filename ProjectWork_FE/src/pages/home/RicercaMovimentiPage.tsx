import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Home, Wallet, ArrowLeftRight, Send, Settings } from 'lucide-react';
import { api } from '../../utils/services/api';
import { TransactionCategory } from '../../types/transaction';
import type {
  Transaction,
  TransactionFilterParams,
  TransactionResponse,
} from '../../types/transaction';
import './ricerca.css';

const SCHEDE: { modo: number; titolo: string }[] = [
  { modo: 1, titolo: 'Ultimi movimenti' },
  { modo: 2, titolo: 'Per categoria' },
  { modo: 3, titolo: 'Tra due date' },
];

const ETICHETTE_CATEGORIE: Record<TransactionCategory, string> = {
  accountOpening: 'Apertura conto',
  incomingTransfer: 'Bonifico in entrata',
  outgoingTransfer: 'Bonifico in uscita',
  cashWithdrawal: 'Prelievo contanti',
  utilityPayment: 'Pagamento utenze',
  topUp: 'Ricarica telefonica',
  atmDeposit: 'Versamento ATM',
};

const formattaValuta = (valore: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(valore);

export default function RicercaMovimentiPage() {
  // Se si arriva da /ricerca/2 la scheda iniziale è la 2, altrimenti la 1
  const { tipo } = useParams<{ tipo: string }>();
  const [modo, setModo] = useState<number>(
    [1, 2, 3].includes(Number(tipo)) ? Number(tipo) : 1,
  );

  const [n, setN] = useState('10');
  const [categoria, setCategoria] = useState('');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');
  const [movimenti, setMovimenti] = useState<Transaction[] | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [esportando, setEsportando] = useState(false);

  // Cambio scheda: azzero risultati e filtri
  useEffect(() => {
    setMovimenti(null);
    setSaldo(null);
    setErrore(null);
    setCategoria('');
    setDal('');
    setAl('');
  }, [modo]);

  const valida = (): string | null => {
    const nNum = Number(n);
    if (!Number.isInteger(nNum) || nNum < 1) {
      return 'Inserisci un numero di movimenti valido (intero maggiore di 0).';
    }
    if (modo === 2 && !categoria) return 'Seleziona una categoria.';
    if (modo === 3) {
      if (!dal || !al) return 'Seleziona entrambe le date.';
      if (dal > al) return 'La data iniziale non può essere successiva alla data finale.';
    }
    return null;
  };

  // Parametri per il backend: gli stessi per ricerca ed export
  const costruisciParams = (): TransactionFilterParams => {
    const params: TransactionFilterParams = { limit: Number(n) };
    if (modo === 2) params.category = categoria as TransactionCategory;
    if (modo === 3) {
      params.from = dal;
      params.to = al;
    }
    return params;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);
    setMovimenti(null);
    setSaldo(null);

    const erroreValidazione = valida();
    if (erroreValidazione) {
      setErrore(erroreValidazione);
      return;
    }

    setCaricamento(true);
    try {
      const response = await api.get<TransactionResponse>('/transactions', {
        params: costruisciParams(),
      });
      setMovimenti(response.data.transactions);
      // Il backend manda il saldo solo quando non ci sono filtri (scheda 1)
      if (modo === 1 && typeof response.data.balance === 'number') {
        setSaldo(response.data.balance);
      }
    } catch (err: any) {
      setErrore(err?.response?.data?.message || 'Errore durante la ricerca.');
    } finally {
      setCaricamento(false);
    }
  };

  const handleEsporta = async () => {
    setErrore(null);
    setEsportando(true);
    try {
      const response = await api.get('/transactions/download', {
        params: costruisciParams(),
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'movimenti.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrore("Errore durante l'esportazione del CSV.");
    } finally {
      setEsportando(false);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/img/3Vision_DigitalBank_LogoRMBG_white.png" alt="3Vision Logo" />
        </div>

        <nav className="sidebar-nav">
          <Link to="/home" className="nav-item">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/ricarica" className="nav-item">
            <Wallet size={20} />
            <span>Ricarica</span>
          </Link>
          <Link to="/movimenti" className="nav-item active">
            <ArrowLeftRight size={20} />
            <span>Movimenti</span>
          </Link>
          <Link to="/bonifico" className="nav-item">
            <Send size={20} />
            <span>Bonifico</span>
          </Link>
          <Link to="/impostazioni" className="nav-item">
            <Settings size={20} />
            <span>Impostazioni</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="dashboard-body">
          <div className="welcome-header">
            <h1>Movimenti</h1>
            <p>Cerca i movimenti del tuo conto ed esportali in CSV</p>
          </div>

          <div className="ricerca-tabs">
            {SCHEDE.map((s) => (
              <button
                key={s.modo}
                type="button"
                className={`ricerca-tab ${modo === s.modo ? 'active' : ''}`}
                onClick={() => setModo(s.modo)}
              >
                {s.titolo}
              </button>
            ))}
          </div>

          <div className="ricerca-card">
            <form onSubmit={handleSubmit} className="ricerca-form">
              <label className="ricerca-field">
                Numero di movimenti
                <input
                  type="number"
                  min="1"
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                />
              </label>

              {modo === 2 && (
                <label className="ricerca-field">
                  Categoria
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="">-- seleziona --</option>
                    {Object.values(TransactionCategory).map((c) => (
                      <option key={c} value={c}>
                        {ETICHETTE_CATEGORIE[c]}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {modo === 3 && (
                <>
                  <label className="ricerca-field">
                    Dal
                    <input type="date" value={dal} onChange={(e) => setDal(e.target.value)} />
                  </label>
                  <label className="ricerca-field">
                    Al
                    <input type="date" value={al} onChange={(e) => setAl(e.target.value)} />
                  </label>
                </>
              )}

              <button type="submit" className="btn-primary" disabled={caricamento}>
                {caricamento ? 'Ricerca in corso...' : 'Cerca'}
              </button>
            </form>
          </div>

          {errore && <p className="ricerca-error">{errore}</p>}

          {saldo !== null && (
            <div className="balance-card">
              <div className="balance-header">
                <span>Saldo finale del conto</span>
              </div>
              <div className="balance-amount">{formattaValuta(saldo)}</div>
            </div>
          )}

          {movimenti && (
            <div className="transactions-card">
              <div className="ricerca-toolbar">
                <span>{movimenti.length} movimenti trovati</span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={movimenti.length === 0 || esportando}
                  onClick={handleEsporta}
                >
                  {esportando ? 'Esportazione...' : 'Esporta CSV'}
                </button>
              </div>

              {movimenti.length === 0 ? (
                <p className="ricerca-empty">Nessun movimento trovato.</p>
              ) : (
                <table className="ricerca-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th className="right">Importo</th>
                      <th>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimenti.map((m, i) => (
                      <tr key={m.id ?? i}>
                        <td>{new Date(m.date).toLocaleDateString('it-IT')}</td>
                        <td
                          className={`right tx-amount ${
                            m.type === 'income' ? 'positivo' : 'negativo'
                          }`}
                        >
                          {m.type === 'income' ? '+' : '-'}
                          {formattaValuta(Math.abs(m.amount))}
                        </td>
                        <td>
                          <span className="category-badge">
                            {ETICHETTE_CATEGORIE[m.category] ?? m.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

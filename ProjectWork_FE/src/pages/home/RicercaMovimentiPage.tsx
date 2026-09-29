import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../utils/services/api';
import { TransactionCategory } from '../../types/transaction';
import type {
  Transaction,
  TransactionFilterParams,
  TransactionResponse,
} from '../../types/transaction';

const TITOLI: Record<number, string> = {
  1: 'Ultimi movimenti',
  2: 'Movimenti per categoria',
  3: 'Movimenti tra due date',
};

const ETICHETTE_CATEGORIE: Record<TransactionCategory, string> = {
  accountOpening: 'Apertura conto',
  incomingTransfer: 'Bonifico in entrata',
  outgoingTransfer: 'Bonifico in uscita',
  cashWithdrawal: 'Prelievo contanti',
  utilityPayment: 'Pagamento utenze',
  topUp: 'Ricarica telefonica',
  atmDeposit: 'Versamento ATM',
};

export default function RicercaMovimentiPage() {
  const { tipo } = useParams<{ tipo: string }>();
  const modo = Number(tipo);

  const [n, setN] = useState('10');
  const [categoria, setCategoria] = useState('');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');
  const [movimenti, setMovimenti] = useState<Transaction[] | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [esportando, setEsportando] = useState(false);

  // Cambio di tipo di ricerca: azzero risultati e filtri
  useEffect(() => {
    setMovimenti(null);
    setSaldo(null);
    setErrore(null);
    setCategoria('');
    setDal('');
    setAl('');
  }, [modo]);

  if (![1, 2, 3].includes(modo)) {
    return (
      <div className="pagina errore">
        Ricerca non valida. <Link to="/home">Torna alla Home</Link>
      </div>
    );
  }

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
      // Il backend manda il saldo solo quando non ci sono filtri (ricerca 1)
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
    <div className="pagina">
      <Link to="/home">&larr; Torna alla Home</Link>
      <h1>{TITOLI[modo]}</h1>

      <form onSubmit={handleSubmit} className="ricerca-form">
        <label>
          Numero di movimenti
          <input
            type="number"
            min="1"
            value={n}
            onChange={(e) => setN(e.target.value)}
          />
        </label>

        {modo === 2 && (
          <label>
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
            <label>
              Dal
              <input type="date" value={dal} onChange={(e) => setDal(e.target.value)} />
            </label>
            <label>
              Al
              <input type="date" value={al} onChange={(e) => setAl(e.target.value)} />
            </label>
          </>
        )}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Ricerca in corso...' : 'Cerca'}
        </button>
      </form>

      {errore && <p className="errore">{errore}</p>}

      {saldo !== null && (
        <div className="saldo-card">
          <span>Saldo finale del conto</span>
          <strong>{saldo.toFixed(2)} EUR</strong>
        </div>
      )}

      {movimenti && (
        <>
          <div className="ricerca-azioni">
            <span>{movimenti.length} movimenti trovati</span>
            <button
              type="button"
              disabled={movimenti.length === 0 || esportando}
              onClick={handleEsporta}
            >
              {esportando ? 'Esportazione...' : 'Esporta CSV'}
            </button>
          </div>

          {movimenti.length === 0 ? (
            <p>Nessun movimento trovato.</p>
          ) : (
            <table className="movimenti-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Importo</th>
                  <th>Categoria</th>
                </tr>
              </thead>
              <tbody>
                {movimenti.map((m, i) => (
                  <tr key={m.id ?? i}>
                    <td>{new Date(m.date).toLocaleDateString('it-IT')}</td>
                    <td className={m.type === 'income' ? 'importo-positivo' : 'importo-negativo'}>
                      {m.type === 'income' ? '+' : '-'}
                      {Math.abs(m.amount).toFixed(2)} EUR
                    </td>
                    <td>{ETICHETTE_CATEGORIE[m.category] ?? m.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

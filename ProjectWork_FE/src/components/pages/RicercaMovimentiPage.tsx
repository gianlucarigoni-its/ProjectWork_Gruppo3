import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../utils/services/api';
import { esportaCsv } from '../../utils/exportCsv';
import type { Categoria, RigaMovimento, RisultatoRicerca } from '../../types';

const TITOLI: Record<number, string> = {
  1: 'Ultimi movimenti',
  2: 'Movimenti per categoria',
  3: 'Movimenti tra due date',
};

export default function RicercaMovimentiPage() {
  const { tipo } = useParams<{ tipo: string }>();
  const modo = Number(tipo);

  const [n, setN] = useState('10');
  const [categoriaId, setCategoriaId] = useState('');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [movimenti, setMovimenti] = useState<RigaMovimento[] | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);

  // Cambio di tipo di ricerca: azzero i risultati
  useEffect(() => {
    setMovimenti(null);
    setSaldo(null);
    setErrore(null);
  }, [modo]);

  // Lista categorie (solo ricerca 2)
  useEffect(() => {
    if (modo !== 2) return;
    api
      .get<Categoria[]>('/account/categorie')
      .then((r) => setCategorie(r.data))
      .catch(() => setErrore('Impossibile caricare le categorie.'));
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
    if (modo === 2 && !categoriaId) return 'Seleziona una categoria.';
    if (modo === 3) {
      if (!dal || !al) return 'Seleziona entrambe le date.';
      if (dal > al) return 'La data iniziale non può essere successiva alla data finale.';
    }
    return null;
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
      let url = '/account/ricerca/ultimi';
      let params: Record<string, string> = { n };
      if (modo === 2) {
        url = '/account/ricerca/categoria';
        params = { n, categoriaId };
      } else if (modo === 3) {
        url = '/account/ricerca/date';
        params = { n, dal, al };
      }

      const response = await api.get<RisultatoRicerca>(url, { params });
      const ordinati = [...response.data.movimenti]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, Number(n));

      setMovimenti(ordinati);
      if (modo === 1 && typeof response.data.saldo === 'number') {
        setSaldo(response.data.saldo);
      }
    } catch (err: any) {
      setErrore(err?.response?.data?.message || 'Errore durante la ricerca.');
    } finally {
      setCaricamento(false);
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
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">-- seleziona --</option>
              {categorie.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nomeCategoria}
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
              disabled={movimenti.length === 0}
              onClick={() => esportaCsv('movimenti.csv', movimenti)}
            >
              Esporta CSV
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
                  <tr key={m._id ?? m.id ?? i}>
                    <td>{new Date(m.data).toLocaleDateString('it-IT')}</td>
                    <td className={m.importo >= 0 ? 'importo-positivo' : 'importo-negativo'}>
                      {m.importo.toFixed(2)} EUR
                    </td>
                    <td>{m.categoriaMovimentoId?.nomeCategoria ?? '-'}</td>
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

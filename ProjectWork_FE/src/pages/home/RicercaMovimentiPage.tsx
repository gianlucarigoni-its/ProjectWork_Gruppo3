import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, RotateCcw } from "lucide-react";
import { api } from "../../utils/services/api";
import { TransactionCategory } from "../../types/transaction";
import type {
  Transaction,
  TransactionFilterParams,
  TransactionResponse,
} from "../../types/transaction";

const ETICHETTE_CATEGORIE: Record<TransactionCategory, string> = {
  accountOpening: "Apertura conto",
  incomingTransfer: "Bonifico in entrata",
  outgoingTransfer: "Bonifico in uscita",
  topUp: "Ricarica telefonica",
};

const NESSUN_FILTRO = {} as TransactionFilterParams;

const formattaValuta = (valore: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valore);

const oggiISO = () => {
  const d = new Date();
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mese}-${giorno}`;
};

export default function RicercaMovimentiPage() {
  const navigate = useNavigate();

  const [n, setN] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dal, setDal] = useState("");
  const [al, setAl] = useState("");

  const [movimenti, setMovimenti] = useState<Transaction[] | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [paramsUsati, setParamsUsati] = useState<TransactionFilterParams>(NESSUN_FILTRO);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [esportando, setEsportando] = useState(false);

  const [avviso, setAvviso] = useState<string | null>(null);
  const richiestaId = useRef(0); // serve a ignorare le risposte "vecchie"

  const eseguiRicerca = async (params: TransactionFilterParams) => {
    const id = ++richiestaId.current;
    setErrore(null);
    setCaricamento(true);
    try {
      const response = await api.get<TransactionResponse>("/transactions", { params });
      if (id !== richiestaId.current) return; // nel frattempo è partita un'altra ricerca

      setMovimenti(response.data.transactions);
      setParamsUsati(params);

      const senzaFiltri = !params.category && !params.from && !params.to;
      setSaldo(
        senzaFiltri && typeof response.data.balance === "number" ? response.data.balance : null,
      );
    } catch (err: any) {
      if (id !== richiestaId.current) return;
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setErrore(err?.response?.data?.message || "Errore durante la ricerca.");
    } finally {
      if (id === richiestaId.current) setCaricamento(false);
    }
  };

  // Ricerca automatica: 0,5 s dopo l'ultima modifica (subito se non c'è nessun filtro)
  useEffect(() => {
    const messaggio = valida();
    if (messaggio) {
      richiestaId.current++; // scarta eventuali risposte in arrivo
      setCaricamento(false);
      setAvviso(messaggio);
      return;
    }
    setAvviso(null);

    const tuttoVuoto = !n && !categoria && !dal && !al;
    const timer = setTimeout(() => eseguiRicerca(costruisciParams()), tuttoVuoto ? 0 : 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, categoria, dal, al]);

  // All'apertura: tutti i movimenti, senza parametri
  useEffect(() => {
    eseguiRicerca(NESSUN_FILTRO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valida = (): string | null => {
    if (n !== "" && (!Number.isInteger(Number(n)) || Number(n) < 1)) {
      return "Inserisci un numero di movimenti valido (intero maggiore di 0).";
    }
    // Una data sola va bene; il controllo serve solo se ci sono entrambe
    if (dal && al && dal > al) {
      return "La data iniziale non può essere successiva alla data finale.";
    }
    if ((dal && dal > oggiISO()) || (al && al > oggiISO())) {
      return "Non puoi selezionare una data futura.";
    }
    return null;
  };

  const costruisciParams = (): TransactionFilterParams => {
    const params: Partial<TransactionFilterParams> = {};
    if (n !== "") params.limit = Number(n);
    if (categoria) params.category = categoria as TransactionCategory;
    if (dal) params.from = dal;
    if (al) params.to = al;
    return params as TransactionFilterParams;
  };

  // Invio nel form: la ricerca parte già da sola, serve solo a non ricaricare la pagina
  const handleSubmit = (e: FormEvent) => e.preventDefault();

  const handleAzzera = () => {
    setN("");
    setCategoria("");
    setDal("");
    setAl("");
  };

  const handleEsporta = async () => {
    setErrore(null);
    setEsportando(true);
    try {
      const response = await api.get("/transactions/download", {
        params: paramsUsati,
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "movimenti.csv";
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

  const quanti = movimenti?.length ?? 0;
  const oggi = oggiISO();

  return (
    <>
      <div className="page-header">
        <h1>Movimenti</h1>
        <p>Cerca i movimenti del tuo conto ed esportali in CSV</p>
      </div>

      <form onSubmit={handleSubmit} className="filter-bar" noValidate>
        <div className="form-group">
          <label htmlFor="limite">Numero di movimenti</label>
          <input
            id="limite"
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="Tutti"
            value={n}
            onChange={(e) => setN(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Tutte</option>
            {Object.values(TransactionCategory).map((c) => (
              <option key={c} value={c}>
                {ETICHETTE_CATEGORIE[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dal">Dal</label>
          <input
            id="dal"
            type="date"
            max={al || oggi}
            value={dal}
            onChange={(e) => setDal(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="al">Al</label>
          <input
            id="al"
            type="date"
            min={dal || undefined}
            max={oggi}
            value={al}
            onChange={(e) => setAl(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button type="button" className="btn-ghost" onClick={handleAzzera} disabled={caricamento}>
            <RotateCcw size={16} aria-hidden="true" /> Azzera
          </button>
        </div>
      </form>

      {avviso && <p className="filter-hint">{avviso}</p>}

      {errore && (
        <div className="alert alert-error" role="alert">
          {errore}
        </div>
      )}

      <div className="results-card" aria-busy={caricamento}>
        <div className="results-toolbar">
          <div className="results-summary">
            <span>
              {caricamento
                ? "Ricerca in corso..."
                : `${quanti} ${quanti === 1 ? "movimento" : "movimenti"}`}
            </span>
            {saldo !== null && !caricamento && (
              <span className="saldo-inline">
                Saldo finale <strong>{formattaValuta(saldo)}</strong>
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-secondary btn-sm"
            disabled={caricamento || quanti === 0 || esportando}
            onClick={handleEsporta}
          >
            {esportando ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <Download size={16} aria-hidden="true" />
            )}
            {esportando ? "Esportazione..." : "Esporta CSV"}
          </button>
        </div>

        <div className={`results-scroll${caricamento && movimenti ? " results-loading" : ""}`}>
          {caricamento && movimenti === null ? (
            [0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton results-skeleton" />)
          ) : quanti === 0 ? (
            <div className="empty-state">
              <span className="empty-title">Nessun movimento trovato</span>
              <span className="empty-text">Prova a cambiare o azzerare i filtri.</span>
            </div>
          ) : (
            <table className="ricerca-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th className="right">Importo</th>
                </tr>
              </thead>
              <tbody>
                {movimenti!.map((m, i) => (
                  <tr
                    key={m.id ?? i}
                    className={m.id ? "clickable" : undefined}
                    onClick={() => m.id && navigate(`/movimenti/${m.id}`)}
                  >
                    <td>
                      {m.id ? (
                        <Link
                          to={`/movimenti/${m.id}`}
                          className="row-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {new Date(m.date).toLocaleDateString("it-IT")}
                        </Link>
                      ) : (
                        new Date(m.date).toLocaleDateString("it-IT")
                      )}
                    </td>

                    <td>
                      <span className="category-badge">
                        {ETICHETTE_CATEGORIE[m.category] ?? m.category}
                      </span>
                    </td>
                    <td
                      className={`right tx-amount ${m.type === "income" ? "positivo" : "negativo"}`}
                    >
                      {m.type === "income" ? "+" : "-"}
                      {formattaValuta(Math.abs(m.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/services/api";
import { Wallet, ArrowLeftRight, Send, Eye, EyeOff, ChevronRight } from "lucide-react";

interface Movimento {
  id: number;
  descrizione?: string;
  data?: string;
  date?: string;
  importo?: number | string;
  amount?: number | string;
  tipo?: "positivo" | "negativo";
  type?: string;
}

const MASCHERA_SALDO = "•••••••• €";
const MASCHERA_IMPORTO = "•••• €";

const formattaValuta = (valore: number, conSegno = false) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    signDisplay: conSegno ? "always" : "auto",
  }).format(valore);

const formattaMovimento = (item: any) => {
  const val = item.amount ?? item.importo;
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);

  // È un'entrata (+) soltanto se type è "income" oppure tipo è "positivo"
  const isIncome = item.type === "income" || item.tipo === "positivo";
  
  const segno = isIncome ? "+" : "-";
  return `${segno}${formattaValuta(Math.abs(n))}`;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [mostraSaldo, setMostraSaldo] = useState(true);

  const [nomeTitolare, setNomeTitolare] = useState<string>("");
  const [cognomeTitolare, setCognomeTitolare] = useState<string>("");
  const [saldoValore, setSaldoValore] = useState<number>(0);
  const [movimentiRecenti, setMovimentiRecenti] = useState<Movimento[]>([]);

  const [caricamento, setCaricamento] = useState<boolean>(true);
  const [errore, setErrore] = useState<string | null>(null);

  const caricaDatiDashboard = useCallback(async () => {
    setCaricamento(true);
    setErrore(null);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const resConto = await api.get("/accounts/home", config);

      if (resConto.data) {
        const dataAccount = resConto.data.account || resConto.data.user || resConto.data;

        const nome = dataAccount.firstName || dataAccount.nome || dataAccount.username || "";
        const cognome = dataAccount.lastName || dataAccount.cognome || "";
        const saldo = dataAccount.balance ?? dataAccount.saldo ?? dataAccount.saldoDisponibile ?? 0;

        setNomeTitolare(nome);
        setCognomeTitolare(cognome);
        setSaldoValore(Number(saldo));

        const listaMovimenti = resConto.data.transactions || dataAccount.transactions || [];

        const movimentiFormattati = listaMovimenti.map((m: any) => {
          // Determina se è un'entrata basandosi su m.type === "income" o m.tipo
          const isIncome = m.type === "income" || m.tipo === "positivo" || m.tipo === "IN";

          return {
            id: m.id || m._id,
            descrizione: m.descrizione || m.description || m.type || "Movimento",
            data: m.data
              ? new Date(m.data).toLocaleDateString("it-IT")
              : m.createdAt
                ? new Date(m.createdAt).toLocaleDateString("it-IT")
                : m.date
                  ? new Date(m.date).toLocaleDateString("it-IT")
                  : "",
            importo: m.importo ?? m.amount ?? 0,
            amount: m.amount ?? m.importo ?? 0,
            type: m.type,
            tipo: isIncome ? "positivo" : "negativo",
          };
        });

        setMovimentiRecenti(movimentiFormattati);
      }
    } catch (err: any) {
      console.error("Errore recupero dettagli conto:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setErrore(
        !err.response || err.response.status >= 500
          ? "Impossibile connettersi al server per recuperare i dati."
          : "Non è stato possibile caricare i dati del conto.",
      );
    } finally {
      setCaricamento(false);
    }
  }, [navigate]);

  useEffect(() => {
    caricaDatiDashboard();
  }, [caricaDatiDashboard]);

  const nomeCompleto = `${nomeTitolare} ${cognomeTitolare}`.trim();

  return (
    <>
      <div className="welcome-header">
        <h1>{nomeCompleto ? `Benvenuto, ${nomeCompleto}` : "Benvenuto"}</h1>
        <p>Ecco la panoramica aggiornata del tuo conto</p>
      </div>

      {errore && (
        <div className="alert alert-error alert-with-action" role="alert">
          <span>{errore}</span>
          <button type="button" className="btn-ghost btn-sm" onClick={caricaDatiDashboard}>
            Riprova
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="grid-left">
          {/* Card Saldo */}
          <div className="balance-card">
            <div className="balance-header">
              <span>Saldo disponibile</span>
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setMostraSaldo(!mostraSaldo)}
                aria-label={mostraSaldo ? "Nascondi saldo" : "Mostra saldo"}
                aria-pressed={!mostraSaldo}
              >
                {mostraSaldo ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            <div className="balance-amount" aria-busy={caricamento}>
              {caricamento ? (
                <span className="skeleton balance-skeleton" aria-label="Caricamento saldo" />
              ) : mostraSaldo ? (
                formattaValuta(saldoValore)
              ) : (
                MASCHERA_SALDO
              )}
            </div>
          </div>

          {/* Ultimi Movimenti */}
          <div className="transactions-card">
            <div className="card-header">
              <h3>Ultimi 5 movimenti</h3>
              <Link to="/movimenti" className="see-all-link">
                Vedi tutti <ChevronRight size={18} />
              </Link>
            </div>
            <div className="transactions-list" aria-busy={caricamento}>
              {caricamento ? (
                [0, 1, 2].map((i) => <div key={i} className="skeleton tx-skeleton" />)
              ) : movimentiRecenti.length > 0 ? (
                movimentiRecenti.slice(0, 5).map((item) => (
                  <Link key={item.id} to={`/movimenti/${item.id}`} className="transaction-item">
                    <div className="tx-info">
                      <span className="tx-title">{item.descrizione}</span>
                      <span className="tx-date">{item.data}</span>
                    </div>
                    <span className={`tx-amount ${item.tipo}`}>
                      {mostraSaldo ? formattaMovimento(item) : MASCHERA_IMPORTO}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-title">Nessun movimento</span>
                  <span className="empty-text">
                    Quando farai un bonifico o una ricarica, i movimenti compariranno qui.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonna Destra: Azioni Rapide */}
        <div className="grid-right">
          <div className="quick-actions-card">
            <h3>Azioni rapide</h3>
            <div className="quick-actions-grid">
              <button type="button" onClick={() => navigate("/bonifico")} className="action-btn">
                <div className="action-icon orange">
                  <Send size={22} />
                </div>
                <span>Bonifico</span>
              </button>

              <button type="button" onClick={() => navigate("/ricarica")} className="action-btn">
                <div className="action-icon green">
                  <Wallet size={22} />
                </div>
                <span>Ricarica</span>
              </button>

              <button type="button" onClick={() => navigate("/movimenti")} className="action-btn">
                <div className="action-icon dark">
                  <ArrowLeftRight size={22} />
                </div>
                <span>Movimenti</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
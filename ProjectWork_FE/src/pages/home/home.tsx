import { useState, useEffect, Profiler } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/services/api";
import {
  Home,
  Wallet,
  ArrowLeftRight,
  Send,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  ChevronRight,
  User,
} from "lucide-react";
import logoImg from "../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png";

interface Movimento {
  id: number;
  descrizione: string;
  data: string;
  importo: number | string;
  tipo: "positivo" | "negativo";
}

export default function HomePage() {
  const navigate = useNavigate();
  const [mostraSaldo, setMostraSaldo] = useState(true);
  const [menuProfiloAperto, setMenuProfiloAperto] = useState(false);

  // Stati per i dati dal DB
  const [nomeTitolare, setNomeTitolare] = useState<string>("");
  const [cognomeTitolare, setCognomeTitolare] = useState<string>("");
  const [saldoValore, setSaldoValore] = useState<number>(0);
  const [movimentiRecenti, setMovimentiRecenti] = useState<Movimento[]>([]);

  const [caricamento, setCaricamento] = useState<boolean>(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    const caricaDatiDashboard = async () => {
      setCaricamento(true);
      setErrore(null);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        // 1. Recupero Dettagli Conto e Profilo (che contengono già le transazioni)
        const resConto = await api.get("/accounts/home", config);

        console.log("RISPOSTA SERVER CONTO:", resConto.data);

        if (resConto.data) {
          const dataAccount = resConto.data.account || resConto.data.user || resConto.data;

          const nome = dataAccount.firstName || dataAccount.nome || dataAccount.username || "";
          const cognome = dataAccount.lastName || dataAccount.cognome || "";
          const saldo =
            dataAccount.balance ?? dataAccount.saldo ?? dataAccount.saldoDisponibile ?? 0;

          setNomeTitolare(nome);
          setCognomeTitolare(cognome);
          setSaldoValore(Number(saldo));

          // Estrae le transazioni già restituite da resConto.data
          const listaMovimenti = resConto.data.transactions || dataAccount.transactions || [];

          const movimentiFormattati = listaMovimenti.map((m: any) => ({
            id: m.id || m._id,
            descrizione: m.descrizione || m.description || m.type || "Movimento",
            data: m.data
              ? new Date(m.data).toLocaleDateString("it-IT")
              : m.createdAt
                ? new Date(m.createdAt).toLocaleDateString("it-IT")
                : "",
            importo: m.importo ?? m.amount ?? 0,
            tipo: m.tipo || (Number(m.importo ?? m.amount) >= 0 ? "positivo" : "negativo"),
          }));

          setMovimentiRecenti(movimentiFormattati);
        }
      } catch (err: any) {
        console.error("Errore recupero dettagli conto:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        if (!err.response || err.response.status >= 500) {
          setErrore("Impossibile connettersi al server per recuperare i dati.");
        }
      } finally {
        setCaricamento(false);
      }
    };

    caricaDatiDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formattaValuta = (valore: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(valore);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Sinistra */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoImg} alt="3Vision Logo" />
        </div>

        <nav className="sidebar-nav">
          <Link to="/home" className="nav-item active">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/ricarica" className="nav-item">
            <Wallet size={20} />
            <span>Ricarica</span>
          </Link>
          <Link to="/movimenti" className="nav-item">
            <ArrowLeftRight size={20} />
            <span>Movimenti</span>
          </Link>
          <Link to="/bonifico" className="nav-item">
            <Send size={20} />
            <span>Bonifico</span>
          </Link>
        </nav>
      </aside>

      {/* Area Principale */}
      <main className="main-content">
        {/* Navbar Superiore */}
        <header className="top-navbar">
          <div className="navbar-right">
            <div className="profile-wrapper">
              <button
                className="profile-btn"
                onClick={() => setMenuProfiloAperto(!menuProfiloAperto)}
              >
                <div className="avatar">
                  {nomeTitolare[0]}
                  {cognomeTitolare[0]}
                </div>
              </button>

              {menuProfiloAperto && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-info">
                    <p>
                      {nomeTitolare} {cognomeTitolare}
                    </p>
                  </div>
                  <hr />

                  <Link
                    to="/profilo"
                    className="dropdown-item"
                    onClick={() => setMenuProfiloAperto(false)}
                  >
                    <User size={16} />
                    <span>Profilo</span>
                  </Link>

                  <button onClick={handleLogout} className="dropdown-item logout">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Corpo Dashboard */}
        <div className="dashboard-body">
          <div className="welcome-header">
            <h1>
              Benvenuto, {nomeTitolare} {cognomeTitolare}
            </h1>
            <p>Ecco la panoramica aggiornata del tuo conto</p>
          </div>

          {errore && (
            <div
              style={{
                color: "#f87171",
                padding: "0.75rem",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              {errore}
            </div>
          )}

          <div className="dashboard-grid">
            <div className="grid-left">
              {/* Card Saldo */}
              <div className="balance-card">
                <div className="balance-header">
                  <span>Saldo disponibile</span>
                  <button
                    className="eye-toggle-btn"
                    onClick={() => setMostraSaldo(!mostraSaldo)}
                    title={mostraSaldo ? "Nascondi saldo" : "Mostra saldo"}
                  >
                    {mostraSaldo ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                <div className="balance-amount">
                  {caricamento
                    ? "Caricamento..."
                    : mostraSaldo
                      ? formattaValuta(saldoValore)
                      : "•••••••• €"}
                </div>
              </div>

              {/* Ultimi Movimenti dal DB */}
              <div className="transactions-card">
                <div className="card-header">
                  <h3>Ultimi 5 movimenti</h3>
                  <Link to="/movimenti" className="see-all-link">
                    Vedi tutti <ChevronRight size={18} />
                  </Link>
                </div>
                <div className="transactions-list">
                  {caricamento ? (
                    <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Caricamento in corso...</p>
                  ) : movimentiRecenti.length > 0 ? (
                    movimentiRecenti.slice(0, 5).map((item) => (
                      <div key={item.id} className="transaction-item">
                        <div className="tx-info">
                          <span className="tx-title">{item.descrizione}</span>
                          <span className="tx-date">{item.data}</span>
                        </div>
                        <span className={`tx-amount ${item.tipo}`}>
                          {mostraSaldo
                            ? typeof item.importo === "number"
                              ? formattaValuta(item.importo)
                              : item.importo
                            : "•••• €"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem", padding: "0.5rem 0" }}>
                      Nessun movimento trovato nel conto.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Colonna Destra: Azioni Rapide */}
            <div className="grid-right">
              <div className="quick-actions-card">
                <h3>Azioni rapide</h3>
                <div className="quick-actions-grid">
                  <button onClick={() => navigate("/bonifico")} className="action-btn">
                    <div className="action-icon orange">
                      <Send size={22} />
                    </div>
                    <span>Bonifico</span>
                  </button>

                  <button onClick={() => navigate("/ricarica")} className="action-btn">
                    <div className="action-icon green">
                      <Wallet size={22} />
                    </div>
                    <span>Ricarica</span>
                  </button>

                  <button onClick={() => navigate("/movimenti")} className="action-btn">
                    <div className="action-icon dark">
                      <ArrowLeftRight size={22} />
                    </div>
                    <span>Movimenti</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

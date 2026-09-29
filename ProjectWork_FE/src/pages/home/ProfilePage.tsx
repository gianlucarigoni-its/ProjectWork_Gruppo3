import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/services/api";
import logoImg from "../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png";
import {
  Home,
  Wallet,
  ArrowLeftRight,
  Send,
  LogOut,
  User,
  ShieldCheck,
  CreditCard,
  Hash,
} from "lucide-react";

export interface ProfileResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  IBAN: string;
  balance: number;
  createdAt: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [menuProfiloAperto, setMenuProfiloAperto] = useState(false);
  const [profilo, setProfilo] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfilo = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/accounts/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfilo(response.data);
      } catch (err) {
        console.error("Errore durante il recupero del profilo:", err);
        setError("Impossibile caricare i dati del profilo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfilo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const nomeTitolare = profilo?.firstName || "";
  const cognomeTitolare = profilo?.lastName || "";

  // Helper per formattare la data di creazione
  const formatData = (isoString: string): string => {
    if (!isoString) return "N/D";
    return new Date(isoString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Helper per formattare il saldo in Euro
  const formatSaldo = (val: number): string => {
    if (typeof val !== "number") return "0,00 €";
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(val);
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

        {/* Contenuto Pagina Profilo */}
        <div className="dashboard-body">
          <div className="welcome-header">
            <h1>Il mio Profilo</h1>
          </div>

          {loading && <p className="ricerca-empty">Caricamento in corso...</p>}
          {error && <p className="ricerca-error">{error}</p>}

          {!loading && !error && profilo && (
            <div className="dashboard-grid">
              {/* Dati Personali */}
              <div className="transactions-card">
                <div className="card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <User size={20} />
                    <h3>Informazioni Utente</h3>
                  </div>
                </div>
                <div className="transactions-list">
                  <div className="transaction-item">
                    <span className="tx-date">Nome</span>
                    <span className="tx-title">{profilo.firstName}</span>
                  </div>
                  <div className="transaction-item">
                    <span className="tx-date">Cognome</span>
                    <span className="tx-title">{profilo.lastName}</span>
                  </div>
                  <div className="transaction-item">
                    <span className="tx-date">Username</span>
                    <span className="tx-title">{profilo.username}</span>
                  </div>
                </div>
              </div>

              {/* Dettagli Conto */}
              <div className="transactions-card">
                <div className="card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CreditCard size={20} />
                    <h3>Dettagli Conto</h3>
                  </div>
                </div>
                <div className="transactions-list">
                  <div className="transaction-item">
                    <span className="tx-date">IBAN</span>
                    <span className="tx-title">{profilo.IBAN}</span>
                  </div>
                  <div className="transaction-item">
                    <span className="tx-date">Saldo Disponibile</span>
                    <span className="tx-amount positivo">{formatSaldo(profilo.balance)}</span>
                  </div>
                  <div className="transaction-item">
                    <span className="tx-date">Stato Conto</span>
                    <span
                      className="tx-amount positivo"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <ShieldCheck size={14} /> Attivo
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Account */}
              <div className="transactions-card">
                <div className="card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Hash size={20} />
                    <h3>Dettagli Registrazione</h3>
                  </div>
                </div>
                <div className="transactions-list">
                  <div className="transaction-item">
                    <span className="tx-date">ID Account</span>
                    <span className="tx-title" style={{ fontFamily: "monospace" }}>
                      {profilo.id}
                    </span>
                  </div>
                  <div className="transaction-item">
                    <span className="tx-date">Data Apertura</span>
                    <span className="tx-title">{formatData(profilo.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

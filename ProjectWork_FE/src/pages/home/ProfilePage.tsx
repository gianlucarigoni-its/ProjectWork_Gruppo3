import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/services/api";
import logoImg from "../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png";
import {
  Home,
  Wallet,
  ArrowLeftRight,
  Send,
  Settings,
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
  amount: number;
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
          <Link to="/home" className="nav-item">
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
          <Link to="/impostazioni" className="nav-item">
            <Settings size={20} />
            <span>Impostazioni</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        {/* Navbar Superiore */}
        {/* Navbar Superiore */}
        <header className="top-navbar">
          <div className="navbar-right">
            <div className="profile-wrapper">
              <button
                className="profile-btn"
                onClick={() => setMenuProfiloAperto(!menuProfiloAperto)}
              >
                <div className="avatar">
                  {nomeTitolare ? nomeTitolare[0].toUpperCase() : "U"}
                  {cognomeTitolare ? cognomeTitolare[0].toUpperCase() : ""}
                </div>
              </button>

              {menuProfiloAperto && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-info">
                    <Link
                      to="/profilo"
                      className="user-name"
                      onClick={() => setMenuProfiloAperto(false)}
                    >
                      {nomeTitolare} {cognomeTitolare}
                    </Link>
                  </div>
                  <hr />
                  <button onClick={() => navigate("/impostazioni")} className="dropdown-item">
                    <Settings size={16} />
                    <span>Impostazioni</span>
                  </button>
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
        <div className="profile-content">
          <h1 className="page-title">Il mio Profilo</h1>

          {loading && <p className="loading-text">Caricamento in corso...</p>}
          {error && <p className="ricerca-error">{error}</p>}

          {!loading && !error && profilo && (
            <div className="profile-grid">
              {/* Dati Personali */}
              <div className="profile-card">
                <div className="card-header">
                  <User size={20} />
                  <h2>Informazioni Utente</h2>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Nome:</span>
                    <span className="value">{profilo.firstName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Cognome:</span>
                    <span className="value">{profilo.lastName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Username:</span>
                    <span className="value">{profilo.username}</span>
                  </div>
                </div>
              </div>

              {/* Dettagli Conto */}
              <div className="profile-card">
                <div className="card-header">
                  <CreditCard size={20} />
                  <h2>Dettagli Conto</h2>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">IBAN:</span>
                    <span className="value">{profilo.IBAN}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Saldo Disponibile:</span>
                    <span className="value highlight-amount">{formatSaldo(profilo.amount)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Stato Conto:</span>
                    <span className="value badge-active">
                      <ShieldCheck size={14} /> Attivo
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Account */}
              <div className="profile-card">
                <div className="card-header">
                  <Hash size={20} />
                  <h2>Dettagli Registrazione</h2>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">ID Account:</span>
                    <span className="value code-text">{profilo.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Data Apertura:</span>
                    <span className="value">{formatData(profilo.createdAt)}</span>
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

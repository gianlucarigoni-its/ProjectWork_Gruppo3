import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/services/api";
import { User, ShieldCheck, CreditCard, Hash, Copy, Check, KeyRound } from "lucide-react";

export interface ProfileResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  IBAN: string;
  balance: number;
  createdAt: string;
}

const formatData = (isoString: string): string => {
  if (!isoString) return "N/D";
  return new Date(isoString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatSaldo = (val: number): string =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    typeof val === "number" ? val : 0,
  );

// IBAN a gruppi di 4 per leggerlo meglio (si copia comunque senza spazi)
const formatIban = (iban: string): string =>
  iban
    .replace(/\s/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();

const iniziali = (nome: string, cognome: string): string =>
  `${nome?.[0] ?? ""}${cognome?.[0] ?? ""}`.toUpperCase() || "?";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profilo, setProfilo] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiato, setCopiato] = useState(false);

  const fetchProfilo = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await api.get("/accounts/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfilo(response.data);
    } catch (err: any) {
      console.error("Errore durante il recupero del profilo:", err);
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setError("Impossibile caricare i dati del profilo.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfilo();
  }, [fetchProfilo]);

  const copiaIban = async () => {
    if (!profilo) return;
    try {
      await navigator.clipboard.writeText(profilo.IBAN.replace(/\s/g, ""));
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    } catch {
      // clipboard non disponibile: nessun feedback, l'IBAN resta selezionabile a mano
    }
  };

  return (
    <>
      <div className="welcome-header">
        <h1>Il mio profilo</h1>
        <p>I dati del tuo account e del tuo conto</p>
      </div>

      {error && (
        <div className="alert alert-error alert-with-action" role="alert">
          <span>{error}</span>
          <button type="button" className="btn-ghost btn-sm" onClick={fetchProfilo}>
            Riprova
          </button>
        </div>
      )}

      {loading && (
        <div aria-busy="true">
          <div className="skeleton profile-skeleton" />
          <div className="skeleton profile-skeleton" />
        </div>
      )}

      {!loading && !error && profilo && (
        <>
          <div className="profile-hero">
            <div className="profile-avatar" aria-hidden="true">
              {iniziali(profilo.firstName, profilo.lastName)}
            </div>
            <div className="profile-hero-text">
              <h2>
                {profilo.firstName} {profilo.lastName}
              </h2>
              <p>{profilo.username}</p>
              <span className="status-badge">
                <ShieldCheck size={14} aria-hidden="true" /> Conto attivo
              </span>
            </div>
            <Link to="/modifica-password" className="btn-ghost">
              <KeyRound size={16} aria-hidden="true" /> Modifica password
            </Link>
          </div>

          <div className="info-grid">
            <section className="info-card">
              <h3>
                <User size={20} aria-hidden="true" /> Informazioni utente
              </h3>
              <dl className="info-list">
                <div className="info-row">
                  <dt>Nome</dt>
                  <dd>{profilo.firstName}</dd>
                </div>
                <div className="info-row">
                  <dt>Cognome</dt>
                  <dd>{profilo.lastName}</dd>
                </div>
                <div className="info-row">
                  <dt>Username</dt>
                  <dd>{profilo.username}</dd>
                </div>
              </dl>
            </section>

            <section className="info-card">
              <h3>
                <CreditCard size={20} aria-hidden="true" /> Dettagli conto
              </h3>
              <dl className="info-list">
                <div className="info-row">
                  <dt>IBAN</dt>
                  <dd className="mono">
                    {formatIban(profilo.IBAN)}
                    <button
                      type="button"
                      className={`icon-btn${copiato ? " done" : ""}`}
                      onClick={copiaIban}
                      aria-label={copiato ? "IBAN copiato" : "Copia IBAN"}
                      title={copiato ? "Copiato!" : "Copia IBAN"}
                    >
                      {copiato ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </dd>
                </div>
                <div className="info-row">
                  <dt>Saldo disponibile</dt>
                  <dd className="tabular">{formatSaldo(profilo.balance)}</dd>
                </div>
              </dl>
            </section>

            <section className="info-card">
              <h3>
                <Hash size={20} aria-hidden="true" /> Dettagli registrazione
              </h3>
              <dl className="info-list">
                <div className="info-row">
                  <dt>ID account</dt>
                  <dd className="mono">{profilo.id}</dd>
                </div>
                <div className="info-row">
                  <dt>Data apertura</dt>
                  <dd>{formatData(profilo.createdAt)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </>
      )}
    </>
  );
}

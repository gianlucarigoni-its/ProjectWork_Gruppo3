import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Timer } from "lucide-react";
import { useAuth } from "../../context/authContext";

const TEMPO_LIMITE_SECONDI = 30;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [secondiRimasti, setSecondiRimasti] = useState(TEMPO_LIMITE_SECONDI);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Conto alla rovescia: si ferma mentre il login è in corso
  useEffect(() => {
    if (caricamento) return;
    const id = window.setInterval(() => {
      setSecondiRimasti((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => window.clearInterval(id);
  }, [caricamento]);

  // Tempo scaduto: svuoto il form e riparto da capo
  useEffect(() => {
    if (secondiRimasti > 0) return;
    setEmail("");
    setPassword("");
    setSecondiRimasti(TEMPO_LIMITE_SECONDI);
    setErrore("Tempo scaduto: hai impiegato troppo tempo per effettuare il login.");
  }, [secondiRimasti]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);

    if (!email.trim() || !password) {
      setErrore("Inserisci email e password.");
      return;
    }

    setCaricamento(true);
    try {
      await login(email, password);
      localStorage.setItem("userEmail", email);
      navigate("/home");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrore(Array.isArray(msg) ? msg.join(" ") : msg || "Credenziali non valide");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="sidebar-logo" aria-label="Vai alla home">
            <img
              src="/img/3Vision_DigitalBank_LogoRMBG_white.png"
              alt="3Vision Logo"
              className="auth-logo-img"
            />
          </Link>
        </div>

        <div className="auth-header">
          <h2>Accedi al tuo conto</h2>
          <p className="auth-subtitle">Inserisci le tue credenziali per proseguire</p>
          <div className={`timer-badge ${secondiRimasti <= 10 ? "warning" : ""}`} role="timer">
            <Timer size={14} aria-hidden="true" /> Tempo rimasto: <strong>{secondiRimasti}s</strong>
          </div>
        </div>

        {errore && (
          <div className="alert alert-error" role="alert">
            {errore}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              autoFocus
              placeholder="nome@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={caricamento}>
            {caricamento && <span className="spinner" aria-hidden="true" />}
            {caricamento ? "Accesso in corso..." : "Accedi"}
          </button>

          <p className="auth-footer-text">
            Non hai ancora un conto? <Link to="/register">Apri un conto</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

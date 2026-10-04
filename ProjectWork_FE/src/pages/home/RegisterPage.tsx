import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { authService } from "../../utils/services/authService";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regola della consegna: almeno 8 caratteri, una maiuscola e un simbolo
const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confermaPassword, setConfermaPassword] = useState("");
  const [nomeTitolare, setNomeTitolare] = useState("");
  const [cognomeTitolare, setCognomeTitolare] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);

  const nonCoincidono = confermaPassword !== "" && password !== confermaPassword;

  const validaForm = (): string | null => {
    if (
      !email ||
      !password ||
      !confermaPassword ||
      !nomeTitolare.trim() ||
      !cognomeTitolare.trim()
    ) {
      return "Tutti i campi sono obbligatori.";
    }
    if (!REGEX_EMAIL.test(email)) {
      return "Inserisci un indirizzo email valido.";
    }
    if (!REGEX_PASSWORD.test(password)) {
      return "La password deve avere almeno 8 caratteri, una maiuscola e un simbolo.";
    }
    if (password !== confermaPassword) {
      return "Le password non coincidono.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);
    setMessaggio(null);

    const erroreValidazione = validaForm();
    if (erroreValidazione) {
      setErrore(erroreValidazione);
      return;
    }

    setCaricamento(true);
    try {
      const response = await authService.registra({
        email,
        password,
        confermaPassword,
        nomeTitolare: nomeTitolare.trim(),
        cognomeTitolare: cognomeTitolare.trim(),
      });
      setMessaggio(
        response.data.message || "Controlla la tua email e clicca sul link per attivare il conto.",
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrore(Array.isArray(msg) ? msg.join(" ") : msg || "Errore durante la registrazione.");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img
            src="/img/3Vision_DigitalBank_LogoRMBG_white.png"
            alt="3Vision Logo"
            className="auth-logo-img"
          />
        </div>

        {messaggio ? (
          <div className="result-state" role="status">
            <CheckCircle2 size={56} className="result-icon" aria-hidden="true" />
            <h2>Registrazione completata!</h2>
            <p>{messaggio}</p>
            <Link to="/login" className="btn-primary btn-block">
              Vai al login
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2>Crea il tuo account</h2>
              <p className="auth-subtitle">Inizia a gestire le tue finanze in modo semplice</p>
            </div>

            {errore && (
              <div className="alert alert-error" role="alert">
                {errore}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome">Nome</label>
                  <input
                    id="nome"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Mario"
                    value={nomeTitolare}
                    onChange={(e) => setNomeTitolare(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cognome">Cognome</label>
                  <input
                    id="cognome"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Rossi"
                    value={cognomeTitolare}
                    onChange={(e) => setCognomeTitolare(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="mario.rossi@esempio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="passwordHint"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span id="passwordHint" className="field-hint">
                  Almeno 8 caratteri, una maiuscola e un simbolo.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="confermaPassword">Conferma password</label>
                <input
                  id="confermaPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={nonCoincidono}
                  value={confermaPassword}
                  onChange={(e) => setConfermaPassword(e.target.value)}
                />
                {nonCoincidono && <span className="field-error">Le password non coincidono.</span>}
              </div>

              <button type="submit" className="btn-primary btn-block" disabled={caricamento}>
                {caricamento && <span className="spinner" aria-hidden="true" />}
                {caricamento ? "Registrazione in corso..." : "Registrati"}
              </button>

              <p className="auth-footer-text">
                Hai già un account? <Link to="/login">Accedi</Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

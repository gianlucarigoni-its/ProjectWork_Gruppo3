import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/services/api";
import { ArrowLeft } from "lucide-react";

// Stessa regola del backend (ChangePasswordDto)
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ModificaPasswordPage() {
  const [passwordAttuale, setPasswordAttuale] = useState("");
  const [nuovaPassword, setNuovaPassword] = useState("");
  const [confermaNuovaPassword, setConfermaNuovaPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  const valida = (): string | null => {
    if (!passwordAttuale || !nuovaPassword || !confermaNuovaPassword) {
      return "Tutti i campi sono obbligatori.";
    }
    if (!REGEX_PASSWORD.test(nuovaPassword)) {
      return "La nuova password deve avere almeno 8 caratteri, una maiuscola e un simbolo.";
    }
    if (nuovaPassword !== confermaNuovaPassword) {
      return "Le nuove password non coincidono.";
    }
    if (nuovaPassword === passwordAttuale) {
      return "La nuova password deve essere diversa da quella attuale.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);
    setMessaggio(null);

    const erroreValidazione = valida();
    if (erroreValidazione) {
      setErrore(erroreValidazione);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setCaricamento(true);
    try {
      const response = await api.patch<{ message: string }>(
        "/auth/password", // = prefisso a cui monti il router auth + /password
        {
          oldPassword: passwordAttuale,
          newPassword: nuovaPassword,
          confirmPassword: confermaNuovaPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessaggio(response.data.message || "Password modificata con successo.");
      setPasswordAttuale("");
      setNuovaPassword("");
      setConfermaNuovaPassword("");
    } catch (err: any) {
      // 401 = sessione scaduta, non "password sbagliata"
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      const msg = err?.response?.data?.message;
      setErrore(
        Array.isArray(msg) ? msg.join(" ") : msg || "Errore durante la modifica della password.",
      );
    } finally {
      setCaricamento(false);
    }
  };

  const nonCoincidono = confermaNuovaPassword !== "" && nuovaPassword !== confermaNuovaPassword;

  return (
    <>
      <Link to="/home" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Torna alla Home
      </Link>

      <div className="welcome-header">
        <h1>Modifica password</h1>
        <p>Scegli una nuova password per il tuo account</p>
      </div>

      <form onSubmit={handleSubmit} className="form-card form-stack" noValidate>
        {errore && (
          <div className="alert alert-error" role="alert">
            {errore}
          </div>
        )}
        {messaggio && (
          <div className="alert alert-success" role="status">
            {messaggio}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="passwordAttuale">Password attuale</label>
          <input
            id="passwordAttuale"
            type="password"
            autoComplete="current-password"
            value={passwordAttuale}
            onChange={(e) => setPasswordAttuale(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="nuovaPassword">Nuova password</label>
          <input
            id="nuovaPassword"
            type="password"
            autoComplete="new-password"
            aria-describedby="passwordHint"
            value={nuovaPassword}
            onChange={(e) => setNuovaPassword(e.target.value)}
          />
          <span id="passwordHint" className="field-hint">
            Almeno 8 caratteri, una maiuscola e un simbolo.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="confermaNuovaPassword">Conferma nuova password</label>
          <input
            id="confermaNuovaPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={nonCoincidono}
            value={confermaNuovaPassword}
            onChange={(e) => setConfermaNuovaPassword(e.target.value)}
          />
          {nonCoincidono && <span className="field-error">Le password non coincidono.</span>}
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={caricamento}>
          {caricamento && <span className="spinner" aria-hidden="true" />}
          {caricamento ? "Salvataggio..." : "Modifica password"}
        </button>
      </form>
    </>
  );
}

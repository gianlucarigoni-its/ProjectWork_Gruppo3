import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../../utils/services/api";

const formattaValuta = (valore: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valore);

// Formato generico IBAN: 2 lettere, 2 cifre di controllo, poi 11-30 caratteri alfanumerici
const REGEX_IBAN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

export default function BonificoPage() {
  const navigate = useNavigate();
  const [iban, setIban] = useState("");
  const [amount, setAmount] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ iban: string; importo: number } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);

    const ibanPulito = iban.replace(/\s/g, "").toUpperCase();
    const importo = Number(amount);

    if (!ibanPulito) {
      setErrore("Inserisci l'IBAN del destinatario.");
      return;
    }
    if (!REGEX_IBAN.test(ibanPulito)) {
      setErrore("Inserisci un IBAN valido (es. IT60X0542811101000000123456).");
      return;
    }
    if (!amount || Number.isNaN(importo) || importo <= 0) {
      setErrore("Inserisci un importo maggiore di zero.");
      return;
    }

    setCaricamento(true);
    try {
      await api.post("/transactions/transfer", { IBAN: ibanPulito, amount: importo });
      setEsito({ iban: ibanPulito, importo });
      setIban("");
      setAmount("");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      const msg = err?.response?.data?.message;
      setErrore(
        Array.isArray(msg)
          ? msg.join(" ")
          : msg || err?.response?.data?.error || "Errore durante l'esecuzione del bonifico.",
      );
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <>
      <div className="welcome-header">
        <h1>Bonifico</h1>
        <p>Inserisci l'IBAN del destinatario e l'importo da inviare</p>
      </div>

      <div className="form-card form-card-wide">
        {esito ? (
          <div className="result-state" role="status">
            <CheckCircle2 size={56} className="result-icon" aria-hidden="true" />
            <h2>Bonifico eseguito!</h2>
            <p>
              Hai inviato {formattaValuta(esito.importo)} a <strong>{esito.iban}</strong>.
            </p>
            <div className="result-actions">
              <button type="button" className="btn-ghost" onClick={() => setEsito(null)}>
                Nuovo bonifico
              </button>
              <Link to="/home" className="btn-primary">
                Torna alla home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-stack" noValidate>
            {errore && (
              <div className="alert alert-error alert-with-icon" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{errore}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="iban">IBAN destinatario</label>
              <input
                id="iban"
                type="text"
                className="input-iban"
                autoComplete="off"
                spellCheck={false}
                placeholder="IT60X0542811101000000123456"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="importo">Importo (€)</label>
              <input
                id="importo"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={caricamento}>
              {caricamento && <span className="spinner" aria-hidden="true" />}
              {caricamento ? "Elaborazione in corso..." : "Conferma bonifico"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

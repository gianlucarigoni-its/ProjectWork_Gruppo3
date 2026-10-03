import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { api } from "../../utils/services/api";

export interface TopUpPayload {
  phoneNumber: string;
  operator: string;
  amount: number;
}

const OPERATORS = [
  { id: "TIM", name: "TIM" },
  { id: "Vodafone", name: "Vodafone" },
  { id: "WindTre", name: "WindTre" },
  { id: "Iliad", name: "Iliad" },
  { id: "Fastweb", name: "Fastweb" },
  { id: "ho.", name: "ho. Mobile" },
  { id: "Very", name: "Very Mobile" },
  { id: "PosteMobile", name: "PosteMobile" },
];

const AMOUNTS = [5, 10, 15, 20, 30, 50, 100];

const formattaValuta = (valore: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valore);

export default function RicaricaPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operator, setOperator] = useState("TIM");
  const [amount, setAmount] = useState<number>(10);

  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [esito, setEsito] = useState<{
    messaggio: string;
    nuovoSaldo?: number;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);

    if (!operator) {
      setErrore("Seleziona un operatore telefonico dal menu.");
      return;
    }

    if (!phoneNumber.trim()) {
      setErrore("Inserisci un numero di cellulare.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    const phoneRegex = /^(\+39)?3\d{8,9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrore("Inserisci un numero di cellulare valido (es. 3331234567).");
      return;
    }

    if (!amount || amount <= 0) {
      setErrore("Seleziona un importo per la ricarica.");
      return;
    }

    setCaricamento(true);

    const payload: TopUpPayload = {
      phoneNumber: cleanPhone,
      operator,
      amount,
    };

    try {
      const response = await api.post("/transactions/topup", payload);

      setEsito({
        messaggio: `Ricarica di ${amount}€ eseguita con successo sul numero ${cleanPhone} (${operator})!`,
        nuovoSaldo: response.data?.newBalance ?? response.data?.balance ?? response.data?.saldo,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setErrore(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Errore durante l'esecuzione della ricarica.",
      );
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <>
      <div className="welcome-header">
        <h1>Ricarica telefonica</h1>
        <p>Seleziona l'operatore e l'importo desiderato</p>
      </div>

      <div className="form-card form-card-wide">
        {esito ? (
          <div className="result-state" role="status">
            <CheckCircle2 size={56} className="result-icon" aria-hidden="true" />
            <h2>Operazione riuscita!</h2>
            <p>{esito.messaggio}</p>
            {esito.nuovoSaldo !== undefined && (
              <p className="result-balance">Nuovo saldo: {formattaValuta(esito.nuovoSaldo)}</p>
            )}
            <button type="button" className="btn-primary" onClick={() => setEsito(null)}>
              Nuova ricarica
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-stack" noValidate>
            {errore && (
              <div className="alert alert-error alert-with-icon" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{errore}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="operatorSelect">Operatore telefonico</label>
                <select
                  id="operatorSelect"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  {OPERATORS.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phoneInput">Numero di cellulare</label>
                <div className="input-icon">
                  <Smartphone size={16} aria-hidden="true" />
                  <input
                    id="phoneInput"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="es. 3331234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <span className="form-label" id="tagliLabel">
                Taglio ricarica
              </span>
              <div className="amount-grid" role="group" aria-labelledby="tagliLabel">
                {AMOUNTS.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    className="amount-chip"
                    aria-pressed={amount === amt}
                    onClick={() => setAmount(amt)}
                  >
                    {amt} €
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={caricamento}>
              {caricamento && <span className="spinner" aria-hidden="true" />}
              {caricamento ? "Elaborazione in corso..." : "Conferma ricarica"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

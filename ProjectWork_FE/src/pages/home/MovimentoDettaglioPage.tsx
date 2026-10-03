import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt } from "lucide-react";
import { api } from "../../utils/services/api";
import type { Transaction } from "../../types/transaction";
import { ETICHETTE_CATEGORIE } from "../../utils/categorie";

const formattaValuta = (valore: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valore);

export default function MovimentoDettaglioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movimento, setMovimento] = useState<Transaction | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  const caricaMovimento = useCallback(async () => {
    setCaricamento(true);
    setErrore(null);
    try {
      const response = await api.get<Transaction>(`/transactions/${id}`);
      setMovimento(response.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setErrore(
        err?.response?.status === 404
          ? "Movimento non trovato."
          : "Impossibile caricare il dettaglio del movimento.",
      );
    } finally {
      setCaricamento(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    caricaMovimento();
  }, [caricaMovimento]);

  const entrata = movimento?.type === "income";

  return (
    <>
      <Link to="/movimenti" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Torna ai movimenti
      </Link>

      <div className="welcome-header">
        <h1>Dettaglio movimento</h1>
      </div>

      {errore && (
        <div className="alert alert-error alert-with-action detail-card" role="alert">
          <span>{errore}</span>
          <button type="button" className="btn-ghost btn-sm" onClick={caricaMovimento}>
            Riprova
          </button>
        </div>
      )}

      {caricamento && (
        <div aria-busy="true" className="detail-card">
          <div className="skeleton profile-skeleton" />
          <div className="skeleton profile-skeleton" />
        </div>
      )}

      {!caricamento && movimento && (
        <div className="detail-card">
          <div className="detail-hero">
            <span className="detail-label">{entrata ? "Entrata" : "Uscita"}</span>
            <span className={`detail-amount ${entrata ? "positivo" : "negativo"}`}>
              {entrata ? "+" : "-"}
              {formattaValuta(Math.abs(movimento.amount))}
            </span>
            <span className="category-badge">
              {ETICHETTE_CATEGORIE[movimento.category] ?? movimento.category}
            </span>
          </div>

          <section className="info-card">
            <h3>
              <Receipt size={20} aria-hidden="true" /> Dettagli
            </h3>
            <dl className="info-list">
              <div className="info-row">
                <dt>Data e ora</dt>
                <dd>{new Date(movimento.date).toLocaleString("it-IT")}</dd>
              </div>
              <div className="info-row">
                <dt>Categoria</dt>
                <dd>{ETICHETTE_CATEGORIE[movimento.category] ?? movimento.category}</dd>
              </div>
              <div className="info-row">
                <dt>Tipologia</dt>
                <dd>{entrata ? "Entrata" : "Uscita"}</dd>
              </div>
              {movimento.id && (
                <div className="info-row">
                  <dt>ID movimento</dt>
                  <dd className="mono">{movimento.id}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      )}
    </>
  );
}

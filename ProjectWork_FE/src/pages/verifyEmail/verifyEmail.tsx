import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "../../utils/services/api";

interface VerifyResponse {
  success: boolean;
  message: string;
}

export const ConfermaPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Evita la doppia chiamata di React StrictMode in sviluppo
  const hasCalled = useRef<boolean>(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage("Token di verifica non valido o assente.");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const verify = async () => {
      try {
        const response = await api.get<VerifyResponse>("/auth/verify-email", {
          params: { token },
        });
        setSuccess(true);
        setMessage(response.data.message || "Email verificata con successo!");
      } catch (error: any) {
        setSuccess(false);
        const msg = error.response?.data?.message;
        setMessage(Array.isArray(msg) ? msg.join(" ") : msg || "Token non valido o scaduto.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

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

        <div className="auth-header">
          <h2>Verifica account</h2>
          <p className="auth-subtitle">Conferma la tua email per attivare il conto</p>
        </div>

        {loading ? (
          <div className="result-state" role="status" aria-busy="true">
            <span className="spinner spinner-lg" aria-hidden="true" />
            <p>Verifica in corso...</p>
          </div>
        ) : success ? (
          <div className="result-state" role="status">
            <CheckCircle2 size={56} className="result-icon" aria-hidden="true" />
            <p>{message}</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary btn-block"
            >
              Vai al login
            </button>
          </div>
        ) : (
          <div className="result-state" role="alert">
            <XCircle size={56} className="result-icon error" aria-hidden="true" />
            <p>{message}</p>
            <p className="auth-footer-text">
              Vuoi riprovare? <Link to="/register">Torna alla registrazione</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfermaPage;

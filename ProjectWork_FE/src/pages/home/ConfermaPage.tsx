import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/services/api";

import logoImg from '../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png';
import '../../styles/login.css';

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

  // Ref per tracciare se la chiamata è già stata eseguita
  const hasCalled = useRef<boolean>(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage("Token di verifica non valido o assente.");
      return;
    }

    // Se è già stata effettuata una chiamata (es. React Strict Mode in sviluppo), blocca la seconda
    if (hasCalled.current) return;
    hasCalled.current = true;

    const verify = async () => {
      try {
        const response = await api.get<VerifyResponse>(`/auth/verify-email?token=${token}`);
        
        setSuccess(true);
        setMessage(response.data.message || "Email verificata con successo!");
      } catch (error: any) {
        setSuccess(false);
        const errorMessage = error.response?.data?.message || "Token non valido o scaduto.";
        setMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
  <div className="auth-page">
    <div className="auth-card">
      {/* Brand Identity / Logo */}
      <div className="auth-brand">
        <img src={logoImg} alt="3Vision Logo" className="auth-logo-img" />
      </div>

      <div className="auth-header">
        <h2>Verifica Account</h2>
        <p className="auth-subtitle">Conferma la tua email per attivare il conto</p>
      </div>

      {loading ? (
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Verifica in corso...</p>
        </div>
      ) : success ? (
        <div className="auth-status-container">
          <div className="auth-alert success">{message}</div>
          <button onClick={() => navigate("/login")} className="auth-btn">
            Vai al Login
          </button>
        </div>
      ) : (
        <div className="auth-status-container">
          <div className="auth-alert error">{message}</div>
          <p className="auth-footer-text">
            Vuoi riprovare? <Link to="/register">Torna alla Registrazione</Link>
          </p>
        </div>
      )}
    </div>
  </div>
);
};

export default ConfermaPage;
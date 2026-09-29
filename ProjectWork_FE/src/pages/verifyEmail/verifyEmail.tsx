import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from '../../utils/services/api';

// Se usi TypeScript, definisci l'interfaccia della risposta
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

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage("Token di verifica non valido o assente.");
      return;
    }

    const verify = async () => {
      try {
        // Chiamata allineata alla tua istanza api (Axios)
        const response = await api.get<VerifyResponse>(`/auth/verify-email?token=${token}`);
        
        // Con Axios, se arrivi qui la chiamata ha restituito un codice 200/2xx
        setSuccess(true);
        setMessage(response.data.message || "Email verificata con successo!");
      } catch (error: any) {
        setSuccess(false);
        // Recupera il messaggio d'errore inviato dal backend, altrimenti usa un fallback
        const errorMessage = error.response?.data?.message || "Token non valido o scaduto.";
        setMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div style={{ padding: "2rem", border: "1px solid #ddd", borderRadius: "8px", textAlign: "center", maxWidth: "400px" }}>
        {loading ? (
          <h2>Verifica della mail in corso...</h2>
        ) : success ? (
          <>
            <h2 style={{ color: "green" }}>Email Confermata!</h2>
            <p>{message}</p>
            <button 
              onClick={() => navigate("/login")} 
              style={{ padding: "10px 20px", marginTop: "15px", cursor: "pointer" }}
            >
              Vai al Login
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: "red" }}>Verifica Fallita</h2>
            <p>{message}</p>
            <Link to="/register">Torna alla pagina di Registrazione</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfermaPage;
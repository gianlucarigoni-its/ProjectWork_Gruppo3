import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png'; 
import '../../styles/login.css'; // Riutilizziamo lo stesso file CSS!

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Stiamo convalidando i tuoi dati...');
  const navigate = useNavigate();

  useEffect(() => {
    const executeVerification = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token di verifica mancante o non valido.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'La tua email è stata confermata con successo.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Il token inserito è scaduto o non è valido.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Errore di connessione con il server. Riprova più tardi.');
      }
    };

    executeVerification();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo Identico al Login */}
        <div className="auth-brand">
          <img src={logoImg} alt="3Vision Logo" className="auth-logo-img" />
        </div>

        {/* CONTENUTO DINAMICO IN BASE ALLO STATO */}
        {status === 'loading' && (
          <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Se non hai uno spinner globale nel CSS, puoi usare questo div temporaneo */}
            <div className="spinner-loader" style={{
              width: '36px', height: '36px', border: '3.5px solid rgba(255,255,255,0.2)',
              borderTop: '3.5px solid #00a878', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }}></div>
            <h2>Verifica in corso</h2>
            <p className="auth-subtitle">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-form" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="auth-header">
              <h2 style={{ color: '#00a878' }}>✓ Conto Attivato!</h2>
              <p className="auth-subtitle" style={{ marginTop: '10px' }}>{message}</p>
              <p className="auth-subtitle" style={{ fontSize: '13px', opacity: 0.8 }}>
                Il tuo conto corrente 3Vision è pronto. Puoi iniziare a gestire le tue finanze.
              </p>
            </div>
            
            <button type="button" className="auth-btn" onClick={() => navigate('/login')}>
              Accedi al tuo conto
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="auth-form" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="auth-header">
              <h2 style={{ color: '#ef4444' }}>✕ Attivazione Fallita</h2>
            </div>
            
            <div className="auth-alert error" style={{ margin: '0' }}>{message}</div>
            
            <button type="button" className="auth-btn" style={{ backgroundColor: '#475569' }} onClick={() => navigate('/login')}>
              Torna al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

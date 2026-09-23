import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import logoImg from '../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png'; 
import '../../styles/login.css';

const TEMPO_LIMITE_SECONDI = 30;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [secondiRimasti, setSecondiRimasti] = useState(TEMPO_LIMITE_SECONDI);
  const navigate = useNavigate();
  const { login } = useAuth();
  const timerRef = useRef<number | null>(null);

  const resetForm = (messaggio?: string) => {
    setEmail('');
    setPassword('');
    setSecondiRimasti(TEMPO_LIMITE_SECONDI);
    if (messaggio) setErrore(messaggio);
  };

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSecondiRimasti((prev) => {
        if (prev <= 1) {
          resetForm('Tempo scaduto: hai impiegato troppo tempo per effettuare il login.');
          return TEMPO_LIMITE_SECONDI;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);
    setCaricamento(true);
    try {
      await login(email, password);
      localStorage.setItem('userEmail', email);

      if (timerRef.current) window.clearInterval(timerRef.current);
      navigate('/home');
    } catch (err: any) {
      const messaggio = err?.response?.data?.message || 'Credenziali non valide';
      setErrore(messaggio);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo Reale */}
        <div className="auth-brand">
          <img src={logoImg} alt="3Vision Logo" className="auth-logo-img" />
        </div>

        <div className="auth-header">
          <h2>Accedi al tuo conto</h2>
          <p className="auth-subtitle">Inserisci le tue credenziali per proseguire</p>
          <div className={`timer-badge ${secondiRimasti <= 10 ? 'warning' : ''}`}>
            ⏱ Tempo rimasto: <strong>{secondiRimasti}s</strong>
          </div>
        </div>

        {errore && <div className="auth-alert error">{errore}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="nome@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={caricamento}>
            {caricamento ? 'Accesso in corso...' : 'Accedi'}
          </button>

          <p className="auth-footer-text">
            Non hai ancora un conto? <Link to="/register">Apri un conto</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
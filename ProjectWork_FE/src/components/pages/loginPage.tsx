import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

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
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Login</h1>

        <p className="timer">Tempo rimasto: {secondiRimasti}s</p>

        {errore && <p className="errore">{errore}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Accesso in corso...' : 'Login'}
        </button>

        <p>
          Non hai un account? <Link to="/register">Registrati</Link>
        </p>
      </form>
    </div>
  );
}

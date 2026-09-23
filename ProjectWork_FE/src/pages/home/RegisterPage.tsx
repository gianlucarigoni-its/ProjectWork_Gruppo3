import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../utils/services/authService';
import logoImg from '../../../public/img/3Vision_DigitalBank_LogoRMBG_white.png';
import '../../styles/login.css';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [nomeTitolare, setNomeTitolare] = useState('');
  const [cognomeTitolare, setCognomeTitolare] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  const validaForm = (): string | null => {
    if (!email || !password || !confermaPassword || !nomeTitolare || !cognomeTitolare) {
      return 'Tutti i campi sono obbligatori.';
    }
    if (!REGEX_EMAIL.test(email)) {
      return 'Inserisci un indirizzo email valido.';
    }
    if (!REGEX_PASSWORD.test(password)) {
      return 'La password deve avere almeno 8 caratteri, una maiuscola e un simbolo.';
    }
    if (password !== confermaPassword) {
      return 'Le password non coincidono.';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);
    setMessaggio(null);

    const erroreValidazione = validaForm();
    if (erroreValidazione) {
      setErrore(erroreValidazione);
      return;
    }

    setCaricamento(true);
    try {
      const response = await authService.registra({
        email,
        password,
        confermaPassword,
        nomeTitolare,
        cognomeTitolare,
      });
      setMessaggio(response.data.message || 'Registrazione completata!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Errore durante la registrazione.';
      setErrore(msg);
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
          <h2>Crea il tuo account</h2>
          <p className="auth-subtitle">Inizia a gestire le tue finanze in modo semplice</p>
        </div>

        {errore && <div className="auth-alert error">{errore}</div>}
        {messaggio && <div className="auth-alert success">{messaggio}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                placeholder="Mario"
                value={nomeTitolare}
                onChange={(e) => setNomeTitolare(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cognome">Cognome</label>
              <input
                id="cognome"
                type="text"
                placeholder="Rossi"
                value={cognomeTitolare}
                onChange={(e) => setCognomeTitolare(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="mario.rossi@esempio.it"
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
              placeholder="Min. 8 car, 1 maiuscola e 1 simbolo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confermaPassword">Conferma Password</label>
            <input
              id="confermaPassword"
              type="password"
              placeholder="Ripeti la tua password"
              value={confermaPassword}
              onChange={(e) => setConfermaPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={caricamento}>
            {caricamento ? 'Registrazione in corso...' : 'Registrati'}
          </button>

          <p className="auth-footer-text">
            Hai già un account? <Link to="/login">Accedi</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
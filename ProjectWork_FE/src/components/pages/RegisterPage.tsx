import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../utils/services/authService';

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
      setMessaggio(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Errore durante la registrazione.';
      setErrore(msg);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Registrazione</h1>

        {errore && <p className="errore">{errore}</p>}
        {messaggio && <p className="successo">{messaggio}</p>}

        <label>
          Nome
          <input value={nomeTitolare} onChange={(e) => setNomeTitolare(e.target.value)} required />
        </label>

        <label>
          Cognome
          <input value={cognomeTitolare} onChange={(e) => setCognomeTitolare(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <label>
          Conferma Password
          <input
            type="password"
            value={confermaPassword}
            onChange={(e) => setConfermaPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Registrazione in corso...' : 'Registrati'}
        </button>

        <p>
          Hai gia' un account? <Link to="/login">Accedi</Link>
        </p>
      </form>
    </div>
  );
}

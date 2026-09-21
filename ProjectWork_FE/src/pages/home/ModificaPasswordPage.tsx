import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/services/api';

const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ModificaPasswordPage() {
  const [passwordAttuale, setPasswordAttuale] = useState('');
  const [nuovaPassword, setNuovaPassword] = useState('');
  const [confermaNuovaPassword, setConfermaNuovaPassword] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);

  const valida = (): string | null => {
    if (!passwordAttuale || !nuovaPassword || !confermaNuovaPassword) {
      return 'Tutti i campi sono obbligatori.';
    }
    if (!REGEX_PASSWORD.test(nuovaPassword)) {
      return 'La nuova password deve avere almeno 8 caratteri, una maiuscola e un simbolo.';
    }
    if (nuovaPassword !== confermaNuovaPassword) {
      return 'Le nuove password non coincidono.';
    }
    if (nuovaPassword === passwordAttuale) {
      return 'La nuova password deve essere diversa da quella attuale.';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);
    setMessaggio(null);

    const erroreValidazione = valida();
    if (erroreValidazione) {
      setErrore(erroreValidazione);
      return;
    }

    setCaricamento(true);
    try {
      const response = await api.post<{ message: string }>('/account/modifica-password', {
        passwordAttuale,
        nuovaPassword,
        confermaNuovaPassword,
      });
      setMessaggio(response.data.message || 'Password modificata con successo.');
      setPasswordAttuale('');
      setNuovaPassword('');
      setConfermaNuovaPassword('');
    } catch (err: any) {
      setErrore(err?.response?.data?.message || 'Errore durante la modifica della password.');
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="pagina">
      <Link to="/home">&larr; Torna alla Home</Link>
      <div className="auth-page" style={{ minHeight: 'auto', paddingTop: 24 }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <h1>Modifica password</h1>

          {errore && <p className="errore">{errore}</p>}
          {messaggio && <p className="successo">{messaggio}</p>}

          <label>
            Password attuale
            <input
              type="password"
              value={passwordAttuale}
              onChange={(e) => setPasswordAttuale(e.target.value)}
            />
          </label>

          <label>
            Nuova password
            <input
              type="password"
              value={nuovaPassword}
              onChange={(e) => setNuovaPassword(e.target.value)}
            />
          </label>

          <label>
            Conferma nuova password
            <input
              type="password"
              value={confermaNuovaPassword}
              onChange={(e) => setConfermaNuovaPassword(e.target.value)}
            />
          </label>

          <button type="submit" disabled={caricamento}>
            {caricamento ? 'Salvataggio...' : 'Modifica password'}
          </button>
        </form>
      </div>
    </div>
  );
}

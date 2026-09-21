import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../utils/services/authService';

export default function ConfermaPage() {
  const { token } = useParams<{ token: string }>();
  const [messaggio, setMessaggio] = useState('Conferma in corso...');
  const [errore, setErrore] = useState(false);
  const giaEseguito = useRef(false);

  useEffect(() => {
    // evita la doppia chiamata di StrictMode
    if (giaEseguito.current || !token) return;
    giaEseguito.current = true;

    authService
      .confermaRegistrazione(token)
      .then((res) => setMessaggio(res.data.message || 'Registrazione confermata!'))
      .catch((err) => {
        setErrore(true);
        setMessaggio(err?.response?.data?.message || 'Link di conferma non valido o scaduto.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h1>Conferma registrazione</h1>
        <p className={errore ? 'errore' : 'successo'}>{messaggio}</p>
        <Link to="/login">Vai al login</Link>
      </div>
    </div>
  );
}

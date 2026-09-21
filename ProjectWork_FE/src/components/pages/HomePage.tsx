import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/services/api';
import { useAuth } from '../../context/authContext';
import type { HomeData } from '../../types';

export default function HomePage() {
  const [dati, setDati] = useState<HomeData | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const caricaDati = async () => {
      try {
        const response = await api.get<HomeData>('/account/home');
        setDati(response.data);
      } catch {
        setErrore('Impossibile caricare i dati del conto.');
      } finally {
        setCaricamento(false);
      }
    };
    caricaDati();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (caricamento) return <div className="pagina">Caricamento...</div>;
  if (errore) return <div className="pagina errore">{errore}</div>;
  if (!dati) return null;

  return (
    <div className="pagina home-page">
      <header className="home-header">
        <h1>{dati.benvenuto}</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <nav className="ricerca-nav">
        <Link to="/ricerca/1">Ultimi movimenti</Link>
        <Link to="/ricerca/2">Per categoria</Link>
        <Link to="/ricerca/3">Tra due date</Link>
        <Link to="/modifica-password">Modifica password</Link>
      </nav>

      <div className="saldo-card">
        <span>Saldo attuale</span>
        <strong>{dati.saldo.toFixed(2)} EUR</strong>
      </div>

      <h2>Ultimi movimenti</h2>
      <table className="movimenti-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrizione</th>
            <th>Importo</th>
            <th>Saldo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dati.ultimiMovimenti.slice(0, 5).map((m) => {
            const movId = m._id ?? m.id;
            return (
              <tr key={movId}>
                <td>{new Date(m.data).toLocaleDateString('it-IT')}</td>
                <td>{m.descrizioneEstesa}</td>
                <td className={m.importo >= 0 ? 'importo-positivo' : 'importo-negativo'}>
                  {m.importo.toFixed(2)} EUR
                </td>
                <td>{m.saldo.toFixed(2)} EUR</td>
                <td>
                  <Link to={`/movimento/${movId}`}>Dettagli</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

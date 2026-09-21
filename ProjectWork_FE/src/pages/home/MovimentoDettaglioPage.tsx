import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../utils/services/api';
import type { MovimentoDettaglio } from '../../types';

export default function MovimentoDettaglioPage() {
  const { id } = useParams<{ id: string }>();
  const [movimento, setMovimento] = useState<MovimentoDettaglio | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const caricaMovimento = async () => {
      try {
        const response = await api.get<MovimentoDettaglio>(`/account/movimenti/${id}`);
        setMovimento(response.data);
      } catch {
        setErrore('Impossibile caricare il dettaglio del movimento.');
      } finally {
        setCaricamento(false);
      }
    };
    caricaMovimento();
  }, [id]);

  if (caricamento) return <div className="pagina">Caricamento...</div>;
  if (errore) return <div className="pagina errore">{errore}</div>;
  if (!movimento) return null;

  return (
    <div className="pagina dettaglio-page">
      <Link to="/home">&larr; Torna alla Home</Link>
      <h1>Dettaglio Movimento</h1>

      <dl className="dettaglio-lista">
        <dt>Data</dt>
        <dd>{new Date(movimento.data).toLocaleString('it-IT')}</dd>

        <dt>Descrizione</dt>
        <dd>{movimento.descrizioneEstesa}</dd>

        <dt>Categoria</dt>
        <dd>{movimento.categoriaMovimentoId?.nomeCategoria ?? '-'}</dd>

        <dt>Tipologia</dt>
        <dd>{movimento.categoriaMovimentoId?.tipologia ?? '-'}</dd>

        <dt>Importo</dt>
        <dd>{movimento.importo.toFixed(2)} EUR</dd>

        <dt>Saldo dopo il movimento</dt>
        <dd>{movimento.saldo.toFixed(2)} EUR</dd>
      </dl>
    </div>
  );
}

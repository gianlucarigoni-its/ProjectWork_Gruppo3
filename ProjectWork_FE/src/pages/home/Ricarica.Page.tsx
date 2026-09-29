import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { api } from '../../utils/services/api';

export interface TopUpPayload {
  phoneNumber: string;
  operator: string;
  amount: number;
}

const OPERATORS = [
  { id: 'TIM', name: 'TIM' },
  { id: 'Vodafone', name: 'Vodafone' },
  { id: 'WindTre', name: 'WindTre' },
  { id: 'Iliad', name: 'Iliad' },
  { id: 'Fastweb', name: 'Fastweb' },
  { id: 'ho.', name: 'ho. Mobile' },
  { id: 'Very', name: 'Very Mobile' },
  { id: 'PosteMobile', name: 'PosteMobile' },
];

const AMOUNTS = [5, 10, 15, 20, 30, 50, 100];

const formattaValuta = (valore: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(valore);

export default function RicaricaPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState('TIM');
  const [amount, setAmount] = useState<number>(10);
  
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [esito, setEsito] = useState<{
    messaggio: string;
    nuovoSaldo?: number;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore(null);

    if (!operator) {
      setErrore('Seleziona un operatore telefonico dal menu.');
      return;
    }

    if (!phoneNumber.trim()) {
      setErrore('Inserisci un numero di cellulare.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^(\+39)?3\d{8,9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrore('Inserisci un numero di cellulare valido (es. 3331234567).');
      return;
    }

    if (!amount || amount <= 0) {
      setErrore('Seleziona un importo per la ricarica.');
      return;
    }

    setCaricamento(true);

    const payload: TopUpPayload = {
      phoneNumber: cleanPhone,
      operator,
      amount,
    };

    try {
      const response = await api.post('/transactions/topup', payload);

      setEsito({
        messaggio: `Ricarica di ${amount}€ eseguita con successo sul numero ${cleanPhone} (${operator})!`,
        nuovoSaldo: response.data?.newBalance ?? response.data?.balance ?? response.data?.saldo,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      setErrore(
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        'Errore durante l\'esecuzione della ricarica.'
      );
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="dashboard-body">
      <div className="welcome-header">
        <h1>Ricarica Telefonica</h1>
        <p>Seleziona l'operatore e l'importo desiderato</p>
      </div>

      <div className="ricerca-card" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
        {esito ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle2 size={56} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: '#f3f4f6', marginBottom: '0.5rem' }}>Operazione Riuscita!</h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '1rem' }}>{esito.messaggio}</p>
            {esito.nuovoSaldo !== undefined && (
              <p className="balance-amount" style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>
                Nuovo Saldo: <strong>{formattaValuta(esito.nuovoSaldo)}</strong>
              </p>
            )}
            <button className="btn-primary" onClick={() => setEsito(null)}>
              Nuova Ricarica
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errore && (
              <div className="ricerca-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={18} />
                <span>{errore}</span>
              </div>
            )}

            {/* Grid 2 Colonne: Operatore + Numero Telefono */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label htmlFor="operatorSelect" style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block', fontSize: '0.85rem', color: '#9ca3af' }}>
                  1. OPERATORE TELEFONICO
                </label>
                <select
                  id="operatorSelect"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    backgroundColor: '#1f2937',
                    color: '#f3f4f6',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {OPERATORS.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="phoneInput" style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block', fontSize: '0.85rem', color: '#9ca3af' }}>
                  2. NUMERO DI CELLULARE
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="phoneInput"
                    type="tel"
                    placeholder="es. 3331234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #374151',
                      backgroundColor: '#1f2937',
                      color: '#f3f4f6',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Smartphone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                </div>
              </div>
            </div>

            {/* Importi Disposti in Orizzontale */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 600, marginBottom: '0.6rem', display: 'block', fontSize: '0.85rem', color: '#9ca3af' }}>
                3. TAGLIO RICARICA
              </label>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '0.3rem' }}>
                {AMOUNTS.map((amt) => {
                  const selected = amount === amt;
                  return (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAmount(amt)}
                      style={{
                        flex: '1 1 0px',
                        minWidth: '55px',
                        padding: '0.75rem 0.2rem',
                        borderRadius: '8px',
                        border: selected ? '2px solid #ff6b00' : '1px solid #374151',
                        backgroundColor: selected ? 'rgba(255, 107, 0, 0.2)' : '#1f2937',
                        color: selected ? '#ff6b00' : '#f3f4f6',
                        fontWeight: selected ? 'bold' : 'normal',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {amt} €
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pulsante di Conferma */}
            <button
              type="submit"
              className="btn-primary"
              disabled={caricamento}
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', cursor: 'pointer' }}
            >
              {caricamento ? 'Elaborazione in corso...' : 'Conferma Ricarica'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
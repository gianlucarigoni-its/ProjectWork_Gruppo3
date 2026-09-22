import React, { useState } from 'react';
import '../../styles/_ricarica.scss';

export interface RicaricaPayload {
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

export const RicaricaForm: React.FC<{
  onSubmit: (data: RicaricaPayload) => Promise<void>;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!operator) {
      setError('Seleziona un operatore telefonico.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Inserisci un numero di cellulare.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^(\+39)?3\d{8,9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Inserisci un numero di cellulare valido (es. 3331234567).');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Seleziona un taglio di ricarica.');
      return;
    }

    onSubmit({
      phoneNumber: cleanPhone,
      operator,
      amount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="ricarica-form">
      {/* 1. Selezione Operatore */}
      <div className="form-group">
        <label className="form-label">1. Seleziona Operatore</label>
        <div className="operator-grid">
          {OPERATORS.map((op) => (
            <button
              type="button"
              key={op.id}
              className={`operator-card ${operator === op.id ? 'active' : ''}`}
              onClick={() => setOperator(op.id)}
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Numero di Telefono */}
      <div className="form-group">
        <label htmlFor="phoneNumber" className="form-label">
          2. Numero di Cellulare
        </label>
        <input
          id="phoneNumber"
          type="tel"
          placeholder="Inserire numero di telefono..."
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="form-input"
          maxLength={15}
        />
      </div>

      {/* 3. Taglio di Ricarica */}
      <div className="form-group">
        <label className="form-label">3. Importo Ricarica</label>
        <div className="amount-grid">
          {AMOUNTS.map((amt) => (
            <button
              type="button"
              key={amt}
              className={`amount-card ${amount === amt ? 'active' : ''}`}
              onClick={() => setAmount(amt)}
            >
              {amt} €
            </button>
          ))}
        </div>
      </div>

      {/* Errore di validazione locale */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Pulsante Invio */}
      <button type="submit" disabled={isLoading} className="btn-submit">
        {isLoading ? 'Elaborazione in corso...' : 'Conferma Ricarica'}
      </button>
    </form>
  );
};

export default function RicaricaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    newBalance?: number;
  } | null>(null);

  const handleRicaricaSubmit = async (payload: RicaricaPayload) => {
    setIsLoading(true);
    setResultMessage(null);

    try {
      const response = await fetch('/api/operations/ricarica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultMessage({
          type: 'success',
          text: `Ricarica di ${payload.amount}€ eseguita con successo su ${payload.phoneNumber}!`,
          newBalance: data.newBalance,
        });
      } else {
        setResultMessage({
          type: 'error',
          text: data.message || 'Si è verificato un errore durante la ricarica.',
        });
      }
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: 'Errore di connessione con il server. Riprova più tardi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ricarica-page-container">
      <div className="ricarica-card-wrapper">
        <header className="ricarica-header">
          <h1>Ricarica Telefonica</h1>
          <p>Ricarica il tuo cellulare</p>
        </header>

        {resultMessage?.type === 'success' ? (
          <div className="success-banner">
            <div className="icon-success">✓</div>
            <h3>Ricarica Completata!</h3>
            <p>{resultMessage.text}</p>
            {resultMessage.newBalance !== undefined && (
              <p className="balance-info">
                Nuovo Saldo: <strong>{resultMessage.newBalance.toFixed(2)} €</strong>
              </p>
            )}
            <button className="btn-secondary" onClick={() => setResultMessage(null)}>
              Effettua un'altra ricarica
            </button>
          </div>
        ) : (
          <>
            {resultMessage?.type === 'error' && (
              <div className="alert alert-error">{resultMessage.text}</div>
            )}
            <RicaricaForm onSubmit={handleRicaricaSubmit} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
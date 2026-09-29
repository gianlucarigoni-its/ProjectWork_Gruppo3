import { api } from '../../utils/services/api';
import React, { useState } from 'react';

interface BonificoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback
}

// Valori presi da styles/_variables.scss
const css = `
.bonifico-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  background: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(4px);
}
.bonifico-card {
  width: 100%; max-width: 440px; box-sizing: border-box;
  padding: 1.75rem;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  color: #f3f4f6;
  font-family: inherit;
}
.bonifico-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.bonifico-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: #ffffff; }
.bonifico-close {
  background: transparent; border: none; cursor: pointer;
  color: #9ca3af; font-size: 1.1rem; line-height: 1;
  padding: 0.25rem; border-radius: 6px;
  transition: all 0.2s ease;
}
.bonifico-close:hover { color: #ffffff; background: #21262d; }
.bonifico-error {
  margin-bottom: 1rem; padding: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: 6px;
  color: #f87171; font-size: 0.9rem;
}
.bonifico-form { display: flex; flex-direction: column; gap: 1.1rem; }
.bonifico-label {
  display: block; margin-bottom: 0.4rem;
  font-size: 0.85rem; font-weight: 500; color: #d1d5db;
}
.bonifico-input {
  width: 100%; box-sizing: border-box;
  padding: 0.75rem;
  background: #21262d;
  border: 1px solid #363b42;
  border-radius: 10px;
  color: #ffffff; font-size: 0.95rem; font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}
.bonifico-input::placeholder { color: #9ca3af; }
.bonifico-input:focus { border-color: #10b981; }
.bonifico-iban { font-family: monospace; text-transform: uppercase; }
.bonifico-submit {
  width: 100%; padding: 0.85rem;
  background: #10b981; color: #ffffff;
  border: none; border-radius: 10px;
  font-size: 0.95rem; font-weight: 600; font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bonifico-submit:hover:not(:disabled) { background: #059669; transform: translateY(-2px); }
.bonifico-submit:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const BonificoModal: React.FC<BonificoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipientIBAN, setRecipientIBAN] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/transactions/transfer', {
        IBAN: recipientIBAN.replace(/\s/g, '').toUpperCase(),
        amount: Number(amount),
      });

      alert('Bonifico eseguito con successo!');

      // Reset
      setRecipientIBAN('');
      setAmount('');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bonifico-overlay">
      <style>{css}</style>
      <div className="bonifico-card">
        <div className="bonifico-header">
          <h3 className="bonifico-title">Nuovo Bonifico</h3>
          <button type="button" onClick={onClose} className="bonifico-close" aria-label="Chiudi">
            ✕
          </button>
        </div>

        {error && <div className="bonifico-error">{error}</div>}

        <form onSubmit={handleSubmit} className="bonifico-form">
          <div>
            <label className="bonifico-label">IBAN Destinatario</label>
            <input
              type="text"
              required
              placeholder="IT60X0542811101000000654321"
              value={recipientIBAN}
              onChange={(e) => setRecipientIBAN(e.target.value)}
              className="bonifico-input bonifico-iban"
            />
          </div>

          <div>
            <label className="bonifico-label">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bonifico-input"
            />
          </div>

          <button type="submit" disabled={loading} className="bonifico-submit">
            {loading ? 'Elaborazione...' : 'Conferma Bonifico'}
          </button>
        </form>
      </div>
    </div>
  );
};

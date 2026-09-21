import React, { useState } from 'react';

interface BonificoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback
}

export const BonificoModal: React.FC<BonificoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipientIBAN, setRecipientIBAN] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/operations/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientIBAN: recipientIBAN.toUpperCase().trim(),
          amount: Number(amount),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Errore durante l'invio del bonifico");
      }

      alert('Bonifico eseguito con successo!');
      
      // Reset
      setRecipientIBAN('');
      setAmount('');
      setDescription('');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header Modale */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">Nuovo Bonifico</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Banner Errore */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Form Bonifico */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">IBAN Destinatario</label>
            <input
              type="text"
              required
              placeholder="IT60X0542811101000000654321"
              value={recipientIBAN}
              onChange={(e) => setRecipientIBAN(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 font-mono uppercase focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Causale (Opzionale)</label>
            <textarea
              rows={2}
              placeholder="Es. Quota cena"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Elaborazione...' : 'Conferma Bonifico'}
          </button>
        </form>
      </div>
    </div>
  );
};
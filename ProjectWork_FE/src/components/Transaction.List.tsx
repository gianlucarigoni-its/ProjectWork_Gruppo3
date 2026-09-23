import React, { useState, useEffect, useCallback } from "react";
import { TransactionCategory } from "../types/transaction";
import type { Transaction, TransactionFilterParams } from "../types/transaction";
import { getTransactions } from "../utils/services/Transaction.service";
import "../styles/_transictionList.scss";

interface TransactionsListProps {
  accountId: string;
  authToken?: string;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  accountId,
  authToken,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<TransactionFilterParams>({
    limit: 10,
    category: undefined,
    from: "",
    to: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeFilters: TransactionFilterParams = {
        ...(filters.limit && { limit: Number(filters.limit) }),
        ...(filters.category && { category: filters.category }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      };

      const data = await getTransactions(accountId, activeFilters, authToken);
      setTransactions(data.transactions);
      setBalance(data.balance);
    } catch (err: any) {
      setError(err.message || "Impossibile recuperare le transazioni");
    } finally {
      setLoading(false);
    }
  }, [accountId, filters, authToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  return (
    <div className="transactions-container">
      <div className="transactions-content">
        <h2 className="page-title">Movimenti Conto</h2>

        {/* Saldo finale visibile in alto */}
        {balance !== undefined && (
          <div className="balance-card">
            <div className="balance-label">Saldo Disponibile</div>
            <div className="balance-amount">€ {balance.toFixed(2)}</div>
          </div>
        )}

        {/* Card Filtri */}
        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Ultimi Movimenti</label>
              <input
                type="number"
                name="limit"
                min="1"
                value={filters.limit || ""}
                onChange={handleInputChange}
                placeholder="Es. 10"
              />
            </div>

            <div className="filter-group">
              <label>Categoria</label>
              <select
                name="category"
                value={filters.category || ""}
                onChange={handleInputChange}
              >
                <option value="">Tutte le categorie</option>
                {Object.values(TransactionCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Da (from)</label>
              <input
                type="date"
                name="from"
                value={filters.from || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="filter-group">
              <label>A (to)</label>
              <input
                type="date"
                name="to"
                value={filters.to || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="filters-actions">
            <button
              className="btn-apply"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Filtro in corso..." : "Applica Filtri"}
            </button>
          </div>
        </div>

        {/* Gestione errori */}
        {error && <div className="error-message">{error}</div>}

        {/* Tabella Movimenti */}
        <div className="table-card">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Descrizione</th>
                <th>Tipo</th>
                <th>Importo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Nessun movimento trovato.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString("it-IT")}</td>
                    <td>{tx.category}</td>
                    <td>{tx.description}</td>
                    <td>{tx.type}</td>
                    <td
                      className={
                        tx.type === "income" ? "amount-income" : "amount-outcome"
                      }
                    >
                      {tx.type === "income" ? "+" : "-"} € {Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
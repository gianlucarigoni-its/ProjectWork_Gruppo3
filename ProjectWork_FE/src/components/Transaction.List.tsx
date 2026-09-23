import React, { useState, useEffect, useCallback } from "react";
import { TransactionCategory } from "../types/transaction";
import type { Transaction, TransactionFilterParams } from "../types/transaction";
import {
  getTransactions,
} from "../utils/services/Transaction.service";

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

  // Stato filtri di ricerca
  const [filters, setFilters] = useState<TransactionFilterParams>({
    limit: 10,
    category: undefined,
    from: "",
    to: "",
  }); 

  // Funzione per caricare i dati dal backend
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

  // Gestore cambio input del form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };
  
  return(
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "900px" }}>
      <h2>Movimenti Conto</h2>

      {/* Sezione Filtri */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
          background: "#f8f9fa",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>
            Limite (limit)
          </label>
          <input
            type="number"
            name="limit"
            min="1"
            value={filters.limit || ""}
            onChange={handleInputChange}
            placeholder="Es. 10"
            style={{ width: "100%", padding: "6px", marginTop: "4px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>
            Categoria
          </label>
          <select
            name="category"
            value={filters.category || ""}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "6px", marginTop: "4px" }}
          >
            <option value="">Tutte le categorie</option>
            {Object.values(TransactionCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>
            Da (from)
          </label>
          <input
            type="date"
            name="from"
            value={filters.from || ""}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "6px", marginTop: "4px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>
            A (to)
          </label>
          <input
            type="date"
            name="to"
            value={filters.to || ""}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "6px", marginTop: "4px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", gridColumn: "1 / -1" }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {loading ? "Filtro in corso..." : "Applica Filtri"}
          </button>
        </div>
      </div>

      {/* Saldo finale (Visibile solo quando 'balance' è restituito dal backend) */}
      {balance !== undefined && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#e3f2fd",
            borderRadius: "6px",
            marginBottom: "16px",
            fontWeight: "bold",
          }}
        >
          Saldo finale: € {balance.toFixed(2)}
        </div>
      )}

      {/* Gestione errori */}
      {error && (
        <div style={{ color: "red", padding: "8px 0", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      {/* Tabella dei movimenti */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
        border={1}
        cellPadding={10}
      >
        <thead>
          <tr style={{ backgroundColor: "#e9ecef" }}>
            <th>Data</th>
            <th>Descrizione</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Importo</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && !loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                Nessun movimento trovato per i filtri selezionati.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date).toLocaleDateString("it-IT")}</td>
                <td>{tx.description}</td>
                <td>{tx.category}</td>
                <td>{tx.type}</td>
                <td
                  style={{
                    color: tx.type === "income" ? "#2e7d32" : "#c62828",
                    fontWeight: "bold",
                  }}
                >
                  {tx.type === "income" ? "+" : "-"} € {Math.abs(tx.amount).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
import type { TransactionFilterParams , TransactionResponse } from "../../types/transaction";

const BASE_URL = "/api/accounts";

export async function getTransactions(
    accountId: string,
    filters: TransactionFilterParams ={},
    token? : string
) : Promise<TransactionResponse> {
    const queryParams = new URLSearchParams();

    if(filters.limit) queryParams.append("limit", filters.limit.toString());
    if(filters.category) queryParams.append("category", filters.category);
    if(filters.from) queryParams.append("from", filters.from);
    if(filters.to) queryParams.append("to", filters.to);

    const response = await fetch(
    `${BASE_URL}/${accountId}/transactions?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
    );

    if(!response.ok){
        throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
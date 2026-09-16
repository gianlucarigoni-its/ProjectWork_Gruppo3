import { api } from './api';
import type { 
  Account, 
  Transition, 
  RegisterDTO, 
  RicaricaDTO, 
  BonificoDTO, 
  TransitionCategory 
} from '../../types';

export const bankService = {
  // Profilo 
  getAccountProfile: () => api.get<Account>('/accounts/profile'),
  
  // Dashboard: recupera l'account corrente e le ultime transazioni
  getDashboardData: async () => {
    const accountRes = await api.get<Account>('/accounts/me');
    const transitionsRes = await api.get<Transition[]>(`/transitions?accountId=${accountRes.data.id}&_limit=5&_sort=date&_order=desc`);
    return {
      account: accountRes.data,
      recentTransitions: transitionsRes.data,
    };
  },

  // Dettaglio Singola Transazione
  getTransitionById: (id: string) => api.get<Transition>(`/transitions/${id}`),

  // Ricerche Transazioni
  getRecentTransitions: (limit: number) => 
    api.get<Transition[]>(`/transitions?_limit=${limit}&_sort=date&_order=desc`),

  getTransitionsByCategory: (category: TransitionCategory, limit: number) => 
    api.get<Transition[]>(`/transitions?category=${category}&_limit=${limit}&_sort=date&_order=desc`),

  getTransitionsByDateRange: (startDate: string, endDate: string, limit: number) => 
    api.get<Transition[]>(`/transitions?date_gte=${startDate}&date_lte=${endDate}&_limit=${limit}&_sort=date&_order=desc`),

  // Operazioni
  executeRicarica: (data: RicaricaDTO) => api.post<{ transition: Transition; newBalance: number }>('/operations/recharge', data),
  executeBonifico: (data: BonificoDTO) => api.post<{ transition: Transition; newBalance: number }>('/operations/transfer', data),
};
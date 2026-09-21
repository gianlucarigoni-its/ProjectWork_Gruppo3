import { api } from './api';
import type { RegisterDTO } from '../../types';

export const authService = {
  registra: (data: RegisterDTO) =>
    api.post<{ message: string }>('/auth/registra', {
      email: data.email,
      password: data.password,
      confermaPassword: data.confermaPassword,
      nomeTitolare: data.nomeTitolare,
      cognomeTitolare: data.cognomeTitolare,
    }),

  confermaRegistrazione: (token: string) =>
    api.get<{ message: string }>(`/auth/conferma/${token}`),
};

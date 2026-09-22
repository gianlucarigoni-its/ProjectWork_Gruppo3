import { api } from './api';
import type { RegisterDTO } from '../../types';

export const authService = {
  registra: (data: RegisterDTO) =>
    api.post<{ message: string }>('/auth/register', {
      username: data.email,
      password: data.password,
      confermaPassword: data.confermaPassword,
      firstName: data.nomeTitolare,
      lastName: data.cognomeTitolare,
    }),

  confermaRegistrazione: (token: string) =>
    api.get<{ message: string }>(`/auth/conferma/${token}`),
};

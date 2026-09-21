import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, tokenService } from '../utils/services/api';
import type { LoginResponse } from '../types';

interface Utente {
  nomeTitolare: string;
  cognomeTitolare: string;
}

interface AuthContextType {
  currentUser: Utente | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Utente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenService.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/account/home');
        const benvenuto: string = response.data.benvenuto;
        const nomeCompleto = benvenuto.replace('Benvenuto ', '').split(' ');
        setCurrentUser({
          nomeTitolare: nomeCompleto[0] || '',
          cognomeTitolare: nomeCompleto.slice(1).join(' ') || '',
        });
      } catch {
        tokenService.clearToken();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const { token, nomeTitolare, cognomeTitolare } = response.data;

    tokenService.setToken(token);
    setCurrentUser({ nomeTitolare, cognomeTitolare });
  };

  const logout = () => {
    tokenService.clearToken();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
}

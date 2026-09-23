import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, tokenService } from '../utils/services/api';
import type { LoginResponse } from '../types';

interface Utente {
  nomeTitolare: string;
  cognomeTitolare: string;
  accountId?: string;
}

interface AuthContextType {
  currentUser: Utente | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Utente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // In fase di test/sviluppo: se c'è un token o un accountId salvato, l'utente è considerato autenticato
  const isAuthenticated = !!currentUser || !!tokenService.getToken() || !!localStorage.getItem('accountId');

  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenService.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/account/home');
        const benvenuto: string = response.data.benvenuto || '';
        const nomeCompleto = benvenuto.replace('Benvenuto ', '').split(' ');
        setCurrentUser({
          nomeTitolare: nomeCompleto[0] || '',
          cognomeTitolare: nomeCompleto.slice(1).join(' ') || '',
        });
      } catch {
        // Durante i test non resettiamo il token in caso di errori minori
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (identifier: string, password: string): Promise<void> => {
    // Invia sia email che username con lo stesso valore per evitare mismatch con il backend DTO
    const response = await api.post<LoginResponse>('/auth/login', { 
      email: identifier,
      username: identifier, 
      password 
    });
    
    const { token, nomeTitolare, cognomeTitolare, accountId } = response.data as any;

    if (token) tokenService.setToken(token);
    
    // IMPORTANTE: Salva l'accountId nel localStorage per permettere alla HomePage di recuperare il conto corretto
    if (accountId) {
      localStorage.setItem('accountId', accountId);
    }

    setCurrentUser({ nomeTitolare, cognomeTitolare, accountId });
  };

  const logout = () => {
    tokenService.clearToken();
    localStorage.removeItem('accountId');
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
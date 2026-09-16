import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, tokenService } from '../utils/services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  picture: string;
  fullName: string;
  role:'admin' | 'user';
  
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  fetchUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!currentUser;
  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/users/me');
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      tokenService.clearTokens();
      setCurrentUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/login',
      { username, password },
      {
        headers: {
        'Content-Type': 'application/json',
        },
      }
    );

    const { user, accessToken, refreshToken } = response.data;

    tokenService.setTokens(accessToken, refreshToken);

    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    tokenService.clearTokens();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
}
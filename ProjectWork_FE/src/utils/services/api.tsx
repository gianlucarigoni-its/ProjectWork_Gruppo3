import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const tokenService = {
  getToken: (): string | null => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),
};

api.interceptors.request.use((config) => {
  const token = tokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.clearToken();
    }
    return Promise.reject(error);
  }
);

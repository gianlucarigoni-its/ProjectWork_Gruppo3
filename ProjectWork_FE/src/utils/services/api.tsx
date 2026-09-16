import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const tokenService = {
  getAccessToken: (): string | null => localStorage.getItem('access_token'),
  getRefreshToken: (): string | null => localStorage.getItem('refresh_token'),
  setTokens: (accessToken: string, refreshToken?: string) => {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};


api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Se l'errore è 401 e la richiesta non è già stata ritentata
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) throw new Error('Nessun refresh token presente');

        const res = await axios.post('http://localhost:3000/api/refresh', {
          refresh_token: refreshToken,
          refreshToken: refreshToken,
        });

        const newAccessToken = res.data.access_token || res.data.accessToken;
        const newRefreshToken = res.data.refresh_token || res.data.newRefreshToken;

        if (!newAccessToken) {
          throw new Error('Access token non ricevuto dal server');
        }

        tokenService.setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Sessione scaduta o refresh fallito:', refreshError);
        tokenService.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
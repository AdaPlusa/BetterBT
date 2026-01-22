import axios from 'axios';

// Tworzymy instancję axios z adresem Twojego serwera
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatyczne dodawanie Tokena do każdego zapytania (Interceptor)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

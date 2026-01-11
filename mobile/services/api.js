import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  headers: { 'Content-Type': 'application/json' }
});

// Przed każdym zapytaniem sprawdź IP i Token
api.interceptors.request.use(async (config) => {
  // 1. Pobierz IP zapisane w ustawieniach
  const serverIp = await AsyncStorage.getItem('serverIp');
  // Domyślny fallback: Jeśli nie ma ustawionego IP, użyj specjalnego adresu emulatora (10.0.2.2)
  // 10.0.2.2 w emulatorze Androida oznacza "localhost komputera"
  const baseURL = serverIp ? `http://${serverIp}:3000` : 'http://10.0.2.2:3000';
  
  config.baseURL = baseURL;

  // 2. Pobierz Token
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

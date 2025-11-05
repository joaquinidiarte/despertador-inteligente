import axios from 'axios';
import type { AlarmaEstado, AlarmaHistorial, ConfigAlarmaRequest } from '../types';

// Detectar automáticamente el host
const API_BASE_URL = `http://${window.location.hostname}:3000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const alarmaAPI = {
  // Configurar nueva alarma
  configurarAlarma: async (horaAlarma: string) => {
    const response = await api.post<ConfigAlarmaRequest>('/alarma', {
      hora_alarma: horaAlarma,
    });
    return response.data;
  },

  // Obtener estado actual
  getEstado: async (): Promise<AlarmaEstado> => {
    const response = await api.get<AlarmaEstado>('/estado');
    return response.data;
  },

  // Obtener historial
  getHistorial: async (): Promise<AlarmaHistorial[]> => {
    const response = await api.get<AlarmaHistorial[]>('/historial');
    return response.data;
  },

  // Cancelar alarma
  cancelarAlarma: async () => {
    const response = await api.delete('/alarma');
    return response.data;
  },
};

export default api;
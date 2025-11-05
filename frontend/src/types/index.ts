export interface AlarmaEstado {
  activa: boolean;
  esperando_mano?: boolean;
  hora_alarma?: string;
  tiempo_restante_minutos?: number;
  imagen?: string;
}

export interface AlarmaHistorial {
  id: number;
  fecha_apagado: string;
  hora_apagado: string;
  hora_alarma: string;
  tiempo_dormido: number;
  imagen_path: string;
  created_at: string;
}

export interface ConfigAlarmaRequest {
  hora_alarma: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
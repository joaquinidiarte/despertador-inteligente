export interface AlarmaEstado {
  monitoring: boolean;
  alarm_set: boolean;
  alarm_time?: string;
  start_time?: string;
}

export interface AlarmaActiva {
  hora_alarma: string;
  tiempo_hasta: number;
  imagen?: string;
  inicio: string;
}

export interface AlarmaDB {
  id: number;
  fecha_apagado: string;
  hora_apagado: string;
  hora_alarma: string;
  tiempo_dormido: number;
  imagen_path: string;
  created_at: string;
}

export interface HandDetectionRequest {
  image_path?: string;
}

export interface ConfigAlarmaRequest {
  hora_alarma: string;
}

export interface EstadoResponse {
  activa: boolean;
  esperando_mano?: boolean;
  hora_alarma?: string;
  tiempo_restante_minutos?: number;
  imagen?: string;
}
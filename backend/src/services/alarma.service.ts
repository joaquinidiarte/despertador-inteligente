import { AlarmaActiva, AlarmaDB } from '../types';
import db from '../config/database';
import stateService from './state.service';

class AlarmaService {
  private alarmaActiva: AlarmaActiva | null = null;
  private timerAlarma: NodeJS.Timeout | null = null;

  configurarAlarma(horaAlarma: string): void {
    stateService.guardarEstado({
      monitoring: true,
      alarm_set: true,
      alarm_time: horaAlarma,
      start_time: new Date().toISOString()
    });

    console.log('Alarma configurada para:', horaAlarma);
    console.log('Esperando detección de mano...');
  }

  manoDetectada(imagePath?: string): number {
    const estado = stateService.leerEstado();

    if (!estado.alarm_set) {
      throw new Error('No hay alarma activa');
    }

    console.log('Mano detectada, luz se apagará automáticamente vía GPIO...');

    const horaAlarma = estado.alarm_time!;
    const ahora = new Date();
    const [horas, minutos] = horaAlarma.split(':').map(Number);

    const alarmaDate = new Date();
    alarmaDate.setHours(horas, minutos, 0, 0);

    if (alarmaDate <= ahora) {
      alarmaDate.setDate(alarmaDate.getDate() + 1);
    }

    const tiempoHastaAlarma = alarmaDate.getTime() - ahora.getTime();

    console.log(`Alarma en ${Math.round(tiempoHastaAlarma / 1000 / 60)} minutos`);

    if (this.timerAlarma) {
      clearTimeout(this.timerAlarma);
    }

    this.timerAlarma = setTimeout(() => {
      this.despertarAlarma(estado.start_time!, horaAlarma, tiempoHastaAlarma, imagePath);
    }, tiempoHastaAlarma);

    this.alarmaActiva = {
      hora_alarma: horaAlarma,
      tiempo_hasta: tiempoHastaAlarma,
      imagen: imagePath,
      inicio: estado.start_time!
    };

    stateService.guardarEstado({ monitoring: false, alarm_set: false });

    return Math.round(tiempoHastaAlarma / 1000 / 60);
  }

  private despertarAlarma(
    fechaInicio: string,
    horaAlarma: string,
    tiempoDormido: number,
    imagePath?: string
  ): void {
    console.log('Alarma activada, luz se encenderá automáticamente vía GPIO...');

    const horaApagado = new Date(fechaInicio).toLocaleTimeString('es-AR');
    const tiempoDormidoMinutos = Math.round(tiempoDormido / 1000 / 60);

    db.run(
      `INSERT INTO alarmas (fecha_apagado, hora_apagado, hora_alarma, tiempo_dormido, imagen_path)
       VALUES (?, ?, ?, ?, ?)`,
      [
        new Date(fechaInicio).toLocaleDateString('es-AR'),
        horaApagado,
        horaAlarma,
        tiempoDormidoMinutos,
        imagePath || 'sin_imagen.jpg'
      ],
      (err) => {
        if (err) {
          console.error('error guardando registro:', err);
        } else {
          console.log('registro guardado en BD');
        }
      }
    );

    this.alarmaActiva = null;
  }

  cancelarAlarma(): void {
    if (this.timerAlarma) {
      clearTimeout(this.timerAlarma);
      this.timerAlarma = null;
    }

    stateService.guardarEstado({ monitoring: false, alarm_set: false });
    this.alarmaActiva = null;

    console.log('alarma cancelada');
  }

  getEstadoActual() {
    if (this.alarmaActiva) {
      const tiempoRestante =
        this.alarmaActiva.tiempo_hasta -
        (Date.now() - new Date(this.alarmaActiva.inicio).getTime());

      return {
        activa: true,
        hora_alarma: this.alarmaActiva.hora_alarma,
        tiempo_restante_minutos: Math.round(tiempoRestante / 1000 / 60),
        imagen: this.alarmaActiva.imagen
      };
    }

    const estado = stateService.leerEstado();
    return {
      activa: false,
      monitoring: estado.monitoring,
      esperando_mano: estado.monitoring
    };
  }

  getHistorial(callback: (err: Error | null, rows: AlarmaDB[]) => void): void {
    db.all(
      `SELECT * FROM alarmas ORDER BY created_at DESC LIMIT 50`,
      [],
      callback
    );
  }
}

export default new AlarmaService();
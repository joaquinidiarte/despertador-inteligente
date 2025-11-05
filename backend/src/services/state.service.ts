import fs from 'fs';
import path from 'path';
import { AlarmaEstado } from '../types';

const STATE_FILE = path.join(__dirname, '../../data/state.json');

class StateService {
  guardarEstado(estado: AlarmaEstado): void {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(estado, null, 2));
    } catch (error) {
      console.error('error guardando estado:', error);
    }
  }

  leerEstado(): AlarmaEstado {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('error leyendo estado:', error);
    }
    return { monitoring: false, alarm_set: false };
  }

  inicializar(): void {
    if (!fs.existsSync(STATE_FILE)) {
      this.guardarEstado({ monitoring: false, alarm_set: false });
    }
  }
}

export default new StateService();
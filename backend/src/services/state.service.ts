import fs from 'fs';
import path from 'path';
import { AlarmaEstado } from '../types';

// Usar variable de entorno para la ruta de datos, con fallback
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

class StateService {
  private estadoEnMemoria: AlarmaEstado | null = null;

  guardarEstado(estado: AlarmaEstado): void {
    try {
      this.estadoEnMemoria = estado;
      
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log('directorio data creado:', DATA_DIR);
      }
      
      fs.writeFileSync(STATE_FILE, JSON.stringify(estado, null, 2));
      console.log('estado guardado:', estado);
    } catch (error) {
      console.error('error guardando estado:', error);
    }
  }

  leerEstado(): AlarmaEstado {
    if (this.estadoEnMemoria) {
      return this.estadoEnMemoria;
    }
    
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        const estado = JSON.parse(data);
        this.estadoEnMemoria = estado;
        return estado;
      }
    } catch (error) {
      console.error('error leyendo estado:', error);
    }
    return { monitoring: false, alarm_set: false };
  }

  inicializar(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('directorio data creado:', DATA_DIR);
    }
    
    const estadoInicial = { monitoring: false, alarm_set: false };
    
    if (!fs.existsSync(STATE_FILE)) {
      this.guardarEstado(estadoInicial);
      console.log('archivo state.json creado');
    } else {
      this.estadoEnMemoria = this.leerEstado();
      console.log('estado cargado desde archivo');
    }

    console.log('stateService inicializado');
    console.log('   DATA_DIR:', DATA_DIR);
    console.log('   STATE_FILE:', STATE_FILE);
  }
}

export default new StateService();
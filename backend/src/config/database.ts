import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Usar variable de entorno para la ruta de datos, con fallback
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../..', 'data');
const dbPath = path.join(DATA_DIR, 'despertador.db');

// Asegurar que el directorio existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('directorio de datos creado:', DATA_DIR);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('error al conectar con la base de datos:', err);
  } else {
    console.log('conectado a la base de datos SQLite');
    console.log('DB Path:', dbPath);
    initDatabase();
  }
});

function initDatabase(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS alarmas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_apagado TEXT NOT NULL,
      hora_apagado TEXT NOT NULL,
      hora_alarma TEXT NOT NULL,
      tiempo_dormido INTEGER NOT NULL,
      imagen_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('error creando tabla:', err);
    } else {
      console.log('tabla alarmas lista');
    }
  });
}

export default db;
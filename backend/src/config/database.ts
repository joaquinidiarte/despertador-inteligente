import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/despertador.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('error al conectar con la base de datos:', err);
  } else {
    console.log('conectado a la base de datos SQLite');
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
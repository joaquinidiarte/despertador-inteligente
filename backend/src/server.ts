import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import alarmaRoutes from './routes/alarma.routes';
import stateService from './services/state.service';

const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_ROOT = path.resolve(__dirname, '../..');

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(PROJECT_ROOT, 'data/images')));

stateService.inicializar();

app.use('/api', alarmaRoutes);

const frontendPath = path.join(__dirname, '../frontend/dist');
const indexPath = path.join(frontendPath, 'index.html');

app.use(express.static(frontendPath));

app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend no compilado',
      message: 'Ejecuta: cd frontend && npm run build' 
    });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log('backend running');
  console.log(`http://localhost:${PORT}`);
});
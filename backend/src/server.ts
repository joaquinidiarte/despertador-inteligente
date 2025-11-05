import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import alarmaRoutes from './routes/alarma.routes';
import stateService from './services/state.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, '../data/images')));

stateService.inicializar();

app.use('/api', alarmaRoutes);
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/.*/, (_req: Request, res: Response) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('frontend no compilado');
  }
});

app.listen(PORT, () => {
  console.log('backend running');
  console.log(`http://localhost:${PORT}`);
});
import { Router, Request, Response } from 'express';
import alarmaService from '../services/alarma.service';
import stateService from '../services/state.service';
import { ConfigAlarmaRequest, HandDetectionRequest } from '../types';

const router = Router();

router.post('/alarma', (req: Request<{}, {}, ConfigAlarmaRequest>, res: Response): void => {
  const { hora_alarma } = req.body;

  if (!hora_alarma) {
    res.status(400).json({ error: 'Debe proporcionar hora_alarma' });
    return;
  }

  try {
    alarmaService.configurarAlarma(hora_alarma);
    res.json({
      success: true,
      message: 'Alarma configurada. Extiende tu mano para apagar la luz.',
      hora_alarma
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/check-hand', (_req: Request, res: Response): void => {
  const estado = stateService.leerEstado();
  res.json(estado);
});

router.post('/hand-detected', (req: Request<{}, {}, HandDetectionRequest>, res: Response): void => {
  const { image_path } = req.body;

  try {
    const tiempoMinutos = alarmaService.manoDetectada(image_path);
    res.json({
      success: true,
      message: 'Luz apagada. Alarma iniciada.',
      tiempo_hasta_alarma_minutos: tiempoMinutos
    });
  } catch (error) {
    res.json({ success: false, message: (error as Error).message });
  }
});

router.get('/historial', (_req: Request, res: Response): void => {
  alarmaService.getHistorial((err, rows): void => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/estado', (_req: Request, res: Response): void => {
  const estado = alarmaService.getEstadoActual();
  res.json(estado);
});

router.delete('/alarma', (_req: Request, res: Response): void => {
  try {
    alarmaService.cancelarAlarma();
    res.json({ success: true, message: 'Alarma cancelada' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
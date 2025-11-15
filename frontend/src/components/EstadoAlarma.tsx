import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import type { AlarmaEstado } from '../types';

interface EstadoAlarmaProps {
  estado: AlarmaEstado | null;
  onCancelar: () => void;
  loading: boolean;
}

export default function EstadoAlarma({ estado, onCancelar, loading }: EstadoAlarmaProps) {
  if (!estado) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando estado...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          Estado actual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {estado.activa ? (
          <>
            <div className="space-y-2 text-center">
              <p className="text-base sm:text-lg">
                <span className="font-semibold">Hora programada:</span>{' '}
                <span className="text-xl sm:text-2xl font-bold text-primary block sm:inline mt-1 sm:mt-0">
                  {estado.hora_alarma}
                </span>
              </p>
              <p className="text-base sm:text-lg">
                <span className="font-semibold">Tiempo restante:</span>{' '}
                <span className="text-xl sm:text-2xl font-bold text-primary block sm:inline mt-1 sm:mt-0">
                  {estado.tiempo_restante_minutos} min
                </span>
              </p>
            </div>

            <Button
              onClick={onCancelar}
              disabled={loading}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <AlertCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Cancelar alarma
            </Button>
          </>
        ) : estado.esperando_mano ? (
          <>
            <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
              <p className="text-center text-sm sm:text-base md:text-lg font-medium flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>Apuntá la mano a la cámara</span>
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 py-3 sm:py-4">
            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gray-400" />
            <Badge variant="outline" className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
              Sin alarma programada
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
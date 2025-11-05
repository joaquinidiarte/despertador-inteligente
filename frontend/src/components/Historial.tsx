import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, Clock, Moon, Image as ImageIcon } from 'lucide-react'
import type { AlarmaHistorial } from '../types'
import { useMemo, useState } from 'react'
import { cn } from '../lib/utils'

interface HistorialProps {
  historial: AlarmaHistorial[];
}

function useApiBase() {
  // Permite definir un backend distinto con VITE_API_URL; si no, usa protocolo/host actuales (puerto 3000 por defecto)
  return useMemo(() => {
    const env = import.meta.env?.VITE_API_URL as string | undefined
    if (env) return env.endsWith('/') ? env : `${env}/`
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:3000/`
  }, [])
}

function safeImageUrl(base: string, imagePath: string) {
  // Resuelve correctamente espacios y caracteres especiales
  const clean = imagePath?.replace(/^\/+/, '')
  return new URL(`images/${encodeURI(clean)}`, base).toString()
}

function formatDateSpanish(fecha: string) {
  // Admite ISO o 'YYYY-MM-DD HH:mm' / 'YYYY-MM-DD'
  const parsed =
    /\d{4}-\d{2}-\d{2}T?\d{0,2}:?\d{0,2}/.test(fecha)
      ? new Date(fecha)
      : new Date(fecha.replace(' ', 'T'))
  if (isNaN(parsed.getTime())) return fecha
  return parsed.toLocaleString('es-AR', {
    dateStyle: 'medium',
    timeStyle: undefined,
  })
}

export default function Historial({ historial }: HistorialProps) {
  const apiBase = useApiBase()

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          Historial de sueño
        </CardTitle>
        <CardDescription className="text-sm">
          Registro del tiempo de descanso
        </CardDescription>
      </CardHeader>

      <CardContent>
        {historial.length === 0 ? (
          <div className="py-8 text-center sm:py-12">
            <Moon className="mx-auto mb-3 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16 sm:mb-4" />
            <p className="text-base text-muted-foreground sm:text-lg">
              No hay registros aún
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {historial.map((registro) => {
              const tieneImagen =
                registro.imagen_path &&
                registro.imagen_path !== 'sin_imagen.jpg'

              return (
                <Card
                  key={registro.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base sm:text-lg">
                        {formatDateSpanish(registro.fecha_apagado)}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 sm:space-y-3">
                    <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          Luz apagada:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {registro.hora_apagado}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          Alarma:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {registro.hora_alarma}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Tiempo dormido:
                        </span>
                        <Badge className="text-xs">
                          {registro.tiempo_dormido} min
                        </Badge>
                      </div>
                    </div>

                    {/* Imagen (opcional) con fallback */}
                    {tieneImagen ? (
                      <HistorialImage
                        src={safeImageUrl(apiBase, registro.imagen_path!)}
                        alt={`Captura mano detectada ${formatDateSpanish(registro.fecha_apagado)}`}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function HistorialImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)

  return (
    <div className="group relative mt-2 sm:mt-3">
      {error ? (
        <div className="flex h-40 w-full items-center justify-center rounded-md border bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs">Imagen no disponible</span>
          </div>
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={cn(
              'h-40 w-full rounded-md border object-cover',
              'transition-transform duration-300 group-hover:scale-[1.01]'
            )}
            onError={() => setError(true)}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <ImageIcon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </div>
        </>
      )}
    </div>
  )
}

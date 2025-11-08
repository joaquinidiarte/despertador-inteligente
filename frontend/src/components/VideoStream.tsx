import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Video, VideoOff } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

interface VideoStreamProps {
  isMonitoring: boolean;
}

function useApiBase() {
  return useMemo(() => {
    const env = import.meta.env?.VITE_API_URL as string | undefined
    if (env) return env.endsWith('/') ? env.slice(0, -1) : env
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:3000`
  }, [])
}

export default function VideoStream({ isMonitoring }: VideoStreamProps) {
  const [streamError, setStreamError] = useState(false)
  const apiBase = useApiBase()

  useEffect(() => {
    if (!isMonitoring) {
      setStreamError(false)
    }
  }, [isMonitoring])

  if (!isMonitoring) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <VideoOff className="h-5 w-5" />
            Vista previa de cámara
          </CardTitle>
          <CardDescription className="text-sm">
            La vista previa se activará cuando configures una alarma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 sm:h-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
            <div className="text-center text-muted-foreground">
              <VideoOff className="mx-auto mb-2 h-12 w-12 sm:h-16 sm:w-16" />
              <p className="text-sm sm:text-base">Cámara inactiva</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Video className="h-5 w-5 text-green-500" />
          Vista previa en vivo
        </CardTitle>
        <CardDescription className="text-sm">
          Posiciona tu mano para que la cámara la detecte
        </CardDescription>
      </CardHeader>
      <CardContent>
        {streamError ? (
          <div className="flex h-48 sm:h-64 items-center justify-center rounded-lg border bg-muted/30">
            <div className="text-center text-muted-foreground">
              <VideoOff className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">No se pudo cargar el video</p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg border">
            <img
              src={`${apiBase}/api/video-stream`}
              alt="Stream de cámara en vivo"
              className="w-full h-auto"
              onError={() => setStreamError(true)}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              EN VIVO
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

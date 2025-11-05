import { useState, useEffect, useCallback } from "react"
import { alarmaAPI } from "../services/api"
import type { AlarmaEstado, AlarmaHistorial } from "../types"
import { toast } from "sonner"

export function useAlarma() {
  const [estado, setEstado] = useState<AlarmaEstado | null>(null)
  const [historial, setHistorial] = useState<AlarmaHistorial[]>([])
  const [loading, setLoading] = useState(false)

  const mensaje = estado?.activa
    ? `Alarma activa para las ${estado.hora_alarma}`
    : "No hay ninguna alarma activa"

  const cargarEstado = useCallback(async () => {
    try {
      const data = await alarmaAPI.getEstado()
      setEstado(data)
    } catch (error: any) {
      console.error(error)
      toast.error("Error cargando estado", { description: error?.message })
    }
  }, [])

  const cargarHistorial = useCallback(async () => {
    try {
      const data = await alarmaAPI.getHistorial()
      setHistorial(data)
    } catch (error: any) {
      console.error(error)
      toast.error("Error cargando historial", { description: error?.message })
    }
  }, [])

  const configurarAlarma = async (horaAlarma: string) => {
    setLoading(true)
    try {
      await alarmaAPI.configurarAlarma(horaAlarma)
      toast.success("Alarma configurada", {
        description: `Se activará a las ${horaAlarma}`,
      })
      await cargarEstado()
    } catch (error: any) {
      toast.error("Error configurando alarma", { description: error?.message })
    } finally {
      setLoading(false)
    }
  }

  const cancelarAlarma = async () => {
    if (!window.confirm("¿Cancelar alarma activa?")) return
    setLoading(true)
    try {
      await alarmaAPI.cancelarAlarma()
      toast.info("Alarma cancelada")
      await cargarEstado()
    } catch (error: any) {
      toast.error("Error cancelando alarma", { description: error?.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEstado()
    cargarHistorial()
    const interval = setInterval(() => cargarEstado(), 5000)
    return () => clearInterval(interval)
  }, [cargarEstado, cargarHistorial])

  return { estado, historial, loading, configurarAlarma, cancelarAlarma, cargarHistorial, mensaje }
}

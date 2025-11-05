import { useState, type FormEvent } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import TimePicker from './TimePickerWheel'

interface FormularioAlarmaProps {
  onSubmit: (hora: string) => void
  loading: boolean
  disabled: boolean
}

export default function FormularioAlarma({
  onSubmit,
  loading,
  disabled,
}: FormularioAlarmaProps) {
  const [horaAlarma, setHoraAlarma] = useState<string>('07:00')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading || disabled) return
    if (horaAlarma) onSubmit(horaAlarma)
  }

  const isBlocked = loading || disabled || !horaAlarma

  return (
    <Card className="bg-card text-card-foreground">
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
          aria-busy={loading ? 'true' : 'false'}
        >
          {/* Time Picker */}
          <div className="rounded-xl bg-muted/30 p-4">
            <TimePicker value={horaAlarma} onChange={setHoraAlarma} />
          </div>

          {/* Hora seleccionada */}
          <div className="text-center">
            <p className="mb-1 text-sm text-muted-foreground">Hora seleccionada</p>
            <p className="text-3xl font-bold text-primary">{horaAlarma}</p>
          </div>

          <Button
            type="submit"
            disabled={isBlocked}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="mr-2 h-5 w-5 font-bold animate-spin rounded-full border-2 border-current border-t-transparent" />
                Configurando...
              </>
            ) : (
              <>
                Establecer alarma
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

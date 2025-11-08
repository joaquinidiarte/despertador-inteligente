import { useAlarma } from './hooks/useAlarma'
import EstadoAlarma from './components/EstadoAlarma'
import FormularioAlarma from './components/FormularioAlarma'
import Historial from './components/Historial'
import VideoStream from './components/VideoStream'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from 'sonner'
import './index.css'

function App() {
  const {
    estado,
    historial,
    loading,
    configurarAlarma,
    cancelarAlarma,
  } = useAlarma()

  return (
    <ThemeProvider>
      <Toaster position="top-right" richColors />
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 gradient-blue opacity-20" />
        <div className="relative text-center py-8 sm:py-12 px-4">
          <div className="mx-auto mb-2 flex max-w-3xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <h1 className="text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
              ctrl+home
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 pb-8 sm:pb-12">
        {/* Grid responsive: 1 columna en móvil, 2 en desktop */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <EstadoAlarma
            estado={estado}
            onCancelar={cancelarAlarma}
            loading={loading}
          />

          <FormularioAlarma
            onSubmit={configurarAlarma}
            loading={loading}
            disabled={estado?.activa || false}
          />
        </div>

        {/* Vista previa de video cuando la alarma está activa */}
        <VideoStream isMonitoring={estado?.monitoring || false} />

        <Historial historial={historial} />
      </main>
    </div>
    </ThemeProvider>
  )
}

export default App

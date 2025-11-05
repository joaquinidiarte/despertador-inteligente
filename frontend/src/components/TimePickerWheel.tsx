import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '../lib/utils'

interface TimePickerWheelProps {
  value: number
  max: number
  onChange: (value: number) => void
  label?: string
}

function TimePickerWheel({ value, max, onChange, label }: TimePickerWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const itemHeight = 60

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const targetScroll = value * itemHeight
      containerRef.current.scrollTop = targetScroll
    }
  }, [value, isDragging])

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isDragging) return
    const scrollTop = containerRef.current.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const next = index % (max + 1)
    if (next !== value) onChange(next)
  }, [value, max, onChange, isDragging])

  const startDrag = () => setIsDragging(true)
  const endDrag = () => {
    setIsDragging(false)
    handleScroll()
  }

  return (
    <div className="relative flex-1">
      {label && (
        <div className="text-xs text-muted-foreground text-center mb-1 font-medium">
          {label}
        </div>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={startDrag}
        onTouchEnd={endDrag}
        onMouseDown={startDrag}
        onMouseUp={endDrag}
        onMouseLeave={isDragging ? endDrag : undefined}
        className="h-[180px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        }}
      >
        <div className="h-[60px]" />

        {Array.from({ length: (max + 1) * 3 }, (_, i) => {
          const num = i % (max + 1) // 0..max
          const isSelected = num === value

          const display = label === 'Hora'
            ? (num === 0 ? '12' : String(num).padStart(2, '0')) // 0→12 visual
            : String(num).padStart(2, '0')

          return (
            <div
              key={i}
              className={cn(
                'h-[60px] flex items-center justify-center text-3xl font-bold transition-all duration-200 snap-center select-none',
                isSelected ? 'text-primary scale-110' : 'text-muted-foreground/50 scale-90'
              )}
            >
              {display}
            </div>
          )
        })}

        <div className="h-[60px]" />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[60px] -translate-y-1/2 rounded-lg border-y-2 border-primary/20 bg-primary/5" />
    </div>
  )
}

interface TimePickerProps {
  value: string // "HH:MM" 24h
  onChange: (time: string) => void
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  // Horas en 12h: 0..11 (0 ≡ 12)
  const [hours, setHours] = useState<number>(7)   // 0..11
  const [minutes, setMinutes] = useState<number>(0)
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  // Parsear prop value cuando cambie
  useEffect(() => {
    if (!value) return
    const [hStr, mStr] = value.split(':')
    const h = Number(hStr)
    const m = Number(mStr)
    const isPM = h >= 12

    // Convertir 24h → 12h (0..11 interno)
    // 00:xx → 12:xx AM → hours=0
    // 12:xx → 12:xx PM → hours=0 + PM
    // 13..23 → (h-12) PM
    // 01..11 → h AM
    let hh: number
    if (h === 0) hh = 0
    else if (h === 12) hh = 0
    else if (h > 12) hh = h - 12
    else hh = h

    setHours(hh)
    setMinutes(m)
    setPeriod(isPM ? 'PM' : 'AM')
  }, [value])

  // Emitir en 24h cuando cambien horas/minutos/period
  useEffect(() => {
    // 12h (interno 0..11) → 24h
    // AM: 12 AM (hours=0) → 00; resto hh
    // PM: 12 PM (hours=0) → 12; resto hh+12
    let h24: number
    if (period === 'AM') {
      h24 = hours === 0 ? 0 : hours
    } else {
      h24 = hours === 0 ? 12 : hours + 12
    }

    const timeString = `${String(h24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    onChange(timeString)
  }, [hours, minutes, period, onChange])

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <TimePickerWheel
        value={hours}
        max={11}         // 👈 0..11, sin duplicar “12”
        onChange={setHours}
        label="Hora"
      />

      <div className="mt-6 text-4xl font-bold text-primary/50">:</div>

      <TimePickerWheel
        value={minutes}
        max={59}
        onChange={setMinutes}
        label="Minutos"
      />

      <div className="ml-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setPeriod('AM')}
          className={cn(
            'h-14 w-16 rounded-xl text-sm font-bold transition-all',
            period === 'AM'
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => setPeriod('PM')}
          className={cn(
            'h-14 w-16 rounded-xl text-sm font-bold transition-all',
            period === 'PM'
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          PM
        </button>
      </div>
    </div>
  )
}

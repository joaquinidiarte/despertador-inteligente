import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../lib/utils';

interface TimePickerWheelProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

function TimePickerWheel({ value, max, onChange, label }: TimePickerWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const itemHeight = 60;

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const targetScroll = value * itemHeight;
      containerRef.current.scrollTop = targetScroll;
    }
  }, [value, isDragging]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isDragging) return;

    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    
    if (index !== value) {
      onChange(index % (max + 1));
    }
  }, [value, max, onChange, isDragging]);

  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => {
    setIsDragging(false);
    handleScroll();
  };

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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className="h-[180px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
        }}
      >
        <div className="h-[60px]" />
        
        {Array.from({ length: (max + 1) * 3 }, (_, i) => {
          const num = i % (max + 1);
          const isSelected = num === value;
          
          return (
            <div
              key={i}
              className={cn(
                "h-[60px] flex items-center justify-center text-3xl font-bold transition-all duration-200 snap-center select-none",
                isSelected 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground/50 scale-90"
              )}
            >
              {label === 'Hora' && num === 0 ? '12' : num.toString().padStart(2, '0')}
            </div>
          );
        })}
        
        <div className="h-[60px]" />
      </div>
      
      <div className="absolute top-1/2 left-0 right-0 h-[60px] -translate-y-1/2 border-y-2 border-primary/20 rounded-lg pointer-events-none bg-primary/5" />
    </div>
  );
}

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [hours, setHours] = useState<number>(7);
  const [minutes, setMinutes] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      const is24h = h >= 12;
      setHours(is24h ? (h === 12 ? 12 : h - 12) : (h === 0 ? 12 : h));
      setMinutes(m);
      setPeriod(is24h ? 'PM' : 'AM');
    }
  }, []);

  useEffect(() => {
    let h24 = hours;
    if (period === 'PM' && hours !== 12) {
      h24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      h24 = 0;
    }
    
    const timeString = `${h24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onChange(timeString);
  }, [hours, minutes, period, onChange]);

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <TimePickerWheel
        value={hours}
        max={12}
        onChange={setHours}
        label="Hora"
      />

      <div className="text-4xl font-bold text-primary/50 mt-6">:</div>

      <TimePickerWheel
        value={minutes}
        max={59}
        onChange={setMinutes}
        label="Minutos"
      />

      <div className="flex flex-col gap-2 ml-3">
        <button
          type="button"
          onClick={() => setPeriod('AM')}
          className={cn(
            "w-16 h-14 rounded-xl font-bold text-sm transition-all",
            period === 'AM'
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => setPeriod('PM')}
          className={cn(
            "w-16 h-14 rounded-xl font-bold text-sm transition-all",
            period === 'PM'
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          PM
        </button>
      </div>
    </div>
  );
}
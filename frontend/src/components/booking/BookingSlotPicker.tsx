import { cn } from '../../lib/classNames';

export interface SlotState {
  /** "HH:mm" 24h, e.g. "09:00" */
  value: string;
  label: string;
  disabled?: boolean;
  /** Visual hint about availability/peak */
  hint?: 'peak' | 'best' | 'reserved';
}

interface BookingSlotPickerProps {
  slots: SlotState[];
  selectedValue?: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Generate hourly slot starts between two HH:mm boundaries, inclusive of start, exclusive of end.
 */
export function generateHourlySlots(
  startHour = 6,
  endHour = 20,
  opts?: { reservedHours?: number[]; bestHours?: number[]; peakHours?: number[]; pastHourCutoff?: number },
): SlotState[] {
  const reserved = new Set(opts?.reservedHours ?? []);
  const best = new Set(opts?.bestHours ?? []);
  const peak = new Set(opts?.peakHours ?? []);
  const slots: SlotState[] = [];
  for (let h = startHour; h < endHour; h++) {
    const value = `${String(h).padStart(2, '0')}:00`;
    const isPast = opts?.pastHourCutoff != null && h < opts.pastHourCutoff;
    const isReserved = reserved.has(h);
    let hint: SlotState['hint'];
    if (isReserved) hint = 'reserved';
    else if (best.has(h)) hint = 'best';
    else if (peak.has(h)) hint = 'peak';
    slots.push({
      value,
      label: value,
      disabled: isPast || isReserved,
      hint,
    });
  }
  return slots;
}

export function BookingSlotPicker({
  slots,
  selectedValue,
  onChange,
  ariaLabel = 'Select a time slot',
  className,
}: BookingSlotPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'grid grid-cols-3 sm:grid-cols-4 gap-2',
        className,
      )}
    >
      {slots.map((s) => {
        const selected = s.value === selectedValue;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={s.disabled}
            onClick={() => onChange(s.value)}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg px-2 py-2.5 text-sm font-semibold',
              'border transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900',
              s.disabled && 'opacity-40 cursor-not-allowed border-brand-700 bg-brand-800 text-gray-500',
              !s.disabled && selected && 'border-brand-400 bg-brand-500 text-white shadow-md',
              !s.disabled && !selected && 'border-brand-700 bg-brand-800 text-gray-200 hover:bg-brand-700 hover:border-brand-500',
            )}
          >
            <span className="tabular-nums">{s.label}</span>
            {s.hint === 'best' && !selected && (
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-400">Best</span>
            )}
            {s.hint === 'peak' && !selected && (
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400">Peak</span>
            )}
            {s.hint === 'reserved' && (
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">Reserved</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

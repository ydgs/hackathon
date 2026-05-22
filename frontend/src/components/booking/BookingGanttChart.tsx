import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Booking, BookingState } from '../../types';
import { cn } from '../../lib/classNames';
import { formatTime } from '../../lib/formatters';
import { GanttBookingModal, type GanttSlotSelection } from './GanttBookingModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const MU_TZ = 'Indian/Mauritius';
const DAY_START_HOUR = 6;   // 06:00
const DAY_END_HOUR   = 22;  // 22:00
const TOTAL_HOURS    = DAY_END_HOUR - DAY_START_HOUR;
const HOUR_LABELS    = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDecimalHourMU(iso: string): number {
  const d = new Date(iso);
  const hStr = d.toLocaleTimeString('en-MU', {
    timeZone: MU_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }); // "HH:mm"
  const [h, m] = hStr.split(':').map(Number);
  return h + m / 60;
}

function toPercent(iso: string): number {
  const hour = getDecimalHourMU(iso);
  const clamped = Math.min(Math.max(hour, DAY_START_HOUR), DAY_END_HOUR);
  return ((clamped - DAY_START_HOUR) / TOTAL_HOURS) * 100;
}

function nowPercent(): number {
  return toPercent(new Date().toISOString());
}

// ─── State colour map ─────────────────────────────────────────────────────────

const STATE_BAR: Record<BookingState, string> = {
  Pending:    'bg-purple-500/80 border-purple-400 text-purple-50',
  Confirmed:  'bg-blue-500/80   border-blue-400   text-blue-50',
  Active:     'bg-emerald-500/80 border-emerald-400 text-emerald-50',
  Completed:  'bg-gray-500/70   border-gray-400   text-gray-100',
  Cancelled:  'bg-red-500/70    border-red-400    text-red-50',
  Released:   'bg-yellow-500/70 border-yellow-300  text-yellow-900',
  NoShow:     'bg-orange-500/80 border-orange-400  text-orange-50',
  Overridden: 'bg-amber-500/80  border-amber-400   text-amber-50',
};

// ─── Drag helpers ─────────────────────────────────────────────────────────────

/** Slot picker supports bookings up to 20:00 end time */
const BOOKING_MAX_END_HOUR = 20;

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function pctToHour(pct: number): number {
  return DAY_START_HOUR + (pct / 100) * TOTAL_HOURS;
}

function snapToHour(decimal: number): number {
  return Math.round(decimal);
}

function hourToHHmm(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

interface DragState {
  chargerId: string;
  startPct: number;
  currentPct: number;
}

function ghostTimes(d: DragState): { startH: number; endH: number } {
  const minPct = Math.min(d.startPct, d.currentPct);
  const startH = clamp(snapToHour(pctToHour(minPct)), DAY_START_HOUR, BOOKING_MAX_END_HOUR - 1);
  // Policy: max 1 hour per booking — always snap to exactly startH + 1
  const endH = Math.min(startH + 1, BOOKING_MAX_END_HOUR);
  return { startH, endH };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingGanttChartProps {
  bookings: Booking[];
  className?: string;
  /** ISO date string (YYYY-MM-DD) for the date being displayed. Defaults to today. */
  selectedDate?: string;
  onBookingCreated?: () => void;
}

interface ChargerRow {
  chargerId: string;
  chargerDisplayName: string;
  bookings: Booking[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingGanttChart({ bookings, className, selectedDate, onBookingCreated }: BookingGanttChartProps) {
  const todayIso = new Date().toISOString().split('T')[0];
  const isToday = !selectedDate || selectedDate === todayIso;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [modalSelection, setModalSelection] = useState<GanttSlotSelection | null>(null);

  // Group bookings by charger
  const chargerMap = new Map<string, ChargerRow>();
  for (const b of bookings) {
    if (!chargerMap.has(b.chargerId)) {
      chargerMap.set(b.chargerId, {
        chargerId: b.chargerId,
        chargerDisplayName: b.chargerDisplayName,
        bookings: [],
      });
    }
    chargerMap.get(b.chargerId)!.bookings.push(b);
  }
  const rows: ChargerRow[] = Array.from(chargerMap.values());

  const now = nowPercent();
  // Only show the "now" indicator when viewing today's schedule
  const showNowLine = isToday && now >= 0 && now <= 100;

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, row: ChargerRow) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      setDrag({ chargerId: row.chargerId, startPct: pct, currentPct: pct });
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      setDrag((prev) => (prev ? { ...prev, currentPct: pct } : null));
    },
    [drag],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, row: ChargerRow) => {
      if (!drag || drag.chargerId !== row.chargerId) {
        setDrag(null);
        return;
      }
      e.currentTarget.releasePointerCapture(e.pointerId);
      const dragged = Math.abs(drag.currentPct - drag.startPct);
      const { startH, endH } = ghostTimes(drag);
      setDrag(null);
      // Treat tiny movements as clicks (< ~0.8% ≈ ~5px on a 680px chart)
      if (dragged < 0.8) return;
      setModalSelection({
        chargerId:          row.chargerId,
        chargerDisplayName: row.chargerDisplayName,
        startHour: startH,
        endHour:   endH,
      });
    },
    [drag],
  );

  const handlePointerCancel = useCallback(() => setDrag(null), []);

  return (
    <div className={cn('w-full', className)}>
      {/* Legend + drag hint */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 mb-3 px-1">
        <div className="flex flex-wrap gap-3 text-xs">
          {(
            [
              ['Confirmed',  STATE_BAR.Confirmed],
              ['Active',     STATE_BAR.Active],
              ['Completed',  STATE_BAR.Completed],
              ['Cancelled',  STATE_BAR.Cancelled],
              ['Released',   STATE_BAR.Released],
              ['NoShow',     STATE_BAR.NoShow],
            ] as [BookingState, string][]
          ).map(([label, cls]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={cn('inline-block w-3 h-3 rounded-sm border', cls)} />
              <span className="text-gray-400">{label}</span>
            </span>
          ))}
          {showNowLine && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-px h-3 bg-rose-400" />
              <span className="text-gray-400">Now</span>
            </span>
          )}
        </div>
        <p className="text-[11px] text-brand-300 italic hidden sm:block">
          Drag on any row to book a slot
        </p>
      </div>

      {/* Scrollable chart area */}
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-card bg-brand-800 border border-brand-700"
        tabIndex={0}
        aria-label="Booking schedule Gantt chart — drag to create a booking"
      >
        <div className="min-w-[680px]">

          {/* ── Header row (time labels) ── */}
          <div className="flex border-b border-brand-700">
            <div className="w-36 shrink-0 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-r border-brand-700 sticky left-0 bg-brand-800 z-10">
              Charger
            </div>
            <div className="flex-1 relative flex">
              {HOUR_LABELS.map((h) => {
                const pct = ((h - DAY_START_HOUR) / TOTAL_HOURS) * 100;
                return (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 flex flex-col justify-end pb-1"
                    style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {String(h).padStart(2, '0')}:00
                    </span>
                  </div>
                );
              })}
              <div className="w-full py-4" />
            </div>
          </div>

          {/* ── Data rows ── */}
          {rows.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-500">
              No bookings to display on the chart.
            </div>
          ) : (
            rows.map((row, rowIdx) => {
              const isDraggingThisRow = drag?.chargerId === row.chargerId;
              const ghost = isDraggingThisRow && drag ? ghostTimes(drag) : null;
              const ghostLeft  = ghost
                ? ((ghost.startH - DAY_START_HOUR) / TOTAL_HOURS) * 100
                : 0;
              const ghostWidth = ghost
                ? ((ghost.endH - ghost.startH) / TOTAL_HOURS) * 100
                : 0;
              // Red ghost when the 1-hour slot overlaps an active booking
              const ghostHasConflict = ghost
                ? row.bookings.some((b) => {
                    if (!['Pending', 'Confirmed', 'Active'].includes(b.state)) return false;
                    const bS = getDecimalHourMU(b.startTime);
                    const bE = getDecimalHourMU(b.endTime);
                    return bS < ghost.endH && bE > ghost.startH;
                  })
                : false;

              return (
                <div
                  key={row.chargerId}
                  className={cn(
                    'flex',
                    rowIdx !== rows.length - 1 && 'border-b border-brand-700/50',
                  )}
                >
                  {/* Charger label — sticky */}
                  <div className="w-36 shrink-0 px-3 py-3 flex flex-col justify-center border-r border-brand-700 sticky left-0 bg-brand-800 z-10">
                    <span className="text-xs font-semibold text-white leading-tight line-clamp-2">
                      {row.chargerDisplayName}
                    </span>
                  </div>

                  {/* ── Timeline area (drag target) ── */}
                  <div
                    className={cn(
                      'flex-1 relative py-2 select-none',
                      drag
                        ? isDraggingThisRow
                          ? 'cursor-col-resize'
                          : 'cursor-not-allowed opacity-60'
                        : 'cursor-crosshair',
                    )}
                    style={{ minHeight: '52px', touchAction: 'none' }}
                    onPointerDown={(e) => handlePointerDown(e, row)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(e) => handlePointerUp(e, row)}
                    onPointerCancel={handlePointerCancel}
                    role="application"
                    aria-label={`Timeline for ${row.chargerDisplayName} — drag to select a booking slot`}
                  >
                    {/* Hour grid lines */}
                    {HOUR_LABELS.map((h) => {
                      const pct = ((h - DAY_START_HOUR) / TOTAL_HOURS) * 100;
                      return (
                        <div
                          key={h}
                          className="absolute inset-y-0 w-px bg-brand-700/40"
                          style={{ left: `${pct}%` }}
                          aria-hidden="true"
                        />
                      );
                    })}

                    {/* Current-time indicator */}
                    {showNowLine && (
                      <div
                        className="absolute inset-y-0 w-0.5 bg-rose-400 z-20 pointer-events-none"
                        style={{ left: `${now}%` }}
                        aria-hidden="true"
                      />
                    )}

                    {/* ── Ghost drag selection ── */}
                    {isDraggingThisRow && ghost && ghostWidth > 0 && (
                      <div
                        className={cn(
                          'absolute inset-y-1 z-30 pointer-events-none rounded border-2 border-dashed flex items-center justify-center overflow-hidden',
                          ghostHasConflict
                            ? 'border-rose-400 bg-rose-400/20'
                            : 'border-teal-400 bg-teal-400/20',
                        )}
                        style={{ left: `${ghostLeft}%`, width: `${ghostWidth}%` }}
                        aria-hidden="true"
                      >
                        <span className={cn(
                          'text-[10px] font-bold whitespace-nowrap px-1 drop-shadow',
                          ghostHasConflict ? 'text-rose-200' : 'text-teal-200',
                        )}>
                          {ghostHasConflict
                            ? '\u2715 Taken'
                            : `${hourToHHmm(ghost.startH)} → ${hourToHHmm(ghost.endH)}`}
                        </span>
                      </div>
                    )}

                    {/* Booking bars */}
                    {row.bookings.map((b) => {
                      const left  = toPercent(b.startTime);
                      const right = toPercent(b.endTime);
                      const width = Math.max(right - left, 0.5);
                      return (
                        <Link
                          key={b.id}
                          to={`/bookings/${b.id}`}
                          title={`${b.userDisplayName} · ${formatTime(b.startTime)}–${formatTime(b.endTime)} · ${b.state}`}
                          className={cn(
                            'absolute inset-y-1 z-10 flex items-center px-1.5 rounded border text-[10px] font-semibold truncate',
                            'transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                            STATE_BAR[b.state],
                          )}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <span className="truncate">{b.userDisplayName}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile hints */}
      <p className="mt-1.5 text-[11px] text-gray-500 sm:hidden">
        Swipe left/right to see the full schedule · Press and drag to book a slot
      </p>

      {/* Booking modal — opened after drag */}
      <GanttBookingModal
        selection={modalSelection}
        bookings={bookings}
        onClose={() => setModalSelection(null)}
        onBookingCreated={onBookingCreated}
        selectedDate={selectedDate}
      />
    </div>
  );
}

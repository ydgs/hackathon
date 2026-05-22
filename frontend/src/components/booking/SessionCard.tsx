import { BoltIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { Booking } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/classNames';
import { formatKwh, formatTime } from '../../lib/formatters';

interface SessionCardProps {
  booking: Booking;
  /** Optional remaining minutes for live countdown display. */
  remainingMinutes?: number;
  onRelease?: (booking: Booking) => void;
  className?: string;
}

export function SessionCard({ booking, remainingMinutes, onRelease, className }: SessionCardProps) {
  const session = booking.chargingSession;
  const energy = session?.energyKwh ?? 0;
  // Assume 60-min nominal session for visual progress
  const totalMin = Math.max(
    1,
    Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000),
  );
  const elapsed = remainingMinutes != null ? Math.max(0, totalMin - remainingMinutes) : totalMin / 2;
  const pct = Math.min(100, (elapsed / totalMin) * 100);

  return (
    <article
      aria-label="Active charging session"
      className={cn(
        'relative overflow-hidden rounded-card p-5 sm:p-6',
        'border border-violet-500/30 ring-1 ring-violet-500/20',
        'bg-gradient-to-br from-violet-900/30 via-brand-800 to-brand-800',
        'shadow-lg',
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-50 bg-gradient-to-br from-violet-500/40 to-transparent" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-violet-500/20 text-violet-200 text-xs font-bold uppercase tracking-wider badge-pulse"
          >
            <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Charging now
          </span>
        </div>
        {remainingMinutes != null && (
          <span className="inline-flex items-center gap-1 text-xs text-violet-200 font-medium">
            <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Ending in {remainingMinutes} min
          </span>
        )}
      </div>

      <h3 className="relative mt-4 text-lg font-bold text-white">{booking.chargerDisplayName}</h3>
      <p className="relative mt-1 flex items-center gap-1 text-xs text-gray-400">
        <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {booking.locationCode === 'NEX-TOWER' ? 'NEX Tower' : 'NEXTERACOM'}
        <span>·</span>
        <span>{booking.vehicleMake} {booking.vehicleModel}</span>
      </p>

      <div className="relative mt-5 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Delivered</p>
          <p className="mt-1 text-xl font-bold text-white tabular-nums">{formatKwh(energy)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Started</p>
          <p className="mt-1 text-xl font-bold text-white tabular-nums">{formatTime(booking.startTime)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Ends</p>
          <p className="mt-1 text-xl font-bold text-white tabular-nums">{formatTime(booking.endTime)}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="h-2 w-full bg-brand-700/60 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Session progress">
          <div
            className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-violet-300 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Link to={`/bookings/${booking.id}`}>
          <Button variant="secondary" size="sm">View details</Button>
        </Link>
        {onRelease && (
          <Button variant="primary" size="sm" onClick={() => onRelease(booking)}>
            Release slot early
          </Button>
        )}
      </div>
    </article>
  );
}

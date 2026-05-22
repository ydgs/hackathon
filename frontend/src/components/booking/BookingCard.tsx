import { Link } from 'react-router-dom';
import type { Booking } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { CsmsSyncBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/classNames';
import { formatTimeWindow, formatKwh, formatDate } from '../../lib/formatters';
import { BoltIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
  onRelease?: (booking: Booking) => void;
  className?: string;
}

export function BookingCard({ booking, onCancel, onRelease, className }: BookingCardProps) {
  const canCancel = booking.state === 'Confirmed' || booking.state === 'Pending';
  const canRelease = booking.state === 'Active';

  return (
    <div
      className={cn(
        'bg-brand-800 rounded-card p-4 space-y-3',
        'border border-brand-700/50',
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <StatusBadge status={booking.state} type="booking" />
        <span className="text-xs text-gray-400 font-mono">
          {formatTimeWindow(booking.startTime, booking.endTime)}
        </span>
      </div>

      {/* Charger + location */}
      <div>
        <p className="text-sm font-semibold text-white">{booking.chargerDisplayName}</p>
        <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {booking.locationCode === 'NEX-TOWER' ? 'NEX Tower' : 'NEXTERACOM'}
          {' · '}
          {booking.vehicleMake} {booking.vehicleModel}
        </p>
      </div>

      {/* CSMS badge */}
      <CsmsSyncBadge status={booking.csmsSyncStatus} />

      {/* Energy (completed) */}
      {booking.state === 'Completed' && booking.chargingSession?.energyKwh != null && (
        <p className="flex items-center gap-1 text-xs text-brand-300">
          <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {formatKwh(booking.chargingSession.energyKwh)} consumed
        </p>
      )}

      {/* Date hint */}
      <p className="text-xs text-gray-500">{formatDate(booking.startTime)}</p>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-brand-700/40 flex-wrap">
        <Link to={`/bookings/${booking.id}`}>
          <Button variant="ghost" size="sm">Detail →</Button>
        </Link>
        {canCancel && onCancel && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(booking)}>
            Cancel
          </Button>
        )}
        {canRelease && onRelease && (
          <Button variant="secondary" size="sm" onClick={() => onRelease(booking)}>
            Release
          </Button>
        )}
      </div>
    </div>
  );
}

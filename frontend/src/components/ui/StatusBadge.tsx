import { cn } from '../../lib/classNames';
import type { ChargerStatus, BookingState, CsmsSyncStatus } from '../../types';

// Charger status badge
const CHARGER_STATUS_STYLES: Record<ChargerStatus, string> = {
  Available:             'bg-status-available text-white',
  Reserved:              'bg-status-reserved text-white',
  Charging:              'bg-status-charging text-white badge-pulse',
  BlockedForMaintenance: 'bg-status-maintenance text-white',
  Unavailable:           'bg-status-unavailable text-white',
  Faulted:               'bg-status-faulted text-white',
};

const CHARGER_STATUS_LABELS: Record<ChargerStatus, string> = {
  Available:             'AVAILABLE',
  Reserved:              'RESERVED',
  Charging:              'CHARGING',
  BlockedForMaintenance: 'MAINTENANCE',
  Unavailable:           'UNAVAILABLE',
  Faulted:               'FAULTED',
};

// Booking state badge
const BOOKING_STATE_STYLES: Record<BookingState, string> = {
  Pending:   'bg-amber-600 text-white',
  Confirmed: 'bg-status-reserved text-white',
  Active:    'bg-status-charging text-white badge-pulse',
  Completed: 'bg-status-available text-white',
  Cancelled: 'bg-status-unavailable text-white',
  Released:  'bg-grey-500 text-white',
  NoShow:    'bg-red-800 text-white',
  Overridden:'bg-purple-700 text-white',
};

interface StatusBadgeProps {
  status: ChargerStatus | BookingState;
  type?: 'charger' | 'booking';
  className?: string;
}

export function StatusBadge({ status, type = 'charger', className }: StatusBadgeProps) {
  const isCharger = type === 'charger';
  const style = isCharger
    ? CHARGER_STATUS_STYLES[status as ChargerStatus]
    : BOOKING_STATE_STYLES[status as BookingState];
  const label = isCharger
    ? CHARGER_STATUS_LABELS[status as ChargerStatus]
    : status.toUpperCase();

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold whitespace-nowrap',
        'min-h-[28px]',
        style,
        className,
      )}
    >
      <span className="mr-1 text-[8px]">●</span>
      {label}
    </span>
  );
}

// CSMS sync status badge
const CSMS_STYLES: Record<CsmsSyncStatus, string> = {
  Authorized:          'bg-green-700 text-white',
  AuthorizationPending:'bg-amber-600 text-white badge-pulse',
  AuthorizationFailed: 'bg-red-600 text-white',
  Revoked:             'bg-gray-600 text-white',
};

const CSMS_LABELS: Record<CsmsSyncStatus, string> = {
  Authorized:          'Authorized',
  AuthorizationPending:'Authorising...',
  AuthorizationFailed: 'Auth Failed',
  Revoked:             'Revoked',
};

interface CsmsBadgeProps {
  status: CsmsSyncStatus;
  className?: string;
}

export function CsmsSyncBadge({ status, className }: CsmsBadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium whitespace-nowrap',
        CSMS_STYLES[status],
        className,
      )}
    >
      {CSMS_LABELS[status]}
    </span>
  );
}

import { Link } from 'react-router-dom';
import {
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Booking, BookingState } from '../../types';
import { cn } from '../../lib/classNames';
import { formatRelativeTimestamp, formatTimeWindow } from '../../lib/formatters';

interface ActivityFeedProps {
  bookings: Booking[];
  limit?: number;
  className?: string;
}

const STATE_META: Record<BookingState, { icon: React.ReactNode; color: string; verb: string }> = {
  Pending:    { icon: <ClockIcon className="h-4 w-4" />,             color: 'text-amber-300 bg-amber-500/15',   verb: 'requested a booking on' },
  Confirmed:  { icon: <CheckCircleIcon className="h-4 w-4" />,       color: 'text-brand-300 bg-brand-500/15',   verb: 'confirmed a booking on' },
  Active:     { icon: <BoltIcon className="h-4 w-4" />,              color: 'text-violet-300 bg-violet-500/15', verb: 'is charging at' },
  Completed:  { icon: <CheckCircleIcon className="h-4 w-4" />,       color: 'text-emerald-300 bg-emerald-500/15', verb: 'completed a session at' },
  Cancelled:  { icon: <XCircleIcon className="h-4 w-4" />,           color: 'text-gray-300 bg-gray-500/15',     verb: 'cancelled a booking on' },
  Released:   { icon: <ArrowUturnLeftIcon className="h-4 w-4" />,    color: 'text-teal-300 bg-teal-500/15',     verb: 'released a slot on' },
  NoShow:     { icon: <XCircleIcon className="h-4 w-4" />,           color: 'text-red-300 bg-red-500/15',       verb: 'missed a booking on' },
  Overridden: { icon: <WrenchScrewdriverIcon className="h-4 w-4" />, color: 'text-orange-300 bg-orange-500/15', verb: 'had a booking overridden on' },
};

export function ActivityFeed({ bookings, limit = 6, className }: ActivityFeedProps) {
  const items = [...bookings]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);

  if (items.length === 0) {
    return (
      <div className={cn('bg-brand-800 rounded-card p-6 text-center', className)}>
        <p className="text-sm text-gray-400">No recent activity.</p>
      </div>
    );
  }

  return (
    <ol className={cn('relative space-y-3', className)} aria-label="Recent activity">
      {items.map((b) => {
        const m = STATE_META[b.state];
        return (
          <li key={b.id} className="flex gap-3 group">
            <div className={cn('h-8 w-8 shrink-0 rounded-lg flex items-center justify-center', m.color)} aria-hidden="true">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm text-gray-200 leading-snug">
                <span className="font-medium text-white">{b.userDisplayName}</span>{' '}
                <span className="text-gray-400">{m.verb}</span>{' '}
                <Link
                  to={`/bookings/${b.id}`}
                  className="font-medium text-brand-300 hover:text-brand-200 underline decoration-dotted underline-offset-2"
                >
                  {b.chargerDisplayName}
                </Link>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatTimeWindow(b.startTime, b.endTime)} · {formatRelativeTimestamp(b.updatedAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

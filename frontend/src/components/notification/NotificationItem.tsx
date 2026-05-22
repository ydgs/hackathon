import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { Notification, NotificationSeverity } from '../../types';
import { cn } from '../../lib/classNames';
import { formatRelativeTimestamp } from '../../lib/formatters';

const SEVERITY_ICON: Record<NotificationSeverity, React.FC<{ className?: string }>> = {
  Info:     InformationCircleIcon,
  Warning:  ExclamationTriangleIcon,
  Critical: ExclamationCircleIcon,
};

const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  Info:     'text-severity-info border-severity-info',
  Warning:  'text-severity-warning border-severity-warning',
  Critical: 'text-severity-critical border-severity-critical',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = SEVERITY_ICON[notification.severity];
  const colorClass = SEVERITY_COLOR[notification.severity];

  const handleClick = () => {
    if (!notification.readState && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      role="listitem"
      className={cn(
        'flex gap-3 p-4 rounded-card border-l-4 cursor-pointer',
        'transition-colors duration-150',
        notification.readState
          ? 'bg-brand-800 border-brand-700'
          : 'bg-brand-700/40 border-l-4',
        !notification.readState && colorClass.split(' ')[1],
        'hover:bg-brand-700',
      )}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      {/* Severity icon */}
      <Icon
        className={cn('h-5 w-5 shrink-0 mt-0.5', colorClass.split(' ')[0])}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className={cn('text-sm font-semibold', notification.readState ? 'text-gray-300' : 'text-white')}>
            {notification.title}
          </p>
          {!notification.readState && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-brand-400 mt-1" aria-label="Unread" />
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notification.body}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-gray-500">
            {formatRelativeTimestamp(notification.timestamp)}
          </span>
          <span className="text-xs text-gray-600">In-App</span>
          {notification.linkedBookingId && (
            <Link
              to={`/bookings/${notification.linkedBookingId}`}
              className="text-xs text-brand-300 hover:text-brand-400 underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Booking →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

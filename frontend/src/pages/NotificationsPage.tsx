import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import type { Notification } from '../types';
import { getNotifications, markNotificationRead } from '../services/notification.service';
import { NotificationItem } from '../components/notification/NotificationItem';
import { NotificationSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/classNames';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications({ unreadOnly });
      setNotifications(res.data);
    } catch {
      setError('Could not load notifications. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readState: true } : n)),
      );
    } catch {
      // Silent — mark read is best-effort
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.readState);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, readState: true })));
  };

  const unreadCount = notifications.filter((n) => !n.readState).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark all read ✓
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setUnreadOnly(false)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            !unreadOnly ? 'bg-brand-400 text-white border-brand-400' : 'border-brand-600 text-gray-300 hover:bg-brand-700',
          )}
        >
          All
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            unreadOnly ? 'bg-brand-400 text-white border-brand-400' : 'border-brand-600 text-gray-300 hover:bg-brand-700',
          )}
        >
          Unread only
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadNotifications} />}

      {loading && <NotificationSkeleton />}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          icon={<BellIcon className="w-full h-full" />}
          heading="All caught up"
          body="Booking confirmations, reminders, and alerts will appear here."
        />
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-2" role="list">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
}

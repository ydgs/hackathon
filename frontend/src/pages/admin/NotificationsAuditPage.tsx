import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import type { NotificationAuditItem } from '../../types';
import { getNotificationAudit } from '../../services/notification.service';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDatetime } from '../../lib/formatters';
import { cn } from '../../lib/classNames';
import { inputClasses } from '../../components/ui/FormField';

// MOCK: replace with GET /api/v1/notifications/audit when backend is ready
export function NotificationsAuditPage() {
  const [entries, setEntries] = useState<NotificationAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotificationAudit();
      setEntries(res.data);
    } catch {
      setError('Could not load notification audit entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter((e) =>
    !channelFilter || e.channel === channelFilter,
  );

  const deliveryStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-green-700/60 text-green-200';
      case 'Previewed': return 'bg-blue-700/60 text-blue-200';
      case 'Failed': return 'bg-red-700/60 text-red-200';
      default: return 'bg-gray-700/60 text-gray-300';
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Notification Audit</h1>

      <div className="flex gap-3 flex-wrap">
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by channel"
        >
          <option value="">All Channels</option>
          <option value="InApp">In-App</option>
          <option value="Email">Email</option>
          <option value="Teams">Teams</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading && <TableRowSkeleton rows={6} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={<BellIcon className="w-full h-full" />}
          heading="No notification audit entries"
          body="No notifications have been dispatched yet, or none match the current filter."
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-brand-800 rounded-card overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-brand-700">
                  {['Timestamp', 'Correlation ID', 'Channel', 'Trigger Event', 'Recipient', 'Delivery Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-300 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} className={cn('border-t border-brand-700/40', i % 2 === 0 ? '' : 'bg-brand-700/10')}>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">{formatDatetime(e.timestamp)}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{e.correlationId.slice(0, 12)}…</td>
                    <td className="px-4 py-3 text-gray-300">{e.channel}</td>
                    <td className="px-4 py-3 text-white">{e.triggerEvent}</td>
                    <td className="px-4 py-3 text-gray-300">{e.audienceUserDisplayName}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', deliveryStatusColor(e.deliveryStatus))}>
                        {e.deliveryStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((e) => (
              <div key={e.id} className="bg-brand-800 rounded-card p-4 space-y-1">
                <p className="text-xs font-mono text-gray-400">{formatDatetime(e.timestamp)}</p>
                <p className="text-sm font-semibold text-white">{e.triggerEvent}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">{e.channel}</span>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', deliveryStatusColor(e.deliveryStatus))}>
                    {e.deliveryStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{e.audienceUserDisplayName}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

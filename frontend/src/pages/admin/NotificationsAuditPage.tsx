import { useState, useEffect, useCallback } from 'react';
import { BellIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { NotificationAuditItem } from '../../types';
import { getNotificationAudit } from '../../services/notification.service';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';
import { formatDatetime } from '../../lib/formatters';
import { cn } from '../../lib/classNames';
import { inputClasses } from '../../components/ui/FormField';

export function NotificationsAuditPage() {
  const [entries, setEntries] = useState<NotificationAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [previewEntry, setPreviewEntry] = useState<NotificationAuditItem | null>(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const hasPreview = (e: NotificationAuditItem) =>
    e.channel !== 'InApp' && e.payload !== null;

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
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-brand-700">
                  {['Timestamp', 'Correlation ID', 'Channel', 'Trigger Event', 'Recipient', 'Delivery Status', ''].map((h, idx) => (
                    <th key={idx} className="text-left px-4 py-3 text-gray-300 font-medium whitespace-nowrap">{h}</th>
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
                    <td className="px-4 py-3">
                      {hasPreview(e) && (
                        <button
                          onClick={() => setPreviewEntry(e)}
                          className="flex items-center gap-1 text-xs text-brand-300 hover:text-white transition-colors"
                          aria-label={`Preview payload for ${e.triggerEvent}`}
                        >
                          <EyeIcon className="h-4 w-4" />
                          Preview
                        </button>
                      )}
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
                  {hasPreview(e) && (
                    <button
                      onClick={() => setPreviewEntry(e)}
                      className="flex items-center gap-1 text-xs text-brand-300 hover:text-white transition-colors"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      Preview
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">{e.audienceUserDisplayName}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Payload preview modal */}
      <Modal
        open={previewEntry !== null}
        title={previewEntry ? `${previewEntry.channel} Payload — ${previewEntry.triggerEvent}` : ''}
        onClose={() => setPreviewEntry(null)}
        className="max-w-2xl"
      >
        {previewEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-400">Channel</span>
              <span className="text-white">{previewEntry.channel}</span>
              <span className="text-gray-400">Recipient</span>
              <span className="text-white">{previewEntry.audienceUserDisplayName}</span>
              <span className="text-gray-400">Status</span>
              <span className={cn('inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-medium', deliveryStatusColor(previewEntry.deliveryStatus))}>
                {previewEntry.deliveryStatus}
              </span>
            </div>

            {previewEntry.channel === 'Email' ? (
              <div className="space-y-3">
                {'subject' in (previewEntry.payload ?? {}) && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Subject</p>
                    <p className="text-sm text-white bg-brand-700/40 rounded px-3 py-2">
                      {String((previewEntry.payload as Record<string, unknown>).subject)}
                    </p>
                  </div>
                )}
                {'body' in (previewEntry.payload ?? {}) && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Body</p>
                    <div className="text-sm text-gray-200 bg-brand-700/40 rounded px-3 py-2 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {String((previewEntry.payload as Record<string, unknown>).body)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Adaptive Card JSON</p>
                <pre className="text-xs text-gray-200 bg-brand-900/60 rounded p-3 overflow-x-auto max-h-72 overflow-y-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(previewEntry.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

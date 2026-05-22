import { useState, useEffect } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import type { AuditLogEntry } from '../../mocks/auditLogs.mock';
import { MOCK_AUDIT_LOGS } from '../../mocks/auditLogs.mock';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDatetime } from '../../lib/formatters';
import { cn } from '../../lib/classNames';
import { inputClasses } from '../../components/ui/FormField';

// MOCK: replace with GET /api/v1/audit-logs when backend is ready
export function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setLogs(MOCK_AUDIT_LOGS);
      setLoading(false);
    }, 400);
  }, []);

  const filtered = logs.filter((l) =>
    !actionFilter || l.action.toLowerCase().includes(actionFilter.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Audit Log</h1>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by action…"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={cn(inputClasses(), 'text-sm py-1.5 w-48')}
          aria-label="Filter audit log by action"
        />
      </div>

      {loading && <TableRowSkeleton rows={6} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="w-full h-full" />}
          heading="No audit entries"
          body="No actions have been recorded in this date range. Try widening the filter."
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-brand-800 rounded-card overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-brand-700">
                  {['Timestamp', 'Actor', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Source'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-300 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.id} className={cn('border-t border-brand-700/40', i % 2 === 0 ? '' : 'bg-brand-700/10')}>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">{formatDatetime(l.timestamp)}</td>
                    <td className="px-4 py-3 text-white">{l.actorUserId === 'system' ? 'System' : l.actorUserId.slice(0, 12) + '…'}</td>
                    <td className="px-4 py-3 text-gray-400">{l.actorRole}</td>
                    <td className="px-4 py-3 text-white font-medium">{l.action}</td>
                    <td className="px-4 py-3 text-gray-300">{l.entityType}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.entityId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-gray-400">{l.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((l) => (
              <div key={l.id} className="bg-brand-800 rounded-card p-4 space-y-1">
                <p className="text-xs font-mono text-gray-400">{formatDatetime(l.timestamp)}</p>
                <p className="text-sm font-semibold text-white">{l.action}</p>
                <p className="text-xs text-gray-400">{l.actorRole} · {l.entityType}</p>
                {l.reason && <p className="text-xs text-gray-500">"{l.reason}"</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

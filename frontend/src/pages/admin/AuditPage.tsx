import { useState, useEffect, useMemo, useCallback } from 'react';
import { ClipboardDocumentListIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAuditLogs, type AuditLogEntry } from '../../services/audit.service';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { inputClasses } from '../../components/ui/FormField';
import { formatDatetime } from '../../lib/formatters';
import { cn } from '../../lib/classNames';

// Static option lists — drive dropdowns. Keeps the page resilient when filters return no rows.
const ACTION_OPTIONS = [
  'BookingCreated',
  'BookingCancelled',
  'BookingReleased',
  'BookingCompleted',
  'BookingOnBehalfCreated',
  'ChargerStatusChanged',
  'MaintenanceBlockCreated',
  'MaintenanceBlockRemoved',
  'CsmsAuthorizationFailed',
  'CapOverrideApplied',
  'SystemConfigUpdated',
];

const ENTITY_TYPE_OPTIONS = ['Booking', 'Charger', 'MaintenanceBlock', 'EligibleUser', 'SystemConfig'];

const SOURCE_OPTIONS = ['User', 'Admin', 'System', 'Csms'];

interface Filters {
  dateFrom: string;
  dateTo: string;
  actor: string;
  action: string;
  entityType: string;
  source: string;
}

const EMPTY_FILTERS: Filters = {
  dateFrom: '',
  dateTo: '',
  actor: '',
  action: '',
  entityType: '',
  source: '',
};

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAuditLogs({
        // Convert HTML date inputs (yyyy-mm-dd) to ISO ranges covering the full day
        dateFrom: filters.dateFrom ? `${filters.dateFrom}T00:00:00Z` : undefined,
        dateTo: filters.dateTo ? `${filters.dateTo}T23:59:59Z` : undefined,
        actorUserId: filters.actor || undefined,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        source: filters.source || undefined,
        limit: 100,
      });
      setLogs(res.data);
      setTotal(res.pagination.total);
    } catch {
      setError('Could not load audit log. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-xs text-gray-500 mt-1">
            Immutable record of every privileged action.{' '}
            {!loading && <span>{total} {total === 1 ? 'entry' : 'entries'}</span>}
          </p>
        </div>
        <div className="md:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileFiltersOpen((o) => !o)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="audit-filters"
          >
            <FunnelIcon className="h-4 w-4" aria-hidden="true" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        id="audit-filters"
        className={cn(
          'bg-brand-800/50 rounded-card p-4 space-y-3',
          'md:block',
          mobileFiltersOpen ? 'block' : 'hidden md:block',
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Date range */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="audit-date-from">
              Date from
            </label>
            <input
              id="audit-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter('dateFrom', e.target.value)}
              className={cn(inputClasses(), 'text-sm py-1.5')}
              aria-label="Filter by start date"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="audit-date-to">
              Date to
            </label>
            <input
              id="audit-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter('dateTo', e.target.value)}
              className={cn(inputClasses(), 'text-sm py-1.5')}
              aria-label="Filter by end date"
            />
          </div>

          {/* Actor */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="audit-actor">
              Actor
            </label>
            <input
              id="audit-actor"
              type="text"
              placeholder="Role or user ID…"
              value={filters.actor}
              onChange={(e) => setFilter('actor', e.target.value)}
              className={cn(inputClasses(), 'text-sm py-1.5')}
              aria-label="Filter by actor user ID or role"
            />
          </div>

          {/* Action */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="audit-action">
              Action type
            </label>
            <select
              id="audit-action"
              value={filters.action}
              onChange={(e) => setFilter('action', e.target.value)}
              className={cn(inputClasses(), 'text-sm py-1.5')}
              aria-label="Filter by action type"
            >
              <option value="">All actions</option>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Entity type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="audit-entity">
              Entity type
            </label>
            <select
              id="audit-entity"
              value={filters.entityType}
              onChange={(e) => setFilter('entityType', e.target.value)}
              className={cn(inputClasses(), 'text-sm py-1.5')}
              aria-label="Filter by entity type"
            >
              <option value="">All entities</option>
              {ENTITY_TYPE_OPTIONS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="audit-source">
              Source
            </label>
            <select
              id="audit-source"
              value={filters.source}
              onChange={(e) => setFilter('source', e.target.value)}
              className={cn(inputClasses(), 'text-sm py-1.5')}
              aria-label="Filter by source"
            >
              <option value="">All sources</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Clear filters ({activeFilterCount})
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading && <TableRowSkeleton rows={6} />}

      {!loading && !error && logs.length === 0 && (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="w-full h-full" />}
          heading={activeFilterCount > 0 ? 'No entries match your filters' : 'No audit entries'}
          body={
            activeFilterCount > 0
              ? 'Try widening the date range or removing some filters.'
              : 'Privileged actions will appear here as they happen.'
          }
          ctaLabel={activeFilterCount > 0 ? 'Clear filters' : undefined}
          onCta={activeFilterCount > 0 ? clearFilters : undefined}
        />
      )}

      {!loading && logs.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-brand-800 rounded-card overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-brand-700">
                  {['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Source', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-300 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr
                    key={l.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(l)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(l);
                      }
                    }}
                    className={cn(
                      'border-t border-brand-700/40 cursor-pointer hover:bg-brand-700/30 focus:bg-brand-700/30 focus:outline-none',
                      i % 2 === 0 ? '' : 'bg-brand-700/10',
                    )}
                    aria-label={`View details for ${l.action} on ${l.entityType} ${l.entityId}`}
                  >
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">
                      {formatDatetime(l.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {l.actorUserId === 'system'
                        ? 'System'
                        : l.actorUserId.slice(0, 12) + (l.actorUserId.length > 12 ? '…' : '')}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{l.actorRole}</td>
                    <td className="px-4 py-3 text-white font-medium">{l.action}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="text-gray-300">{l.entityType}</span>
                      <span className="text-gray-500 font-mono text-xs ml-1">
                        {l.entityId.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{l.source}</td>
                    <td className="px-4 py-3 text-right text-xs text-brand-300">View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {logs.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelected(l)}
                className="w-full bg-brand-800 rounded-card p-4 text-left space-y-1 hover:bg-brand-700/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
                aria-label={`View details for ${l.action}`}
              >
                <p className="text-xs font-mono text-gray-400">{formatDatetime(l.timestamp)}</p>
                <p className="text-sm font-semibold text-white">{l.action}</p>
                <p className="text-xs text-gray-400">
                  {l.actorRole} · {l.entityType} · {l.source}
                </p>
                {l.reason && <p className="text-xs text-gray-500 truncate">"{l.reason}"</p>}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Drill-through diff modal */}
      <Modal
        open={!!selected}
        title={selected ? `${selected.action}` : ''}
        onClose={() => setSelected(null)}
        className="md:max-w-2xl"
      >
        {selected && <AuditDiffView entry={selected} />}
      </Modal>
    </div>
  );
}

// ── Diff view ────────────────────────────────────────────────────────────────
function AuditDiffView({ entry }: { entry: AuditLogEntry }) {
  return (
    <div className="space-y-4">
      {/* Metadata header */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-gray-500">Timestamp</dt>
          <dd className="text-gray-200 font-mono">{formatDatetime(entry.timestamp)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Source</dt>
          <dd className="text-gray-200">{entry.source}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Actor</dt>
          <dd className="text-gray-200 font-mono break-all">
            {entry.actorUserId} <span className="text-gray-500">({entry.actorRole})</span>
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Entity</dt>
          <dd className="text-gray-200">
            {entry.entityType}{' '}
            <span className="font-mono text-gray-400 break-all">{entry.entityId}</span>
          </dd>
        </div>
      </dl>

      {entry.reason && (
        <div className="bg-brand-700/30 border border-brand-700 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-400 mb-1">Reason</p>
          <p className="text-sm text-gray-200">{entry.reason}</p>
        </div>
      )}

      {/* Before / after diff */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2">State change</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DiffPane label="Before" state={entry.beforeState} tone="red" />
          <DiffPane label="After" state={entry.afterState} tone="green" />
        </div>
      </div>

      <p className="text-[11px] text-gray-500 text-center pt-2 border-t border-brand-700">
        Audit entries are immutable. Edits and deletions are not permitted.
      </p>
    </div>
  );
}

function DiffPane({ label, state, tone }: { label: string; state: string | null; tone: 'red' | 'green' }) {
  const formatted = useMemo(() => prettyJson(state), [state]);
  const toneClasses =
    tone === 'red'
      ? 'border-red-700/40 bg-red-900/20'
      : 'border-emerald-700/40 bg-emerald-900/20';
  return (
    <div className={cn('rounded-lg border p-3', toneClasses)}>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-1.5">
        {label}
      </p>
      {state == null ? (
        <p className="text-xs italic text-gray-500">— none —</p>
      ) : (
        <pre className="text-xs font-mono text-gray-100 whitespace-pre-wrap break-all leading-snug">
          {formatted}
        </pre>
      )}
    </div>
  );
}

function prettyJson(raw: string | null): string {
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

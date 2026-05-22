import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, FunnelIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Charger, ChargerStatus } from '../types';
import { getChargers, updateChargerStatus } from '../services/charger.service';
import { ChargerCard } from '../components/charger/ChargerCard';
import { ChargerCardSkeleton } from '../components/ui/LoadingSkeleton';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField, inputClasses } from '../components/ui/FormField';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatRelativeTimestamp } from '../lib/formatters';
import { cn } from '../lib/classNames';

type LocationFilter = '' | 'NEX-TOWER' | 'NEXTERACOM';
const STATUS_OPTIONS: ChargerStatus[] = ['Available', 'Reserved', 'Charging', 'BlockedForMaintenance', 'Unavailable', 'Faulted'];

export function ChargersPage() {
  const navigate = useNavigate();
  const { isOperator } = useAuth();
  const { showToast } = useToast();

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('');
  const [statusFilters, setStatusFilters] = useState<Set<ChargerStatus>>(new Set());
  const [connectorFilter, setConnectorFilter] = useState<string>('');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [statusModal, setStatusModal] = useState<{ open: boolean; charger: Charger | null }>({ open: false, charger: null });
  const [newStatus, setNewStatus] = useState<string>('Unavailable');
  const [statusReason, setStatusReason] = useState('');
  const [statusReasonError, setStatusReasonError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchChargers = useCallback(async (silent = false) => {
    try {
      const res = await getChargers();
      setChargers(res.data);
      const latest = res.data.reduce((acc, c) => (c.lastCsmsSyncAt > acc ? c.lastCsmsSyncAt : acc), '');
      setLastSync(latest);
      if (!silent) setLoading(false);
      setError('');
    } catch {
      if (!silent) setLoading(false);
      setError('Live charger data temporarily unavailable — showing last known status.');
    }
  }, []);

  useEffect(() => {
    fetchChargers(false);
    pollRef.current = setInterval(() => fetchChargers(true), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchChargers]);

  const filtered = chargers.filter((c) => {
    if (locationFilter && c.location.code !== locationFilter) return false;
    if (statusFilters.size > 0 && !statusFilters.has(c.status)) return false;
    if (connectorFilter && c.connectorType !== connectorFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!c.displayName.toLowerCase().includes(q) && !c.externalStationId.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const grouped: Record<string, Charger[]> = {};
  for (const c of filtered) {
    if (!grouped[c.location.name]) grouped[c.location.name] = [];
    grouped[c.location.name].push(c);
  }
  const statusOrder: Record<ChargerStatus, number> = {
    Available: 0, Reserved: 1, Charging: 2, BlockedForMaintenance: 3, Unavailable: 4, Faulted: 5,
  };
  for (const loc in grouped) grouped[loc].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const handleBook = (charger: Charger) => navigate(`/bookings/new?chargerId=${charger.id}`);

  const handleStatusChange = (charger: Charger) => {
    setStatusModal({ open: true, charger });
    setNewStatus('Unavailable');
    setStatusReason('');
    setStatusReasonError('');
  };

  const handleStatusUpdate = async () => {
    if (!statusReason.trim()) { setStatusReasonError('A reason is required to change charger status.'); return; }
    if (!statusModal.charger) return;
    setStatusLoading(true);
    try {
      await updateChargerStatus(statusModal.charger.id, newStatus, statusReason);
      await fetchChargers(true);
      setStatusModal({ open: false, charger: null });
      showToast('success', 'Charger status updated.');
    } catch {
      showToast('error', 'Failed to update charger status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const toggleStatusFilter = (s: ChargerStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const totals = {
    available: chargers.filter((c) => c.status === 'Available').length,
    reserved:  chargers.filter((c) => c.status === 'Reserved').length,
    charging:  chargers.filter((c) => c.status === 'Charging').length,
    issues:    chargers.filter((c) => c.status === 'Faulted' || c.status === 'BlockedForMaintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Charger availability</h1>
          <p className="mt-1 text-sm text-gray-400">
            Live view across all bays.{' '}
            {lastSync && <span>Last sync {formatRelativeTimestamp(lastSync)}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchChargers(false)}
            aria-label="Refresh charger data"
            className="p-2 rounded-lg text-gray-400 hover:bg-brand-700 hover:text-white transition-colors border border-brand-700/60"
          >
            <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <Button variant="primary" size="md" onClick={() => navigate('/bookings/new')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Book a charger
          </Button>
        </div>
      </div>

      {/* Mini summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryPill label="Available" value={totals.available} dot="bg-emerald-400" />
        <SummaryPill label="Reserved"  value={totals.reserved}  dot="bg-brand-300" />
        <SummaryPill label="Charging"  value={totals.charging}  dot="bg-violet-400" />
        <SummaryPill label="Issues"    value={totals.issues}    dot="bg-red-400" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by charger name…"
            aria-label="Search chargers"
            className={cn(inputClasses(), 'pl-8 py-1.5 text-sm')}
          />
        </div>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by location"
        >
          <option value="">All locations</option>
          <option value="NEX-TOWER">NEX Tower</option>
          <option value="NEXTERACOM">NEXTERACOM</option>
        </select>

        <select
          value={connectorFilter}
          onChange={(e) => setConnectorFilter(e.target.value)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by connector type"
        >
          <option value="">All connectors</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
        </select>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-600 text-sm text-gray-300 hover:bg-brand-700"
          aria-label="Open status filters"
        >
          <FunnelIcon className="h-4 w-4" aria-hidden="true" />
          Status {statusFilters.size > 0 && `(${statusFilters.size})`}
        </button>

        <div className={cn('hidden md:flex flex-wrap gap-2', filtersOpen && '!flex')}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatusFilter(s)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                statusFilters.has(s)
                  ? 'bg-brand-400 text-white border-brand-400'
                  : 'border-brand-600 text-gray-300 hover:bg-brand-700',
              )}
            >
              {s}
            </button>
          ))}
          {statusFilters.size > 0 && (
            <button
              onClick={() => setStatusFilters(new Set())}
              className="px-3 py-1 rounded-full text-xs text-red-400 border border-red-700 hover:bg-red-900/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-900/40 border border-amber-600/50 rounded-lg text-sm text-amber-300">
          {error}
        </div>
      )}

      {loading && <ChargerCardSkeleton />}

      {!loading && (
        <>
          {Object.keys(grouped).length === 0 ? (
            <EmptyState
              heading="No chargers match your filter"
              body="Try a different location or clear status filters."
              ctaLabel="Clear filters"
              onCta={() => { setLocationFilter(''); setStatusFilters(new Set()); setConnectorFilter(''); setQuery(''); }}
            />
          ) : (
            Object.entries(grouped).map(([location, locationChargers]) => (
              <div key={location}>
                <div className="flex items-baseline justify-between mb-3 mt-4 first:mt-0">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">{location}</h2>
                  <span className="text-xs text-gray-500">{locationChargers.length} chargers</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {locationChargers.map((charger) => (
                    <ChargerCard
                      key={charger.id}
                      charger={charger}
                      isAdmin={isOperator}
                      onBook={handleBook}
                      onStatusChange={isOperator ? handleStatusChange : undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Status change modal */}
      <Modal
        open={statusModal.open}
        title={`Update charger status — ${statusModal.charger?.displayName ?? ''}`}
        onClose={() => setStatusModal({ open: false, charger: null })}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Current: <span className="font-semibold text-white">{statusModal.charger?.status}</span>
          </p>

          <FormField label="New status" htmlFor="new-status" required>
            <fieldset>
              <legend className="sr-only">Select new charger status</legend>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['Available', 'Unavailable', 'Faulted', 'BlockedForMaintenance'] as ChargerStatus[]).map((s) => (
                  <label
                    key={s}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm',
                      newStatus === s
                        ? 'border-brand-400 bg-brand-700 text-white'
                        : 'border-brand-600 text-gray-300 hover:bg-brand-700',
                    )}
                  >
                    <input
                      type="radio"
                      name="new-status"
                      value={s}
                      checked={newStatus === s}
                      onChange={() => setNewStatus(s)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
          </FormField>

          <FormField label="Reason" htmlFor="status-reason" error={statusReasonError} required>
            <textarea
              id="status-reason"
              value={statusReason}
              onChange={(e) => {
                setStatusReason(e.target.value);
                if (e.target.value.trim()) setStatusReasonError('');
              }}
              rows={2}
              aria-required="true"
              aria-describedby={statusReasonError ? 'status-reason-error' : undefined}
              className={cn(inputClasses(!!statusReasonError), 'resize-none')}
              placeholder="Enter reason for status change…"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" loading={statusLoading} onClick={handleStatusUpdate} className="flex-1">
              Update status
            </Button>
            <Button variant="secondary" size="md" onClick={() => setStatusModal({ open: false, charger: null })}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryPill({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-700/50 bg-brand-800/60 px-4 py-3">
      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', dot)} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none tabular-nums">{value}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

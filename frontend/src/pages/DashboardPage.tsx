import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Charger, ChargerStatus } from '../types';
import { getChargers, updateChargerStatus } from '../services/charger.service';
import { ChargerCard } from '../components/charger/ChargerCard';
import { ChargerCardSkeleton } from '../components/ui/LoadingSkeleton';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField, inputClasses } from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatRelativeTimestamp } from '../lib/formatters';
import { cn } from '../lib/classNames';

type LocationFilter = '' | 'NEX-TOWER' | 'NEXTERACOM';
const STATUS_OPTIONS: ChargerStatus[] = ['Available', 'Reserved', 'Charging', 'BlockedForMaintenance', 'Unavailable', 'Faulted'];

export function DashboardPage() {
  const navigate = useNavigate();
  const { isOperator } = useAuth();
  const { showToast } = useToast();

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('');
  const [statusFilters, setStatusFilters] = useState<Set<ChargerStatus>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Status change modal
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
      const latest = res.data.reduce((acc, c) => {
        return c.lastCsmsSyncAt > acc ? c.lastCsmsSyncAt : acc;
      }, '');
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
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchChargers]);

  // Client-side filtering
  const filtered = chargers.filter((c) => {
    if (locationFilter && c.location.code !== locationFilter) return false;
    if (statusFilters.size > 0 && !statusFilters.has(c.status)) return false;
    return true;
  });

  const grouped: Record<string, Charger[]> = {};
  for (const c of filtered) {
    const loc = c.location.name;
    if (!grouped[loc]) grouped[loc] = [];
    grouped[loc].push(c);
  }

  // Sort: Available first, Faulted last
  const statusOrder: Record<ChargerStatus, number> = {
    Available: 0, Reserved: 1, Charging: 2,
    BlockedForMaintenance: 3, Unavailable: 4, Faulted: 5,
  };
  for (const loc in grouped) {
    grouped[loc].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }

  const handleBook = (charger: Charger) => {
    navigate(`/bookings/new?chargerId=${charger.id}`);
  };

  const handleStatusChange = (charger: Charger) => {
    setStatusModal({ open: true, charger });
    setNewStatus('Unavailable');
    setStatusReason('');
    setStatusReasonError('');
  };

  const handleStatusUpdate = async () => {
    if (!statusReason.trim()) {
      setStatusReasonError('A reason is required to change charger status.');
      return;
    }
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
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">EV Charging Availability</h1>
          {lastSync && (
            <p className="text-xs text-gray-400 mt-1">
              Last synced: {formatRelativeTimestamp(lastSync)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchChargers(false)}
            aria-label="Refresh charger data"
            className="p-2 rounded-lg text-gray-400 hover:bg-brand-700 hover:text-white transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/bookings/new')}
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Book a Charger
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Desktop filters */}
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          <option value="NEX-TOWER">NEX Tower</option>
          <option value="NEXTERACOM">NEXTERACOM</option>
        </select>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-600 text-sm text-gray-300 hover:bg-brand-700"
          aria-label="Open filters"
        >
          <FunnelIcon className="h-4 w-4" aria-hidden="true" />
          Filters {statusFilters.size > 0 && `(${statusFilters.size})`}
        </button>

        {/* Status chips - desktop always shown, mobile in drawer */}
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

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-900/40 border border-amber-600/50 rounded-lg text-sm text-amber-300">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <ChargerCardSkeleton />}

      {/* Charger grid */}
      {!loading && (
        <>
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No chargers match your filter.</p>
              <button
                onClick={() => {
                  setLocationFilter('');
                  setStatusFilters(new Set());
                }}
                className="mt-2 text-brand-300 text-sm underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([location, locationChargers]) => (
              <div key={location}>
                <h2 className="text-base font-semibold text-gray-300 mb-3 mt-4 first:mt-0">
                  {location}
                </h2>
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
        title={`Update Charger Status — ${statusModal.charger?.displayName ?? ''}`}
        onClose={() => setStatusModal({ open: false, charger: null })}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Current:{' '}
            <span className="font-semibold text-white">{statusModal.charger?.status}</span>
          </p>

          <FormField label="New Status" htmlFor="new-status" required>
            <fieldset>
              <legend className="sr-only">Select new charger status</legend>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['Available', 'Unavailable', 'Faulted', 'BlockedForMaintenance'] as ChargerStatus[]).map(
                  (s) => (
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
                  ),
                )}
              </div>
            </fieldset>
          </FormField>

          <FormField
            label="Reason"
            htmlFor="status-reason"
            error={statusReasonError}
            required
          >
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
            <Button
              variant="primary"
              size="md"
              loading={statusLoading}
              onClick={handleStatusUpdate}
              className="flex-1"
            >
              Update Status
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStatusModal({ open: false, charger: null })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

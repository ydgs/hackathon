import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, TableCellsIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../types';
import { getBookings, releaseBooking } from '../services/booking.service';
import { StatusBadge, CsmsSyncBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField, inputClasses } from '../components/ui/FormField';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { TableRowSkeleton } from '../components/ui/LoadingSkeleton';
import { useToast } from '../hooks/useToast';
import { formatTimeWindow } from '../lib/formatters';
import { cn } from '../lib/classNames';
import { BookingGanttChart } from '../components/booking/BookingGanttChart';

type ViewMode = 'table' | 'gantt';

/** Maximum days ahead that can be viewed in operations. */
const OPS_DATE_WINDOW_DAYS = 14;

function getTodayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function offsetDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateLabel(isoDate: string): string {
  const today = getTodayIso();
  const tomorrow = offsetDate(today, 1);
  if (isoDate === today) return 'Today';
  if (isoDate === tomorrow) return 'Tomorrow';
  return new Date(isoDate + 'T12:00:00Z').toLocaleDateString('en-MU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'Indian/Mauritius',
  });
}

export function OperationsBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [error, setError] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [search, setSearch] = useState('');

  // Date navigation — operations can view any day within the booking window
  const [selectedDateIso, setSelectedDateIso] = useState(getTodayIso());

  const [releaseModal, setReleaseModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dateFrom = `${selectedDateIso}T00:00:00Z`;
      const dateTo   = `${selectedDateIso}T23:59:59Z`;
      const res = await getBookings({ dateFrom, dateTo, limit: 100 });
      setBookings(res.data);
    } catch {
      setError('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, [selectedDateIso]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const todayIso = getTodayIso();
  const minDateIso = todayIso;
  const maxDateIso = offsetDate(todayIso, OPS_DATE_WINDOW_DAYS - 1);
  const canGoPrev = selectedDateIso > minDateIso;
  const canGoNext = selectedDateIso < maxDateIso;

  const handlePrevDay = () => {
    if (canGoPrev) setSelectedDateIso((d) => offsetDate(d, -1));
  };
  const handleNextDay = () => {
    if (canGoNext) setSelectedDateIso((d) => offsetDate(d, 1));
  };

  const filtered = bookings.filter((b) => {
    if (locationFilter && b.locationCode !== locationFilter) return false;
    if (stateFilter && b.state !== stateFilter) return false;
    if (search && !b.userDisplayName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRelease = async () => {
    if (!reason.trim()) {
      setReasonError('A reason is required to release this booking.');
      return;
    }
    if (!releaseModal.booking) return;
    setActionLoading(true);
    try {
      await releaseBooking(releaseModal.booking.id, { reason });
      showToast('success', 'Booking released. Charger is now available.');
      setReleaseModal({ open: false, booking: null });
      await loadBookings();
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string } };
      showToast('error', e.apiError?.message ?? 'Release failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Operations — Bookings</h1>
          {/* Date navigation */}
          <div className="flex items-center gap-1 bg-brand-800 rounded-lg p-1 border border-brand-700">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={!canGoPrev}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                canGoPrev ? 'text-gray-300 hover:bg-brand-700 hover:text-white' : 'text-gray-600 cursor-not-allowed',
              )}
              aria-label="Previous day"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="px-2 text-sm font-semibold text-white whitespace-nowrap min-w-[120px] text-center">
              {formatDateLabel(selectedDateIso)}
              {selectedDateIso !== todayIso && (
                <span className="text-xs font-normal text-gray-400 block">{selectedDateIso}</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleNextDay}
              disabled={!canGoNext}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                canGoNext ? 'text-gray-300 hover:bg-brand-700 hover:text-white' : 'text-gray-600 cursor-not-allowed',
              )}
              aria-label="Next day"
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            {selectedDateIso !== todayIso && (
              <button
                type="button"
                onClick={() => setSelectedDateIso(todayIso)}
                className="ml-1 px-2 py-1 rounded-md text-xs text-brand-300 hover:bg-brand-700 hover:text-white transition-colors border border-brand-600/60"
              >
                Today
              </button>
            )}
          </div>
        </div>
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-brand-800 rounded-lg p-1 border border-brand-700">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'table'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white',
            )}
            aria-pressed={viewMode === 'table'}
          >
            <TableCellsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('gantt')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'gantt'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white',
            )}
            aria-pressed={viewMode === 'gantt'}
          >
            <ChartBarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gantt</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          <option value="NEX-TOWER">NEX Tower</option>
          <option value="NEXTERACOM">NEXTERACOM</option>
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {['Confirmed', 'Active', 'Completed', 'Cancelled', 'Released', 'NoShow'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search user…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(inputClasses(), 'text-sm py-1.5 w-40')}
          aria-label="Search by user name"
        />
      </div>

      {error && <ErrorBanner message={error} onRetry={loadBookings} />}

      {loading && <TableRowSkeleton rows={5} />}

      {!loading && !error && filtered.length === 0 && viewMode === 'table' && (
        <EmptyState
          icon={<CalendarIcon className="w-full h-full" />}
          heading="No bookings match your filter"
          body="Try changing the location or status filter, or check a different date."
          ctaLabel="Clear Filters"
          onCta={() => { setLocationFilter(''); setStateFilter(''); setSearch(''); }}
        />
      )}

      {/* ── Gantt view ─────────────────────────────────────── */}
      {!loading && !error && viewMode === 'gantt' && (
        <BookingGanttChart
          bookings={filtered}
          selectedDate={selectedDateIso}
          onBookingCreated={loadBookings}
        />
      )}

      {!loading && filtered.length > 0 && viewMode === 'table' && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-brand-800 rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-700">
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Charger</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Time</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">State</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">CSMS</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} className={cn('border-t border-brand-700/40', i % 2 === 0 ? '' : 'bg-brand-700/10')}>
                    <td className="px-4 py-3 text-white">{b.userDisplayName}</td>
                    <td className="px-4 py-3 text-gray-300">{b.chargerDisplayName}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                      {formatTimeWindow(b.startTime, b.endTime)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.state} type="booking" /></td>
                    <td className="px-4 py-3"><CsmsSyncBadge status={b.csmsSyncStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/bookings/${b.id}`}>
                          <Button variant="ghost" size="sm">Detail</Button>
                        </Link>
                        {b.state === 'Active' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setReleaseModal({ open: true, booking: b });
                              setReason('');
                              setReasonError('');
                            }}
                          >
                            Release
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="bg-brand-800 rounded-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{b.userDisplayName}</p>
                  <StatusBadge status={b.state} type="booking" />
                </div>
                <p className="text-xs text-gray-400">
                  {b.chargerDisplayName} · {formatTimeWindow(b.startTime, b.endTime)}
                </p>
                <CsmsSyncBadge status={b.csmsSyncStatus} />
                <div className="flex gap-2 pt-1">
                  <Link to={`/bookings/${b.id}`}>
                    <Button variant="ghost" size="sm">Detail</Button>
                  </Link>
                  {b.state === 'Active' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setReleaseModal({ open: true, booking: b });
                        setReason('');
                        setReasonError('');
                      }}
                    >
                      Release
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Release modal */}
      <Modal
        open={releaseModal.open}
        title="Release Booking"
        onClose={() => setReleaseModal({ open: false, booking: null })}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Release booking for{' '}
            <span className="font-semibold text-white">{releaseModal.booking?.userDisplayName}</span>
            {' '}on {releaseModal.booking?.chargerDisplayName}?
          </p>
          <p className="text-xs text-gray-400">This action will be audit-logged. CSMS authorization will be revoked.</p>

          <FormField label="Reason" htmlFor="op-release-reason" error={reasonError} required>
            <textarea
              id="op-release-reason"
              value={reason}
              onChange={(e) => { setReason(e.target.value); setReasonError(''); }}
              rows={2}
              aria-required="true"
              className={cn(inputClasses(!!reasonError), 'resize-none')}
              placeholder="Required reason for operator release…"
            />
          </FormField>

          <div className="flex gap-3 pt-1">
            <Button variant="primary" size="md" loading={actionLoading} onClick={handleRelease} className="flex-1">
              Confirm Release
            </Button>
            <Button variant="secondary" size="md" onClick={() => setReleaseModal({ open: false, booking: null })}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

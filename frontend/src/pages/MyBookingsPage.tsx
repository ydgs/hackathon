import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../types';
import { getBookings, cancelBooking, releaseBooking } from '../services/booking.service';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingCardSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FormField, inputClasses } from '../components/ui/FormField';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../lib/formatters';
import { cn } from '../lib/classNames';

type ModalMode = 'cancel' | 'release' | null;

export function MyBookingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBookings({ limit: 100 });
      // Filter to current user's bookings
      const mine = res.data.filter(
        (b) => !currentUser || b.userId === currentUser.id || currentUser.role !== 'StandardUser',
      );
      setBookings(mine);
    } catch {
      setError('Could not load your bookings. Tap to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  // Group by date
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const getDateGroup = (iso: string): string => {
    const d = iso.split('T')[0];
    if (d === today) return 'Today';
    if (d === yesterday) return 'Yesterday';
    return formatDate(iso);
  };

  const grouped: Record<string, Booking[]> = {};
  for (const b of [...bookings].sort(
    (a, b2) => new Date(b2.startTime).getTime() - new Date(a.startTime).getTime(),
  )) {
    const g = getDateGroup(b.startTime);
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(b);
  }

  const openCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalMode('cancel');
    setReason('');
    setActionError('');
  };

  const openRelease = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalMode('release');
    setReason('');
    setActionError('');
  };

  const handleAction = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionError('');
    try {
      if (modalMode === 'cancel') {
        await cancelBooking(selectedBooking.id, { reason: reason || undefined });
        showToast('success', 'Booking cancelled.');
      } else {
        await releaseBooking(selectedBooking.id, { reason: reason || undefined });
        showToast('success', 'Booking released. Charger is now available.');
      }
      setModalMode(null);
      await loadBookings();
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string } };
      setActionError(e.apiError?.message ?? 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
        </div>
        <BookingCardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">My Bookings</h1>
        <Button variant="primary" size="md" onClick={() => navigate('/bookings/new')}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Book
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadBookings} />}

      {!error && bookings.length === 0 && (
        <EmptyState
          icon={<CalendarIcon className="w-full h-full" />}
          heading="No bookings yet"
          body="Book a charging slot to get started."
          ctaLabel="Book a Charger"
          onCta={() => navigate('/bookings/new')}
        />
      )}

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <span>{group}</span>
            <span className="flex-1 h-px bg-brand-700" />
          </h2>
          <div className="space-y-3">
            {items.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={openCancel}
                onRelease={openRelease}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Cancel / Release modal */}
      <Modal
        open={!!modalMode}
        title={modalMode === 'cancel' ? 'Cancel Booking' : 'Release Booking'}
        onClose={() => setModalMode(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            {modalMode === 'cancel'
              ? `Are you sure you want to cancel your booking for ${selectedBooking?.chargerDisplayName}?`
              : `Release your booking for ${selectedBooking?.chargerDisplayName}?`}
          </p>
          <p className="text-xs text-gray-400">
            The slot will be freed immediately. CSMS authorization will be revoked.
          </p>

          <FormField label="Reason (optional)" htmlFor="action-reason">
            <textarea
              id="action-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className={cn(inputClasses(), 'resize-none')}
              placeholder="Optional reason…"
            />
          </FormField>

          {actionError && <ErrorBanner message={actionError} dismissable />}

          <div className="flex gap-3 pt-1">
            <Button
              variant={modalMode === 'cancel' ? 'destructive' : 'primary'}
              size="md"
              loading={actionLoading}
              onClick={handleAction}
              className="flex-1"
            >
              {modalMode === 'cancel' ? 'Confirm Cancel' : 'Confirm Release'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setModalMode(null)}
            >
              Keep Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

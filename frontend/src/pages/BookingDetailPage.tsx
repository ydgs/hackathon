import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, BoltIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../types';
import { getBooking, cancelBooking, releaseBooking } from '../services/booking.service';
import { StatusBadge, CsmsSyncBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField, inputClasses } from '../components/ui/FormField';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { SimulatedDataLabel } from '../components/ui/SimulatedDataLabel';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDatetime, formatTimeWindow, formatKwh } from '../lib/formatters';
import { cn } from '../lib/classNames';

type ActionMode = 'cancel' | 'release' | null;

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isOperator } = useAuth();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState<ActionMode>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const b = await getBooking(id);
      setBooking(b);
    } catch {
      setError('Could not load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    if (!booking) return;
    setActionLoading(true);
    setActionError('');
    try {
      if (modalMode === 'cancel') {
        await cancelBooking(booking.id, { reason: reason || undefined });
        showToast('success', 'Booking cancelled.');
        navigate(-1);
      } else {
        await releaseBooking(booking.id, { reason: reason || undefined });
        showToast('success', 'Booking released.');
        await load();
      }
      setModalMode(null);
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string } };
      setActionError(e.apiError?.message ?? 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const backLabel = isOperator ? 'Operations' : 'My Bookings';
  const backPath = isOperator ? '/operations/bookings' : '/my-bookings';

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="bg-brand-800 rounded-card p-6 space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-brand-800 rounded-card p-6 text-center space-y-4">
          <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto" aria-hidden="true" />
          <p className="text-white font-semibold">Something went wrong</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <Button variant="primary" onClick={load}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isOwner = currentUser?.id === booking.userId;
  const canCancel = (isOwner || isOperator) && (booking.state === 'Confirmed' || booking.state === 'Pending');
  const canRelease = booking.state === 'Active';

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Link to={backPath} className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-400">
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div className="bg-brand-800 rounded-card border border-brand-700/40 p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-white">{booking.chargerDisplayName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {formatTimeWindow(booking.startTime, booking.endTime)}
              {' · '}
              {booking.vehicleMake} {booking.vehicleModel}
            </p>
          </div>
          <StatusBadge status={booking.state} type="booking" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">CSMS:</span>
          <CsmsSyncBadge status={booking.csmsSyncStatus} />
        </div>

        {/* Session block */}
        {booking.chargingSession && (
          <div className="bg-brand-700/30 rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <BoltIcon className="h-4 w-4 text-brand-400" aria-hidden="true" />
              Charging Session
            </h2>
            <StatusBadge status={booking.chargingSession.state as 'Active'} type="booking" />
            <div className="text-xs text-gray-300 space-y-1 mt-2">
              <p>Started: {formatDatetime(booking.chargingSession.startTime)}</p>
              {booking.chargingSession.energyKwh > 0 && (
                <p>Energy: {formatKwh(booking.chargingSession.energyKwh)}</p>
              )}
              <p>Source: {booking.chargingSession.source}</p>
            </div>
            {booking.chargingSession.source === 'CSMS-Simulator' && (
              <SimulatedDataLabel label="Based on simulated demo data" className="mt-2" />
            )}
          </div>
        )}

        {/* Action buttons */}
        {(canCancel || canRelease) && (
          <div className="flex gap-3 pt-2 border-t border-brand-700">
            {canCancel && (
              <Button
                variant="destructive"
                size="md"
                onClick={() => { setModalMode('cancel'); setReason(''); setActionError(''); }}
              >
                Cancel Booking
              </Button>
            )}
            {canRelease && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => { setModalMode('release'); setReason(''); setActionError(''); }}
              >
                {isOperator ? 'Release (Operator)' : 'Release'}
              </Button>
            )}
          </div>
        )}

        {/* Metadata */}
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-300 select-none">Booking details</summary>
          <div className="mt-3 space-y-1 text-gray-400">
            <p>ID: <span className="font-mono text-gray-300">{booking.id}</span></p>
            <p>Created: {formatDatetime(booking.createdAt)}</p>
            <p>Location: {booking.locationCode}</p>
            <p>CSMS Tag: <span className="font-mono text-gray-300">{booking.csmsIdTag || '—'}</span></p>
            {booking.reasonForOverride && (
              <p>Override reason: {booking.reasonForOverride}</p>
            )}
            {isOperator && (
              <p>User: {booking.userDisplayName}</p>
            )}
          </div>
        </details>
      </div>

      {/* Cancel / Release modal */}
      <Modal
        open={!!modalMode}
        title={modalMode === 'cancel' ? 'Cancel Booking' : 'Release Booking'}
        onClose={() => setModalMode(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            {modalMode === 'cancel'
              ? `Cancel booking for ${booking.chargerDisplayName}?`
              : `Release booking for ${booking.chargerDisplayName}?`}
          </p>
          <p className="text-xs text-gray-400">
            The slot will be freed immediately. CSMS authorization will be revoked.
            {isOperator && ' This action will be audit-logged.'}
          </p>

          <FormField
            label={isOperator ? 'Reason *' : 'Reason (optional)'}
            htmlFor="detail-action-reason"
          >
            <textarea
              id="detail-action-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className={cn(inputClasses(), 'resize-none')}
              placeholder={isOperator ? 'Required for operator actions…' : 'Optional reason…'}
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
            <Button variant="secondary" size="md" onClick={() => setModalMode(null)}>
              Keep Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

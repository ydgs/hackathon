import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField, inputClasses } from '../ui/FormField';
import { CsmsSyncBadge } from '../ui/StatusBadge';
import { createBooking } from '../../services/booking.service';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/classNames';
import type { Booking, BookingState } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GanttSlotSelection {
  chargerId: string;
  chargerDisplayName: string;
  startHour: number;
  endHour: number;
}

interface GanttBookingModalProps {
  selection: GanttSlotSelection | null;
  bookings: Booking[];
  onClose: () => void;
  onBookingCreated?: () => void;
  /** ISO date string (YYYY-MM-DD) for which this booking is being created. Defaults to today. */
  selectedDate?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hourToHHmm(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GanttBookingModal({
  selection,
  bookings,
  onClose,
  onBookingCreated,
  selectedDate,
}: GanttBookingModalProps) {
  const { currentUser } = useAuth();

  // Resolve the booking date: use selectedDate if provided, else today
  const bookingDateIso = selectedDate ?? new Date().toISOString().split('T')[0];

  // ── Conflict detection (computed every render from current bookings) ────────
  const BLOCKING: BookingState[] = ['Pending', 'Confirmed', 'Active'];
  const selMs = (() => {
    if (!selection) return { start: 0, end: 0 };
    const MU_UTC_OFFSET = 4;
    const utcS = ((selection.startHour - MU_UTC_OFFSET) % 24 + 24) % 24;
    const utcE = ((selection.endHour   - MU_UTC_OFFSET) % 24 + 24) % 24;
    return {
      start: new Date(`${bookingDateIso}T${hourToHHmm(utcS)}:00Z`).getTime(),
      end:   new Date(`${bookingDateIso}T${hourToHHmm(utcE)}:00Z`).getTime(),
    };
  })();

  const overlaps = (b: Booking) =>
    BLOCKING.includes(b.state) &&
    new Date(b.startTime).getTime() < selMs.end &&
    new Date(b.endTime).getTime()   > selMs.start;

  const chargerConflict =
    selection !== null &&
    bookings.some((b) => b.chargerId === selection.chargerId && overlaps(b));

  const userConflict =
    selection !== null &&
    currentUser !== null &&
    bookings.some((b) => b.userId === currentUser.id && overlaps(b));

  const hasConflict = chargerConflict || userConflict;

  const [vehicleMake, setVehicleMake]   = useState(currentUser?.eligibility?.vehicleMake  ?? '');
  const [vehicleModel, setVehicleModel] = useState(currentUser?.eligibility?.vehicleModel ?? '');
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleClose = () => {
    const hadBooking = confirmedBooking !== null;
    // Reset form state so next open starts fresh
    setVehicleMake(currentUser?.eligibility?.vehicleMake  ?? '');
    setVehicleModel(currentUser?.eligibility?.vehicleModel ?? '');
    setErrors({});
    setFormError('');
    setSubmitting(false);
    setConfirmedBooking(null);
    onClose();
    // Refresh the chart AFTER closing — avoids unmounting the chart
    // (and this modal) while the success screen is still visible.
    if (hadBooking) onBookingCreated?.();
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!vehicleMake.trim())  e.vehicleMake  = 'Vehicle make is required.';
    if (!vehicleModel.trim()) e.vehicleModel = 'Vehicle model is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selection || !validate()) return;

    setSubmitting(true);
    try {
      // selection.startHour / endHour are Mauritius-timezone hours (UTC+4).
      // Subtract the offset so the stored ISO timestamp is correct UTC.
      const MU_UTC_OFFSET = 4;
      const utcStart = ((selection.startHour - MU_UTC_OFFSET) % 24 + 24) % 24;
      const utcEnd   = ((selection.endHour   - MU_UTC_OFFSET) % 24 + 24) % 24;
      // Use bookingDateIso (selectedDate or today) for the booking date
      const startIso = `${bookingDateIso}T${hourToHHmm(utcStart)}:00Z`;
      const endIso   = `${bookingDateIso}T${hourToHHmm(utcEnd)}:00Z`;

      const booking = await createBooking({
        chargerId:         selection.chargerId,
        startTime:         startIso,
        endTime:           endIso,
        vehicleMake:       vehicleMake.trim(),
        vehicleModel:      vehicleModel.trim(),
        onBehalfOfUserId:  null,
        reasonForOverride: null,
      });

      setConfirmedBooking(booking);
      // onBookingCreated is deferred to handleClose to avoid triggering
      // loadBookings (setLoading true) while this modal is still open,
      // which would unmount the Gantt chart — and this modal with it.
    } catch (err: unknown) {
      const e = err as Error & {
        apiError?: { message: string; errors: { field?: string; code: string; message: string }[] };
      };
      if (e.apiError) {
        const fieldErrors: Record<string, string> = {};
        e.apiError.errors?.forEach((fe) => {
          if (fe.field) fieldErrors[fe.field] = fe.message;
        });
        if (Object.keys(fieldErrors).length) setErrors((p) => ({ ...p, ...fieldErrors }));
        setFormError(e.apiError.message);
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const durationH = selection ? selection.endHour - selection.startHour : 0;

  return (
    <Modal
      open={selection !== null}
      title={confirmedBooking ? 'Booking Confirmed!' : 'Book Charging Slot'}
      onClose={handleClose}
    >
      {/* ── Success state ── */}
      {confirmedBooking ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircleIcon className="h-12 w-12 text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-gray-300 text-center">
              Your slot has been reserved and CSMS authorization is in progress.
            </p>
          </div>

          <div className="bg-brand-700/40 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold text-white">{confirmedBooking.chargerDisplayName}</p>
            <div className="flex items-center gap-1.5 text-gray-300">
              <ClockIcon className="h-4 w-4 text-brand-300 shrink-0" />
              <span>
                {hourToHHmm(selection!.startHour)} → {hourToHHmm(selection!.endHour)}&nbsp;
                <span className="text-gray-500">({durationH}h)</span>
              </span>
            </div>
            <p className="text-gray-300">
              {confirmedBooking.vehicleMake} {confirmedBooking.vehicleModel}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-400">CSMS:</span>
              <CsmsSyncBadge status={confirmedBooking.csmsSyncStatus} />
            </div>
            {confirmedBooking.csmsSyncStatus === 'AuthorizationFailed' && (
              <div className="flex items-start gap-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                Booking created but charger authorization failed. Contact operations.
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Link to={`/bookings/${confirmedBooking.id}`} className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                View Booking
              </Button>
            </Link>
            <Button variant="secondary" size="md" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* ── Booking form ── */
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Slot summary */}
          {selection && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-700/40 border border-teal-500/30">
              <BoltIcon className="h-5 w-5 shrink-0 text-teal-400 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-white">{selection.chargerDisplayName}</p>
                <p className="text-gray-300">
                  {hourToHHmm(selection.startHour)}&nbsp;→&nbsp;{hourToHHmm(selection.endHour)}
                  <span className="text-gray-500 ml-1">({durationH}h)</span>
                </p>
              </div>
            </div>
          )}

          {/* Conflict warnings — shown immediately, before submit */}
          {chargerConflict && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/40 text-sm text-amber-300">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              This charger already has a booking during that time. Please drag a free slot.
            </div>
          )}
          {userConflict && !chargerConflict && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/40 text-sm text-amber-300">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              You already have a booking during this time slot.
            </div>
          )}

          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-sm text-red-300">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              {formError}
            </div>
          )}

          {/* Vehicle fields */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Vehicle Make"
              htmlFor="gantt-vehicle-make"
              error={errors.vehicleMake}
              required
            >
              <input
                id="gantt-vehicle-make"
                type="text"
                value={vehicleMake}
                onChange={(e) => {
                  setVehicleMake(e.target.value);
                  setErrors((p) => ({ ...p, vehicleMake: '' }));
                }}
                aria-required="true"
                aria-describedby={errors.vehicleMake ? 'gantt-vehicle-make-error' : undefined}
                className={cn(inputClasses(!!errors.vehicleMake))}
                placeholder="e.g. Tesla"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Vehicle Model"
              htmlFor="gantt-vehicle-model"
              error={errors.vehicleModel}
              required
            >
              <input
                id="gantt-vehicle-model"
                type="text"
                value={vehicleModel}
                onChange={(e) => {
                  setVehicleModel(e.target.value);
                  setErrors((p) => ({ ...p, vehicleModel: '' }));
                }}
                aria-required="true"
                aria-describedby={errors.vehicleModel ? 'gantt-vehicle-model-error' : undefined}
                className={cn(inputClasses(!!errors.vehicleModel))}
                placeholder="e.g. Model 3"
                autoComplete="off"
              />
            </FormField>
          </div>

          <p className="text-xs text-gray-500">
            Fair use: 1 hour maximum per day. Today's date will be used for the booking.
          </p>

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={hasConflict || submitting}
              className="flex-1"
            >
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

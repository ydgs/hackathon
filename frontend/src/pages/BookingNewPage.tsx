import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeftIcon, BoltIcon, CheckCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Charger, Booking } from '../types';
import { getChargers } from '../services/charger.service';
import { createBooking } from '../services/booking.service';
import { Button } from '../components/ui/Button';
import { FormField, inputClasses } from '../components/ui/FormField';
import { CsmsSyncBadge } from '../components/ui/StatusBadge';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { BookingSlotPicker, generateHourlySlots } from '../components/booking/BookingSlotPicker';
import { useAuth } from '../hooks/useAuth';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { cn } from '../lib/classNames';
import { formatTimeWindow } from '../lib/formatters';

// Maximum number of days ahead a booking can be made (matches system config)
const BOOKING_WINDOW_DAYS = 14;

/** Get an array of selectable dates: today + BOOKING_WINDOW_DAYS future dates. */
function getSelectableDates(): { iso: string; label: string; short: string }[] {
  const dates: { iso: string; label: string; short: string }[] = [];
  const now = new Date();
  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-MU', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      timeZone: 'Indian/Mauritius',
    });
    const short = i === 0
      ? 'Today'
      : i === 1
      ? 'Tomorrow'
      : d.toLocaleDateString('en-MU', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Indian/Mauritius' });
    dates.push({ iso, label, short });
  }
  return dates;
}

export function BookingNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAdmin, isWorkplace } = useAuth();
  const canOverrideCap = isAdmin || isWorkplace;

  const preSelectedChargerId = searchParams.get('chargerId') ?? '';
  const preStartTime = searchParams.get('startTime') ?? '';
  const preEndTime   = searchParams.get('endTime')   ?? '';

  const selectableDates = useMemo(() => getSelectableDates(), []);
  const todayIso = selectableDates[0]?.iso ?? new Date().toISOString().split('T')[0];

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargersLoading, setChargersLoading] = useState(true);

  const [selectedDateIso, setSelectedDateIso] = useState(todayIso);
  const [chargerId, setChargerId] = useState(preSelectedChargerId);
  const [startTime, setStartTime] = useState(preStartTime);
  const [endTime, setEndTime]     = useState(preEndTime);
  const [vehicleMake, setVehicleMake] = useState(currentUser?.eligibility?.vehicleMake ?? '');
  const [vehicleModel, setVehicleModel] = useState(currentUser?.eligibility?.vehicleModel ?? '');

  const [capOverride, setCapOverride] = useState(false);
  const [capOverrideReason, setCapOverrideReason] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [existingBookingId, setExistingBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load bookable chargers — exclude physically broken/blocked ones.
  // Reserved chargers may still be bookable for other time slots; the backend handles overlap checks.
  useEffect(() => {
    getChargers()
      .then((res) => {
        setChargers(res.data.filter((c) => c.status !== 'BlockedForMaintenance' && c.status !== 'Faulted' && c.status !== 'Unavailable'));
      })
      .finally(() => setChargersLoading(false));
  }, []);

  // When the date changes, clear selected times to avoid stale slots
  const handleDateChange = (dateIso: string) => {
    setSelectedDateIso(dateIso);
    setStartTime('');
    setEndTime('');
    setErrors((p) => ({ ...p, startTime: '', endTime: '' }));
  };

  const isBookingToday = selectedDateIso === todayIso;

  // Hour-based slot picker — past hours are only disabled when booking for today
  const nowHour = new Date().getHours();
  const pastCutoff = isBookingToday ? nowHour : -1; // -1 = no cutoff for future dates

  const startSlots = generateHourlySlots(6, 20, {
    pastHourCutoff: pastCutoff,
    bestHours: [11, 12],
    peakHours: [9, 10],
    reservedHours: [],
  });

  const selectedStartHour = startTime ? Number(startTime.split(':')[0]) : null;
  const endSlots = generateHourlySlots(7, 21, {
    pastHourCutoff: isBookingToday ? (selectedStartHour ?? nowHour) + 1 : (selectedStartHour != null ? selectedStartHour + 1 : -1),
  }).map((s) => ({
    ...s,
    disabled: s.disabled || (selectedStartHour != null && Number(s.value.split(':')[0]) > selectedStartHour + 1),
  }));

  // Duration calculation
  const durationMinutes = (() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  })();

  // Date display label
  const selectedDateLabel = selectableDates.find((d) => d.iso === selectedDateIso)?.label ?? selectedDateIso;

  // Date navigation (prev/next)
  const currentDateIdx = selectableDates.findIndex((d) => d.iso === selectedDateIso);
  const canGoPrev = currentDateIdx > 0;
  const canGoNext = currentDateIdx < selectableDates.length - 1;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!chargerId) e.chargerId = 'Please select a charger.';
    if (!startTime) e.startTime = isBookingToday ? 'Start time must be today and in the future.' : 'Please select a start time.';
    if (!endTime) e.endTime = 'End time must be after start time.';
    else if (durationMinutes <= 0) e.endTime = 'End time must be after start time.';
    if (!vehicleMake.trim()) e.vehicleMake = 'Vehicle make is required.';
    if (!vehicleModel.trim()) e.vehicleModel = 'Vehicle model is required.';
    if (capOverride && !capOverrideReason.trim()) e.capOverrideReason = 'A reason is required when overriding the daily cap.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setExistingBookingId(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Build ISO timestamps using the selected date (not always today)
      const startIso = `${selectedDateIso}T${startTime}:00Z`;
      const endIso = `${selectedDateIso}T${endTime}:00Z`;

      const booking = await createBooking({
        chargerId,
        startTime: startIso,
        endTime: endIso,
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        onBehalfOfUserId: null,
        reasonForOverride: capOverride ? capOverrideReason.trim() : null,
      });
      setConfirmedBooking(booking);
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string; errors: { field?: string; code: string; message: string; metadata?: Record<string, string> }[] } };
      if (e.apiError) {
        const fieldErrors: Record<string, string> = {};
        let formMsg = e.apiError.message;
        e.apiError.errors.forEach((fe) => {
          if (fe.code === 'AlreadyHasActiveBooking') {
            formMsg = 'You already have a booking during this time window. Cancel it or choose a different time.';
            setExistingBookingId(fe.metadata?.bookingId ?? null);
          } else if (fe.code === 'DailyCapExceeded') {
            formMsg = 'You have already used your 1-hour daily cap. Enable "Override daily cap" with a reason if you are authorised to exceed it.';
          } else if (fe.field) {
            fieldErrors[fe.field] = fe.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        setFormError(formMsg);
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (confirmedBooking) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-brand-800 rounded-card border border-brand-700/40 p-8 text-center space-y-4">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white">Booking Confirmed!</h1>

          <div className="bg-brand-700/40 rounded-lg p-4 text-left space-y-2 text-sm">
            <p className="font-semibold text-white">{confirmedBooking.chargerDisplayName}</p>
            <p className="text-gray-300">
              {selectedDateLabel} · {formatTimeWindow(confirmedBooking.startTime, confirmedBooking.endTime)} · 60 min
            </p>
            <p className="text-gray-300">
              {confirmedBooking.vehicleMake} {confirmedBooking.vehicleModel}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">CSMS Status:</span>
              <CsmsSyncBadge status={confirmedBooking.csmsSyncStatus} />
            </div>
            {confirmedBooking.csmsSyncStatus === 'Authorized' && (
              <p className="text-xs text-green-400">Ready to charge at the station.</p>
            )}
            {confirmedBooking.csmsSyncStatus === 'AuthorizationFailed' && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                Contact operations — booking created but charger authorization failed.
              </div>
            )}
            {confirmedBooking.csmsSyncStatus === 'AuthorizationPending' && (
              <p className="text-xs text-amber-400">Authorising at charger…</p>
            )}
          </div>

          <p className="text-xs text-gray-400">
            A booking confirmation has been sent to your{' '}
            <Link to="/notifications" className="text-brand-300 underline">notification center</Link>.
          </p>

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="primary" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-400 mb-6">
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Dashboard
      </Link>

      <div className="bg-brand-800 rounded-card border border-brand-700/40">
        <div className="px-6 py-5 border-b border-brand-700">
          <h1 className="text-xl font-bold text-white">Book a Charger</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
          {formError && !existingBookingId && (
            <ErrorBanner message={formError} dismissable onRetry={() => setFormError('')} />
          )}
          {formError && existingBookingId && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-200">Active booking already exists</p>
                <p className="mt-0.5 text-red-300">{formError}</p>
                <div className="mt-2 flex gap-2">
                  <Link
                    to={`/my-bookings/${existingBookingId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-200 underline hover:text-white"
                  >
                    View booking
                  </Link>
                  <span className="text-red-600">·</span>
                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-200 underline hover:text-white"
                  >
                    My bookings
                  </Link>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setFormError(''); setExistingBookingId(null); }}
                className="shrink-0 text-red-400 hover:text-red-200"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Fair-use callout */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-700/40 border border-brand-600/40 text-xs text-brand-300">
            <BoltIcon className="h-4 w-4 shrink-0 mt-0.5 text-brand-400" aria-hidden="true" />
            <div>
              <p className="font-semibold">Fair use: max 1 hour per day</p>
              <p className="text-gray-400 mt-0.5">You have 60 minutes available today.</p>
            </div>
          </div>

          {/* Charger */}
          <FormField label="Charger" htmlFor="charger" error={errors.chargerId} required>
            <select
              id="charger"
              value={chargerId}
              onChange={(e) => {
                setChargerId(e.target.value);
                setErrors((p) => ({ ...p, chargerId: '' }));
              }}
              aria-required="true"
              aria-describedby={errors.chargerId ? 'charger-error' : undefined}
              className={cn(inputClasses(!!errors.chargerId))}
              disabled={chargersLoading}
            >
              <option value="">
                {chargersLoading ? 'Loading chargers…' : 'Select a charger'}
              </option>
              {chargers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} ({c.location.name}){c.status === 'Reserved' ? ' — Partially booked' : ' — Available'}
                </option>
              ))}
            </select>
          </FormField>

          {/* Date selector */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Date <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
            </label>

            {/* Date navigation row */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => canGoPrev && handleDateChange(selectableDates[currentDateIdx - 1].iso)}
                disabled={!canGoPrev}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  canGoPrev
                    ? 'border-brand-600 text-gray-300 hover:bg-brand-700 hover:text-white'
                    : 'border-brand-800 text-gray-600 cursor-not-allowed',
                )}
                aria-label="Previous day"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-700/40 border border-brand-600/40">
                <CalendarDaysIcon className="h-4 w-4 text-brand-300 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="text-xs text-brand-300 font-semibold uppercase tracking-wide">
                    {isBookingToday ? 'Today' : currentDateIdx === 1 ? 'Tomorrow' : `In ${currentDateIdx} days`}
                  </span>
                  <p className="text-sm font-semibold text-white">{selectedDateLabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => canGoNext && handleDateChange(selectableDates[currentDateIdx + 1].iso)}
                disabled={!canGoNext}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  canGoNext
                    ? 'border-brand-600 text-gray-300 hover:bg-brand-700 hover:text-white'
                    : 'border-brand-800 text-gray-600 cursor-not-allowed',
                )}
                aria-label="Next day"
              >
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable date chips for fast navigation */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="listbox" aria-label="Select booking date">
              {selectableDates.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  role="option"
                  aria-selected={d.iso === selectedDateIso}
                  onClick={() => handleDateChange(d.iso)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors',
                    d.iso === selectedDateIso
                      ? 'bg-brand-500 border-brand-400 text-white'
                      : 'border-brand-600 text-gray-400 hover:bg-brand-700 hover:text-white',
                  )}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          {/* Start slot picker */}
          <FormField label="Start time" htmlFor="start-time" error={errors.startTime} required>
            <BookingSlotPicker
              slots={startSlots}
              selectedValue={startTime}
              onChange={(v) => {
                setStartTime(v);
                // Auto-pick end = start + 1 hour for the 60-min cap
                const h = Number(v.split(':')[0]);
                setEndTime(`${String(h + 1).padStart(2, '0')}:00`);
                setErrors((p) => ({ ...p, startTime: '', endTime: '' }));
              }}
              ariaLabel="Select a start time"
            />
            <p className="mt-2 text-[11px] text-gray-500">
              <span className="text-emerald-400 font-semibold">Best</span> = lowest demand · <span className="text-amber-400 font-semibold">Peak</span> = high demand
              {isBookingToday && <span className="ml-1">· Grayed = past</span>}
            </p>
          </FormField>

          {/* End slot picker */}
          <FormField label="End time" htmlFor="end-time" error={errors.endTime} required>
            <BookingSlotPicker
              slots={endSlots}
              selectedValue={endTime}
              onChange={(v) => {
                setEndTime(v);
                setErrors((p) => ({ ...p, endTime: '' }));
              }}
              ariaLabel="Select an end time"
            />
          </FormField>

          {/* Duration hint */}
          {durationMinutes > 0 && (
            <p className={cn(
              'text-xs font-medium',
              durationMinutes <= 60 ? 'text-green-400' : 'text-amber-400',
            )}>
              {durationMinutes <= 60
                ? `✓ Duration: ${durationMinutes} minutes`
                : `⚠ Duration: ${durationMinutes} minutes — exceeds 1 hour limit`}
            </p>
          )}

          {/* Vehicle */}
          <FormField label="Vehicle make" htmlFor="vehicle-make" error={errors.vehicleMake} required>
            <input
              id="vehicle-make"
              type="text"
              value={vehicleMake}
              onChange={(e) => {
                setVehicleMake(e.target.value);
                setErrors((p) => ({ ...p, vehicleMake: '' }));
              }}
              aria-required="true"
              className={cn(inputClasses(!!errors.vehicleMake))}
              placeholder="Tesla"
            />
          </FormField>

          <FormField label="Vehicle model" htmlFor="vehicle-model" error={errors.vehicleModel} required>
            <input
              id="vehicle-model"
              type="text"
              value={vehicleModel}
              onChange={(e) => {
                setVehicleModel(e.target.value);
                setErrors((p) => ({ ...p, vehicleModel: '' }));
              }}
              aria-required="true"
              className={cn(inputClasses(!!errors.vehicleModel))}
              placeholder="Model 3"
            />
          </FormField>

          {/* Cap override — Admin / Workplace only */}
          {canOverrideCap && (
            <div className={cn(
              'rounded-lg border p-4 space-y-3',
              capOverride ? 'border-amber-500/60 bg-amber-900/20' : 'border-brand-600/50 bg-brand-700/20',
            )}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={capOverride}
                    onChange={(e) => {
                      setCapOverride(e.target.checked);
                      if (!e.target.checked) {
                        setCapOverrideReason('');
                        setErrors((p) => ({ ...p, capOverrideReason: '' }));
                      }
                    }}
                    className="sr-only peer"
                    id="cap-override-toggle"
                    aria-describedby="cap-override-desc"
                  />
                  <div className={cn(
                    'w-10 h-5 rounded-full transition-colors',
                    capOverride ? 'bg-amber-500' : 'bg-brand-600',
                  )} />
                  <div className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    capOverride ? 'translate-x-5' : 'translate-x-0',
                  )} />
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                    <ShieldExclamationIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Override daily cap
                  </span>
                  <p id="cap-override-desc" className="text-xs text-gray-400 mt-0.5">
                    Allows booking beyond the 1-hour fair-use limit. Requires a reason. This action is audit-logged.
                  </p>
                </div>
              </label>

              {capOverride && (
                <FormField
                  label="Override reason"
                  htmlFor="cap-override-reason"
                  error={errors.capOverrideReason}
                  required
                >
                  <textarea
                    id="cap-override-reason"
                    value={capOverrideReason}
                    onChange={(e) => {
                      setCapOverrideReason(e.target.value);
                      if (e.target.value.trim()) setErrors((p) => ({ ...p, capOverrideReason: '' }));
                    }}
                    rows={2}
                    aria-required="true"
                    aria-describedby={errors.capOverrideReason ? 'cap-override-reason-error' : undefined}
                    className={cn(inputClasses(!!errors.capOverrideReason), 'resize-none')}
                    placeholder="Enter reason for exceeding the daily cap…"
                  />
                </FormField>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
              {loading ? 'Creating booking…' : 'Confirm Booking'}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

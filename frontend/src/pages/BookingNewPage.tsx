import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeftIcon, BoltIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Charger, Booking } from '../types';
import { getChargers } from '../services/charger.service';
import { createBooking } from '../services/booking.service';
import { Button } from '../components/ui/Button';
import { FormField, inputClasses } from '../components/ui/FormField';
import { CsmsSyncBadge } from '../components/ui/StatusBadge';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/classNames';
import { formatTimeWindow } from '../lib/formatters';

export function BookingNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const preSelectedChargerId = searchParams.get('chargerId') ?? '';

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargersLoading, setChargersLoading] = useState(true);

  const [chargerId, setChargerId] = useState(preSelectedChargerId);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [vehicleMake, setVehicleMake] = useState(currentUser?.eligibility?.vehicleMake ?? '');
  const [vehicleModel, setVehicleModel] = useState(currentUser?.eligibility?.vehicleModel ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load available chargers
  useEffect(() => {
    getChargers()
      .then((res) => {
        setChargers(res.data.filter((c) => c.status === 'Available'));
      })
      .finally(() => setChargersLoading(false));
  }, []);

  // Duration calculation
  const durationMinutes = (() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  })();

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!chargerId) e.chargerId = 'Please select a charger.';
    if (!startTime) e.startTime = 'Start time must be today and in the future.';
    if (!endTime) e.endTime = 'End time must be after start time.';
    else if (durationMinutes <= 0) e.endTime = 'End time must be after start time.';
    if (!vehicleMake.trim()) e.vehicleMake = 'Vehicle make is required.';
    if (!vehicleModel.trim()) e.vehicleModel = 'Vehicle model is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);
    try {
      // Build ISO timestamps for today
      const today = new Date().toISOString().split('T')[0];
      const startIso = `${today}T${startTime}:00Z`;
      const endIso = `${today}T${endTime}:00Z`;

      const booking = await createBooking({
        chargerId,
        startTime: startIso,
        endTime: endIso,
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        onBehalfOfUserId: null,
        reasonForOverride: null,
      });
      setConfirmedBooking(booking);
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string; errors: { field?: string; code: string; message: string }[] } };
      if (e.apiError) {
        const fieldErrors: Record<string, string> = {};
        e.apiError.errors.forEach((fe) => {
          if (fe.field) fieldErrors[fe.field] = fe.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        setFormError(e.apiError.message);
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
              {formatTimeWindow(confirmedBooking.startTime, confirmedBooking.endTime)} · 60 min
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
          {formError && (
            <ErrorBanner message={formError} dismissable onRetry={() => setFormError('')} />
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
                  {c.displayName} ({c.location.name}) — Available
                </option>
              ))}
            </select>
          </FormField>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start time" htmlFor="start-time" error={errors.startTime} required>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors((p) => ({ ...p, startTime: '' }));
                }}
                aria-required="true"
                className={cn(inputClasses(!!errors.startTime))}
              />
            </FormField>
            <FormField label="End time" htmlFor="end-time" error={errors.endTime} required>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrors((p) => ({ ...p, endTime: '' }));
                }}
                aria-required="true"
                className={cn(inputClasses(!!errors.endTime))}
              />
            </FormField>
          </div>

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

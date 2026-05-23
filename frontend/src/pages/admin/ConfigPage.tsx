import { useState, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { FormField, inputClasses } from '../../components/ui/FormField';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useToast } from '../../hooks/useToast';
import { getConfig, updateConfig } from '../../services/config.service';
import { cn } from '../../lib/classNames';

interface SystemConfig {
  defaultBookingDurationMinutes: number;
  maxBookingDurationMinutes: number;
  gracePeriodMinutes: number;
  maxActiveBookingsPerUser: number;
  bookingWindowDays: number;
  maintenanceNotificationLeadHours: number;
}

const DEFAULTS: SystemConfig = {
  defaultBookingDurationMinutes: 60,
  maxBookingDurationMinutes: 480,
  gracePeriodMinutes: 15,
  maxActiveBookingsPerUser: 2,
  bookingWindowDays: 14,
  maintenanceNotificationLeadHours: 24,
};

function parseConfig(entries: { key: string; value: string }[]): SystemConfig {
  const map: Record<string, string> = {};
  entries.forEach((e) => { map[e.key] = e.value; });
  return {
    defaultBookingDurationMinutes: parseInt(map['defaultBookingDurationMinutes'] ?? String(DEFAULTS.defaultBookingDurationMinutes), 10),
    maxBookingDurationMinutes: parseInt(map['maxBookingDurationMinutes'] ?? String(DEFAULTS.maxBookingDurationMinutes), 10),
    gracePeriodMinutes: parseInt(map['gracePeriodMinutes'] ?? String(DEFAULTS.gracePeriodMinutes), 10),
    maxActiveBookingsPerUser: parseInt(map['maxActiveBookingsPerUser'] ?? String(DEFAULTS.maxActiveBookingsPerUser), 10),
    bookingWindowDays: parseInt(map['bookingWindowDays'] ?? String(DEFAULTS.bookingWindowDays), 10),
    maintenanceNotificationLeadHours: parseInt(map['maintenanceNotificationLeadHours'] ?? String(DEFAULTS.maintenanceNotificationLeadHours), 10),
  };
}

function toEntries(config: SystemConfig) {
  return Object.entries(config).map(([key, value]) => ({ key, value: String(value) }));
}

export function ConfigPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<SystemConfig>(DEFAULTS);
  const [errors, setErrors] = useState<Partial<Record<keyof SystemConfig, string>>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getConfig()
      .then((res) => setConfig(parseConfig(res.data)))
      .catch(() => setLoadError('Failed to load configuration. Showing defaults.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof SystemConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setConfig((prev) => ({ ...prev, [field]: isNaN(val) ? 0 : val }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof SystemConfig, string>> = {};
    if (config.defaultBookingDurationMinutes < 15 || config.defaultBookingDurationMinutes > 480)
      e.defaultBookingDurationMinutes = 'Must be between 15 and 480 minutes.';
    if (config.maxBookingDurationMinutes < config.defaultBookingDurationMinutes)
      e.maxBookingDurationMinutes = 'Must be >= default booking duration.';
    if (config.gracePeriodMinutes < 1 || config.gracePeriodMinutes > 60)
      e.gracePeriodMinutes = 'Must be between 1 and 60 minutes.';
    if (config.maxActiveBookingsPerUser < 1 || config.maxActiveBookingsPerUser > 10)
      e.maxActiveBookingsPerUser = 'Must be between 1 and 10.';
    if (config.bookingWindowDays < 1 || config.bookingWindowDays > 90)
      e.bookingWindowDays = 'Must be between 1 and 90 days.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await updateConfig(toEntries(config));
      setConfig(parseConfig(res.data));
      showToast('success', 'System configuration saved.');
    } catch {
      showToast('error', 'Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Cog6ToothIcon className="h-7 w-7 text-brand-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
      </div>

      {loadError && <ErrorBanner message={loadError} dismissable />}

      <div className="bg-brand-800 rounded-card border border-brand-700/40">
        <div className="px-6 py-4 border-b border-brand-700">
          <h2 className="text-base font-semibold text-white">Booking Rules</h2>
          <p className="text-xs text-gray-400 mt-0.5">Control booking window constraints and defaults</p>
        </div>
        <form onSubmit={handleSave} noValidate className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Default booking duration (minutes)"
              htmlFor="cfg-default-dur"
              error={errors.defaultBookingDurationMinutes}
              required
            >
              <input
                id="cfg-default-dur"
                type="number"
                min={15}
                max={480}
                value={config.defaultBookingDurationMinutes}
                onChange={set('defaultBookingDurationMinutes')}
                disabled={loading}
                className={cn(inputClasses(!!errors.defaultBookingDurationMinutes))}
              />
            </FormField>

            <FormField
              label="Max booking duration (minutes)"
              htmlFor="cfg-max-dur"
              error={errors.maxBookingDurationMinutes}
              required
            >
              <input
                id="cfg-max-dur"
                type="number"
                min={15}
                max={1440}
                value={config.maxBookingDurationMinutes}
                onChange={set('maxBookingDurationMinutes')}
                disabled={loading}
                className={cn(inputClasses(!!errors.maxBookingDurationMinutes))}
              />
            </FormField>

            <FormField
              label="Grace period (minutes)"
              htmlFor="cfg-grace"
              error={errors.gracePeriodMinutes}
              required
            >
              <input
                id="cfg-grace"
                type="number"
                min={1}
                max={60}
                value={config.gracePeriodMinutes}
                onChange={set('gracePeriodMinutes')}
                disabled={loading}
                className={cn(inputClasses(!!errors.gracePeriodMinutes))}
              />
            </FormField>

            <FormField
              label="Max active bookings per user"
              htmlFor="cfg-max-bookings"
              error={errors.maxActiveBookingsPerUser}
              required
            >
              <input
                id="cfg-max-bookings"
                type="number"
                min={1}
                max={10}
                value={config.maxActiveBookingsPerUser}
                onChange={set('maxActiveBookingsPerUser')}
                disabled={loading}
                className={cn(inputClasses(!!errors.maxActiveBookingsPerUser))}
              />
            </FormField>

            <FormField
              label="Booking window (days ahead)"
              htmlFor="cfg-window"
              error={errors.bookingWindowDays}
              required
            >
              <input
                id="cfg-window"
                type="number"
                min={1}
                max={90}
                value={config.bookingWindowDays}
                onChange={set('bookingWindowDays')}
                disabled={loading}
                className={cn(inputClasses(!!errors.bookingWindowDays))}
              />
            </FormField>

            <FormField
              label="Maintenance notification lead (hours)"
              htmlFor="cfg-maint-lead"
            >
              <input
                id="cfg-maint-lead"
                type="number"
                min={1}
                max={168}
                value={config.maintenanceNotificationLeadHours}
                onChange={set('maintenanceNotificationLeadHours')}
                disabled={loading}
                className={cn(inputClasses())}
              />
            </FormField>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" loading={saving} disabled={loading}>
              {saving ? 'Saving…' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

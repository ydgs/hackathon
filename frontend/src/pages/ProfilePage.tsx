import { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import type { EligibilityStatus } from '../types';
import { updateEligibleUser } from '../services/user.service';
import { Button } from '../components/ui/Button';
import { FormField, inputClasses } from '../components/ui/FormField';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDatetime } from '../lib/formatters';
import { cn } from '../lib/classNames';

export function ProfilePage() {
  const { currentUser, login } = useAuth();
  const { showToast } = useToast();

  const [vehicleMake, setVehicleMake] = useState(currentUser?.eligibility?.vehicleMake ?? '');
  const [vehicleModel, setVehicleModel] = useState(currentUser?.eligibility?.vehicleModel ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!vehicleMake.trim()) errs.vehicleMake = 'Vehicle make is required.';
    if (!vehicleModel.trim()) errs.vehicleModel = 'Vehicle model is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setSaveError('');
    try {
      // MOCK: update vehicle via service
      const eligibilityId = currentUser?.eligibility ? 'eu-001' : null;
      if (eligibilityId) {
        await updateEligibleUser(eligibilityId, { vehicleMake, vehicleModel });
      }
      // Update local user context
      if (currentUser && currentUser.eligibility) {
        login({ ...currentUser, eligibility: { ...currentUser.eligibility, vehicleMake, vehicleModel } });
      }
      showToast('success', 'Vehicle updated.');
    } catch {
      setSaveError('Failed to update vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  const eligibility = currentUser.eligibility;
  const privacy = currentUser.privacy;


  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="bg-brand-800 rounded-card border border-brand-700/40 p-6 space-y-4">
        {/* User header */}
        <div className="flex items-center gap-3">
          <UserCircleIcon className="h-12 w-12 text-brand-400" aria-hidden="true" />
          <div>
            <p className="text-lg font-bold text-white">{currentUser.displayName}</p>
            <p className="text-sm text-gray-400">{currentUser.email}</p>
            <p className="text-xs text-gray-500 mt-0.5">Role: {currentUser.role}</p>
          </div>
        </div>

        {/* Eligibility */}
        {eligibility && (
          <div className="pt-4 border-t border-brand-700 space-y-2">
            <h2 className="text-sm font-semibold text-gray-200">Eligibility</h2>
            <div className="flex items-center gap-2">
              <StatusBadge status={eligibility.eligibilityStatus as EligibilityStatus & 'Active'} type="booking" />
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <p>EID: <span className="font-mono text-gray-200">{eligibility.workplaceRegistryEid}</span></p>
              <p>Badge: <span className="font-mono text-gray-200">{eligibility.badgeId}</span></p>
              <p>Site: {eligibility.siteContext}</p>
            </div>
          </div>
        )}

        {/* Privacy */}
        {privacy && (
          <div className="pt-4 border-t border-brand-700 space-y-1">
            <h2 className="text-sm font-semibold text-gray-200">Privacy Notice</h2>
            <p className="text-xs text-gray-300">
              {privacy.hasAcknowledgedCurrentVersion
                ? `✓ Acknowledged (${privacy.acknowledgedVersion})`
                : '✗ Not acknowledged'}
            </p>
            {privacy.acknowledgedAt && (
              <p className="text-xs text-gray-500">
                {formatDatetime(privacy.acknowledgedAt)}
              </p>
            )}
          </div>
        )}

        {/* Vehicle */}
        {eligibility && (
          <form onSubmit={handleSave} noValidate className="pt-4 border-t border-brand-700 space-y-4">
            <h2 className="text-sm font-semibold text-gray-200">Vehicle</h2>
            {saveError && <ErrorBanner message={saveError} dismissable />}
            <FormField label="Make" htmlFor="profile-make" error={errors.vehicleMake} required>
              <input
                id="profile-make"
                type="text"
                value={vehicleMake}
                onChange={(e) => { setVehicleMake(e.target.value); setErrors((p) => ({ ...p, vehicleMake: '' })); }}
                className={cn(inputClasses(!!errors.vehicleMake))}
                aria-required="true"
              />
            </FormField>
            <FormField label="Model" htmlFor="profile-model" error={errors.vehicleModel} required>
              <input
                id="profile-model"
                type="text"
                value={vehicleModel}
                onChange={(e) => { setVehicleModel(e.target.value); setErrors((p) => ({ ...p, vehicleModel: '' })); }}
                className={cn(inputClasses(!!errors.vehicleModel))}
                aria-required="true"
              />
            </FormField>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              Save Vehicle
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import type { EligibleUser, CreateEligibleUserRequest } from '../../types';
import { createEligibleUser, updateEligibleUser, getEligibleUser } from '../../services/user.service';
import { Button } from '../../components/ui/Button';
import { FormField, inputClasses } from '../../components/ui/FormField';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../lib/classNames';

export function UserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isEdit);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email: '',
    displayName: '',
    role: 'StandardUser',
    workplaceRegistryEid: '',
    badgeId: '',
    eligibilityStatus: 'Active',
    vehicleMake: '',
    vehicleModel: '',
    siteContext: 'Both',
    password: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      getEligibleUser(id)
        .then((u: EligibleUser) => {
          setForm((prev) => ({
            ...prev,
            email: u.email,
            displayName: u.displayName,
            workplaceRegistryEid: u.workplaceRegistryEid,
            badgeId: u.badgeId,
            eligibilityStatus: u.eligibilityStatus,
            vehicleMake: u.vehicleMake,
            vehicleModel: u.vehicleModel,
            siteContext: u.siteContext,
          }));
        })
        .finally(() => setInitLoading(false));
    }
  }, [id]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.displayName.trim()) e.displayName = 'Display name is required.';
    if (!form.workplaceRegistryEid.trim()) e.workplaceRegistryEid = 'EID is required.';
    if (!form.badgeId.trim()) e.badgeId = 'Badge ID is required.';
    if (!form.siteContext) e.siteContext = 'Please select a site context.';
    if (!isEdit && form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateEligibleUser(id, {
          displayName: form.displayName,
          eligibilityStatus: form.eligibilityStatus as EligibleUser['eligibilityStatus'],
          vehicleMake: form.vehicleMake,
          vehicleModel: form.vehicleModel,
          siteContext: form.siteContext as EligibleUser['siteContext'],
        });
        showToast('success', 'Eligible EV user saved.');
      } else {
        await createEligibleUser(form as CreateEligibleUserRequest);
        showToast('success', 'Eligible EV user created.');
      }
      navigate('/admin/users');
    } catch (err: unknown) {
      const ex = err as Error & { apiError?: { message: string } };
      setFormError(ex.apiError?.message ?? 'Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <div className="text-gray-400 py-12 text-center text-sm">Loading user…</div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-400">
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Eligible EV Users
      </Link>

      <div className="bg-brand-800 rounded-card border border-brand-700/40">
        <div className="px-6 py-5 border-b border-brand-700">
          <h1 className="text-xl font-bold text-white">
            {isEdit ? 'Edit Eligible User' : 'Add Eligible User'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {formError && <ErrorBanner message={formError} dismissable />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email" htmlFor="u-email" error={errors.email} required>
              <input id="u-email" type="email" value={form.email} onChange={set('email')}
                className={cn(inputClasses(!!errors.email))} disabled={isEdit} />
            </FormField>
            <FormField label="Display Name" htmlFor="u-name" error={errors.displayName} required>
              <input id="u-name" type="text" value={form.displayName} onChange={set('displayName')}
                className={cn(inputClasses(!!errors.displayName))} />
            </FormField>
            <FormField label="Role" htmlFor="u-role" required>
              <select id="u-role" value={form.role} onChange={set('role')}
                className={cn(inputClasses())} disabled={isEdit}>
                {['StandardUser', 'Security', 'Workplace', 'Admin', 'ReportingESGViewer', 'Management'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Eligibility Status" htmlFor="u-status" required>
              <select id="u-status" value={form.eligibilityStatus} onChange={set('eligibilityStatus')}
                className={cn(inputClasses())}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </FormField>
            <FormField label="Workplace Registry EID" htmlFor="u-eid" error={errors.workplaceRegistryEid} required>
              <input id="u-eid" type="text" value={form.workplaceRegistryEid} onChange={set('workplaceRegistryEid')}
                className={cn(inputClasses(!!errors.workplaceRegistryEid))} placeholder="EID-00123" />
            </FormField>
            <FormField label="Badge ID" htmlFor="u-badge" error={errors.badgeId} required>
              <input id="u-badge" type="text" value={form.badgeId} onChange={set('badgeId')}
                className={cn(inputClasses(!!errors.badgeId))} placeholder="BDG-00123" />
            </FormField>
            <FormField label="Vehicle Make" htmlFor="u-make">
              <input id="u-make" type="text" value={form.vehicleMake} onChange={set('vehicleMake')}
                className={cn(inputClasses())} placeholder="Tesla" />
            </FormField>
            <FormField label="Vehicle Model" htmlFor="u-model">
              <input id="u-model" type="text" value={form.vehicleModel} onChange={set('vehicleModel')}
                className={cn(inputClasses())} placeholder="Model 3" />
            </FormField>
            <FormField label="Site Context" htmlFor="u-site" error={errors.siteContext} required>
              <select id="u-site" value={form.siteContext} onChange={set('siteContext')}
                className={cn(inputClasses(!!errors.siteContext))}>
                <option value="Both">Both</option>
                <option value="NexTower">NexTower</option>
                <option value="Nexteracom">Nexteracom</option>
              </select>
            </FormField>
            {!isEdit && (
              <FormField label="Password" htmlFor="u-password" error={errors.password} required>
                <input id="u-password" type="password" value={form.password} onChange={set('password')}
                  className={cn(inputClasses(!!errors.password))} placeholder="Min 8 characters" />
              </FormField>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="md" loading={loading} className="flex-1">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

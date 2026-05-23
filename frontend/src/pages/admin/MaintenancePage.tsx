import { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon, PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField, inputClasses } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../lib/classNames';
import { getChargers } from '../../services/charger.service';
import { getBookings } from '../../services/booking.service';
import type { Charger, Booking, ApiError } from '../../types';
import { createMaintenanceBlock, deleteMaintenanceBlock } from '../../services/maintenance.service';
import type { MaintenanceBlockResponse } from '../../services/maintenance.service';
import { formatTimeWindow, formatDatetime } from '../../lib/formatters';

interface MaintenanceBlock {
  id: string;
  chargerId: string;
  chargerName: string;
  startTime: string;
  endTime: string | null;
  reason: string;
  isActive: boolean;
}

type FormState = {
  chargerId: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export function MaintenancePage() {
  const { showToast } = useToast();
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingChargers, setLoadingChargers] = useState(true);

  const [form, setForm] = useState<FormState>({
    chargerId: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Conflict override state
  const [conflictModal, setConflictModal] = useState<{
    open: boolean;
    pendingForm: FormState | null;
    affectedBookings: Booking[];
    loadingBookings: boolean;
  }>({ open: false, pendingForm: null, affectedBookings: [], loadingBookings: false });

  useEffect(() => {
    getChargers()
      .then((res) => setChargers(res.data))
      .catch(() => showToast('error', 'Failed to load chargers.'))
      .finally(() => setLoadingChargers(false));
  }, [showToast]);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () =>
    setForm({ chargerId: '', startTime: '', endTime: '', reason: '' });

  const buildPayload = (f: FormState, force: boolean): Parameters<typeof createMaintenanceBlock>[0] => ({
    chargerId: f.chargerId,
    startTime: new Date(f.startTime).toISOString(),
    ...(f.endTime ? { endTime: new Date(f.endTime).toISOString() } : {}),
    reason: f.reason,
    forceReleaseExistingBookings: force,
  });

  const applyCreatedBlock = (created: MaintenanceBlockResponse, f: FormState) => {
    const charger = chargers.find((c) => c.id === f.chargerId);
    setBlocks((prev) => [
      {
        id: created.id,
        chargerId: created.chargerId,
        chargerName: charger?.displayName ?? f.chargerId,
        startTime: created.startTime,
        endTime: created.endTime,
        reason: created.reason,
        isActive: created.isActive,
      },
      ...prev,
    ]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.chargerId) errs.chargerId = 'Please select a charger.';
    if (!form.startTime) errs.startTime = 'Start time is required.';
    if (!form.reason.trim()) errs.reason = 'A reason is required for a maintenance block.';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCreating(true);
    try {
      const created = await createMaintenanceBlock(buildPayload(form, false));
      applyCreatedBlock(created, form);
      setCreateOpen(false);
      resetForm();
      showToast('success', 'Maintenance block created.');
    } catch (err: unknown) {
      const e = err as Error & { apiError?: ApiError };
      const conflictCode = e.apiError?.errors?.[0]?.code;

      if (conflictCode === 'MaintenanceBlockConflict') {
        // Fetch the affected bookings to show in the confirmation dialog
        const savedForm = { ...form };
        setConflictModal({ open: true, pendingForm: savedForm, affectedBookings: [], loadingBookings: true });

        try {
          const farFuture = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
          const res = await getBookings({
            chargerId: savedForm.chargerId,
            dateFrom: new Date(savedForm.startTime).toISOString(),
            dateTo: savedForm.endTime ? new Date(savedForm.endTime).toISOString() : farFuture,
            limit: 50,
          });
          const affected = res.data.filter((b) =>
            ['Pending', 'Confirmed', 'Active'].includes(b.state),
          );
          setConflictModal((prev) => ({ ...prev, affectedBookings: affected, loadingBookings: false }));
        } catch {
          setConflictModal((prev) => ({ ...prev, loadingBookings: false }));
        }
      } else {
        showToast('error', e.apiError?.message ?? 'Failed to create maintenance block.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmOverride = async () => {
    if (!conflictModal.pendingForm) return;
    const f = conflictModal.pendingForm;
    setCreating(true);
    try {
      const created = await createMaintenanceBlock(buildPayload(f, true));

      applyCreatedBlock(created, f);
      setConflictModal({ open: false, pendingForm: null, affectedBookings: [], loadingBookings: false });
      setCreateOpen(false);
      resetForm();
      const count = conflictModal.affectedBookings.length;
      showToast(
        'success',
        count > 0
          ? `Maintenance block created. ${count} booking${count !== 1 ? 's' : ''} released and user${count !== 1 ? 's' : ''} notified.`
          : 'Maintenance block created.',
      );
    } catch (err: unknown) {
      const e = err as Error & { apiError?: ApiError };
      showToast('error', e.apiError?.message ?? 'Override failed. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteMaintenanceBlock(id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      showToast('success', 'Maintenance block removed.');
    } catch {
      showToast('error', 'Failed to remove maintenance block.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Maintenance Blocks</h1>
        <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Create Block
        </Button>
      </div>

      {blocks.length === 0 ? (
        <EmptyState
          icon={<WrenchScrewdriverIcon className="w-full h-full" />}
          heading="No active maintenance blocks"
          body="Create a maintenance block to prevent bookings on a charger during scheduled downtime."
          ctaLabel="Create Block"
          onCta={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.map((b) => (
            <div key={b.id} className="bg-brand-800 rounded-card border border-orange-700/40 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-white">{b.chargerName}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-700/60 text-orange-200">Active</span>
              </div>
              <p className="text-xs text-gray-300">
                {formatDatetime(b.startTime)} — {b.endTime ? formatDatetime(b.endTime) : 'open-ended'}
              </p>
              <p className="text-xs text-gray-400">Reason: {b.reason}</p>
              <Button variant="destructive" size="sm" onClick={() => handleRemove(b.id)}>
                Remove Block
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── Create modal ──────────────────────────────────────────── */}
      <Modal open={createOpen} title="Create Maintenance Block" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} noValidate className="space-y-4">
          <FormField label="Charger" htmlFor="mb-charger" error={formErrors.chargerId} required>
            <select
              id="mb-charger"
              value={form.chargerId}
              onChange={(e) => { set('chargerId', e.target.value); setFormErrors((p) => ({ ...p, chargerId: '' })); }}
              className={cn(inputClasses(!!formErrors.chargerId))}
              disabled={loadingChargers}
            >
              <option value="">{loadingChargers ? 'Loading chargers…' : 'Select a charger'}</option>
              {chargers.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName} ({c.location.code})</option>
              ))}
            </select>
          </FormField>

          <FormField label="Start time" htmlFor="mb-start" error={formErrors.startTime} required>
            <input
              id="mb-start"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => { set('startTime', e.target.value); setFormErrors((p) => ({ ...p, startTime: '' })); }}
              className={cn(inputClasses(!!formErrors.startTime))}
            />
          </FormField>

          <FormField label="End time (optional)" htmlFor="mb-end">
            <input
              id="mb-end"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
              className={cn(inputClasses())}
            />
          </FormField>

          <FormField label="Reason" htmlFor="mb-reason" error={formErrors.reason} required>
            <textarea
              id="mb-reason"
              rows={2}
              value={form.reason}
              onChange={(e) => { set('reason', e.target.value); setFormErrors((p) => ({ ...p, reason: '' })); }}
              className={cn(inputClasses(!!formErrors.reason), 'resize-none')}
              placeholder="Firmware update, cable replacement…"
            />
          </FormField>

          <div className="flex gap-3 pt-1">
            <Button type="submit" variant="primary" size="md" loading={creating} className="flex-1">
              Create Block
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Conflict override confirmation dialog ──────────────────── */}
      <Modal
        open={conflictModal.open}
        title="Booking Conflicts Detected"
        onClose={() => setConflictModal({ open: false, pendingForm: null, affectedBookings: [], loadingBookings: false })}
      >
        <div className="space-y-4">
          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-lg bg-amber-900/40 border border-amber-600/50 px-4 py-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-amber-200">
              <p className="font-semibold mb-0.5">This maintenance window overlaps existing bookings.</p>
              <p className="text-amber-300">
                Confirming will release the affected bookings and notify each user.
                This action is audit-logged.
              </p>
            </div>
          </div>

          {/* Affected bookings list */}
          <div>
            <p className="text-sm font-medium text-gray-200 mb-2">
              Affected bookings
              {conflictModal.affectedBookings.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-700/50 text-amber-200 text-xs">
                  {conflictModal.affectedBookings.length}
                </span>
              )}
            </p>

            {conflictModal.loadingBookings ? (
              <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                <div className="h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                Loading affected bookings…
              </div>
            ) : conflictModal.affectedBookings.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">
                Booking details could not be loaded. Proceed only if you are certain.
              </p>
            ) : (
              <div className="rounded-lg border border-brand-700 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-brand-700 bg-brand-700/30">
                      <th className="text-left px-3 py-2 text-gray-300 font-medium">User</th>
                      <th className="text-left px-3 py-2 text-gray-300 font-medium">Time window</th>
                      <th className="text-left px-3 py-2 text-gray-300 font-medium">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conflictModal.affectedBookings.map((b, i) => (
                      <tr
                        key={b.id}
                        className={cn('border-t border-brand-700/40', i % 2 !== 0 && 'bg-brand-700/10')}
                      >
                        <td className="px-3 py-2 text-white">{b.userDisplayName}</td>
                        <td className="px-3 py-2 text-gray-300 font-mono">
                          {formatTimeWindow(b.startTime, b.endTime)}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded-full bg-brand-600/60 text-brand-200 text-xs">
                            {b.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reason recap */}
          {conflictModal.pendingForm?.reason && (
            <div className="text-sm text-gray-400">
              <span className="font-medium text-gray-300">Override reason: </span>
              {conflictModal.pendingForm.reason}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="primary"
              size="md"
              loading={creating}
              onClick={handleConfirmOverride}
              className="flex-1 bg-amber-600 hover:bg-amber-500 focus-visible:ring-amber-500"
            >
              Confirm override &amp; release bookings
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setConflictModal({ open: false, pendingForm: null, affectedBookings: [], loadingBookings: false })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

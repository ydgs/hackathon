import { useState } from 'react';
import { WrenchScrewdriverIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField, inputClasses } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../lib/classNames';
import { MOCK_CHARGERS } from '../../mocks/chargers.mock';

interface MaintenanceBlock {
  id: string;
  chargerId: string;
  chargerName: string;
  startTime: string;
  endTime: string | null;
  reason: string;
  isActive: boolean;
}

// MOCK: replace with real API calls to POST/DELETE /api/v1/maintenance-blocks when backend is ready
const initialBlocks: MaintenanceBlock[] = [];

export function MaintenancePage() {
  const { showToast } = useToast();
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>(initialBlocks);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    chargerId: '',
    startTime: '',
    endTime: '',
    reason: '',
    forceRelease: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.chargerId) errs.chargerId = 'Please select a charger.';
    if (!form.startTime) errs.startTime = 'Start time is required.';
    if (!form.reason.trim()) errs.reason = 'A reason is required for a maintenance block.';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCreating(true);
    await new Promise((r) => setTimeout(r, 400));
    const charger = MOCK_CHARGERS.find((c) => c.id === form.chargerId);
    const block: MaintenanceBlock = {
      id: `mb-${Date.now()}`,
      chargerId: form.chargerId,
      chargerName: charger?.displayName ?? form.chargerId,
      startTime: form.startTime,
      endTime: form.endTime || null,
      reason: form.reason,
      isActive: true,
    };
    setBlocks((prev) => [block, ...prev]);
    setCreateOpen(false);
    setCreating(false);
    showToast('success', 'Maintenance block created.');
  };

  const handleRemove = async (id: string) => {
    await new Promise((r) => setTimeout(r, 300));
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    showToast('success', 'Maintenance block removed.');
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
                {b.startTime} — {b.endTime ?? 'open-ended'}
              </p>
              <p className="text-xs text-gray-400">Reason: {b.reason}</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(b.id)}
              >
                Remove Block
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} title="Create Maintenance Block" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} noValidate className="space-y-4">
          <FormField label="Charger" htmlFor="mb-charger" error={formErrors.chargerId} required>
            <select id="mb-charger" value={form.chargerId}
              onChange={(e) => { set('chargerId', e.target.value); setFormErrors((p) => ({ ...p, chargerId: '' })); }}
              className={cn(inputClasses(!!formErrors.chargerId))}>
              <option value="">Select a charger</option>
              {MOCK_CHARGERS.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Start time" htmlFor="mb-start" error={formErrors.startTime} required>
            <input id="mb-start" type="datetime-local" value={form.startTime}
              onChange={(e) => { set('startTime', e.target.value); setFormErrors((p) => ({ ...p, startTime: '' })); }}
              className={cn(inputClasses(!!formErrors.startTime))} />
          </FormField>

          <FormField label="End time (optional)" htmlFor="mb-end">
            <input id="mb-end" type="datetime-local" value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
              className={cn(inputClasses())} />
          </FormField>

          <FormField label="Reason" htmlFor="mb-reason" error={formErrors.reason} required>
            <textarea id="mb-reason" rows={2} value={form.reason}
              onChange={(e) => { set('reason', e.target.value); setFormErrors((p) => ({ ...p, reason: '' })); }}
              className={cn(inputClasses(!!formErrors.reason), 'resize-none')}
              placeholder="Firmware update, cable replacement…" />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.forceRelease}
              onChange={(e) => set('forceRelease', e.target.checked)}
              className="rounded"
            />
            Force release existing bookings in this window
          </label>

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
    </div>
  );
}

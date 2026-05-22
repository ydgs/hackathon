import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserGroupIcon, PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { EligibleUser } from '../../types';
import { getEligibleUsers, deleteEligibleUser } from '../../services/user.service';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { inputClasses } from '../../components/ui/FormField';
import { cn } from '../../lib/classNames';

export function UsersPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<EligibleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: EligibleUser | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEligibleUsers({ search, eligibilityStatus: statusFilter || undefined });
      setUsers(res.data);
    } catch {
      setError('Could not load eligible users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await deleteEligibleUser(deleteModal.user.id);
      showToast('success', 'User removed from eligible registry.');
      setDeleteModal({ open: false, user: null });
      await load();
    } catch {
      showToast('error', 'Failed to remove user. They may have active bookings.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Eligible EV Users</h1>
        {isAdmin && (
          <Button variant="primary" size="md" onClick={() => navigate('/admin/users/new')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search name or EID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClasses(), 'pl-9 text-sm py-1.5 w-56')}
            aria-label="Search users"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(inputClasses(), 'w-auto text-sm py-1.5')}
          aria-label="Filter by eligibility status"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading && <TableRowSkeleton rows={6} />}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          icon={<UserGroupIcon className="w-full h-full" />}
          heading="No users match your search"
          body="Try a different name or EID, or remove the status filter."
          ctaLabel="Clear Filters"
          onCta={() => { setSearch(''); setStatusFilter(''); }}
        />
      )}

      {!loading && users.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-brand-800 rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-700">
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">EID</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Privacy</th>
                  {isAdmin && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={cn('border-t border-brand-700/40', i % 2 === 0 ? '' : 'bg-brand-700/10')}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{u.displayName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{u.workplaceRegistryEid}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        u.eligibilityStatus === 'Active' ? 'bg-green-700/60 text-green-200' :
                        u.eligibilityStatus === 'Suspended' ? 'bg-amber-700/60 text-amber-200' :
                        'bg-gray-700/60 text-gray-300',
                      )}>
                        {u.eligibilityStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {u.vehicleMake ? `${u.vehicleMake} ${u.vehicleModel}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.privacyAcknowledgementStatus === 'Acknowledged' ? 'text-green-400 text-xs' : 'text-gray-500 text-xs'}>
                        {u.privacyAcknowledgementStatus === 'Acknowledged' ? '✓ Ack' : '✗ Pending'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/admin/users/${u.id}/edit`}>
                            <Button variant="ghost" size="sm" aria-label={`Edit ${u.displayName}`}>
                              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${u.displayName}`}
                            onClick={() => setDeleteModal({ open: true, user: u })}
                          >
                            <TrashIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-brand-800 rounded-card p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{u.displayName}</p>
                    <p className="text-xs text-gray-500">{u.workplaceRegistryEid}</p>
                  </div>
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    u.eligibilityStatus === 'Active' ? 'bg-green-700/60 text-green-200' : 'bg-amber-700/60 text-amber-200',
                  )}>
                    {u.eligibilityStatus}
                  </span>
                </div>
                {u.vehicleMake && <p className="text-xs text-gray-400">{u.vehicleMake} {u.vehicleModel}</p>}
                {isAdmin && (
                  <div className="flex gap-2 pt-1">
                    <Link to={`/admin/users/${u.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      <Modal
        open={deleteModal.open}
        title={`Remove ${deleteModal.user?.displayName ?? 'User'}`}
        onClose={() => setDeleteModal({ open: false, user: null })}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Remove <span className="font-semibold text-white">{deleteModal.user?.displayName}</span> from the eligible EV user registry?
          </p>
          <p className="text-xs text-gray-400">
            If the user has historical bookings, they will be set to Inactive instead of hard-deleted.
          </p>
          <div className="flex gap-3">
            <Button variant="destructive" size="md" loading={deleting} onClick={handleDelete} className="flex-1">
              Remove
            </Button>
            <Button variant="secondary" size="md" onClick={() => setDeleteModal({ open: false, user: null })}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

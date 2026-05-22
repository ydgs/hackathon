import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/classNames';

export function MobileBottomNav() {
  const { currentUser, isAdmin, isOperator } = useAuth();
  const canSeeReports =
    isAdmin || ['Workplace', 'Management', 'ReportingESGViewer'].includes(currentUser?.role ?? '');

  const items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { to: '/dashboard', label: 'Home',     icon: HomeIcon },
    { to: '/chargers',  label: 'Chargers', icon: BoltIcon },
  ];
  if (currentUser?.role === 'StandardUser') {
    items.push({ to: '/bookings/new',  label: 'Book',   icon: CalendarDaysIcon });
    items.push({ to: '/my-bookings',   label: 'Mine',   icon: ClipboardDocumentListIcon });
  } else if (isOperator) {
    items.push({ to: '/operations/bookings', label: 'Ops',  icon: ShieldCheckIcon });
  }
  if (canSeeReports) items.push({ to: '/reports', label: 'Reports', icon: ChartBarIcon });

  // Trim to 5 max
  const visible = items.slice(0, 5);

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-brand-700/60 bg-brand-800/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {visible.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-brand-300' : 'text-gray-400 hover:text-white',
                )
              }
              aria-label={it.label}
            >
              {({ isActive }) => (
                <>
                  <it.icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_4px_rgba(90,177,216,0.6)]')} aria-hidden="true" />
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

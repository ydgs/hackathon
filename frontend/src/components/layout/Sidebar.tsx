import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/classNames';

interface SidebarProps {
  collapsed?: boolean;
}

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
  group: 'main' | 'admin';
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 h-screen sticky top-0',
        'border-r border-brand-700/50 bg-brand-800/60 backdrop-blur-sm',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Primary"
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

export function SidebarContent({ collapsed = false, onNavigate }: SidebarContentProps) {
  const { currentUser, isAdmin, isOperator } = useAuth();
  const canSeeReports =
    isAdmin || ['Workplace', 'Management', 'ReportingESGViewer'].includes(currentUser?.role ?? '');

  const items: NavItem[] = [
    { to: '/dashboard',           label: 'Overview',     icon: HomeIcon,          visible: true,                          group: 'main' },
    { to: '/chargers',            label: 'Chargers',     icon: BoltIcon,          visible: true,                          group: 'main' },
    { to: '/bookings/new',        label: 'Book a slot',  icon: CalendarDaysIcon,  visible: currentUser?.role === 'StandardUser', group: 'main' },
    { to: '/my-bookings',         label: 'My sessions',  icon: ClipboardDocumentListIcon, visible: currentUser?.role === 'StandardUser', group: 'main' },
    { to: '/operations/bookings', label: 'Operations',   icon: ShieldCheckIcon,   visible: isOperator,                   group: 'main' },
    { to: '/reports',             label: 'Reports & ESG',icon: ChartBarIcon,      visible: canSeeReports,                group: 'main' },
    { to: '/notifications',       label: 'Notifications',icon: BellAlertIcon,     visible: true,                          group: 'main' },

    { to: '/admin/users',         label: 'Users',        icon: UsersIcon,                 visible: isAdmin || currentUser?.role === 'Workplace', group: 'admin' },
    { to: '/admin/maintenance',   label: 'Maintenance',  icon: WrenchScrewdriverIcon,     visible: isAdmin || currentUser?.role === 'Workplace', group: 'admin' },
    { to: '/admin/audit',         label: 'Audit log',    icon: ClipboardDocumentListIcon, visible: isAdmin,                                       group: 'admin' },
    { to: '/admin/config',        label: 'Config',       icon: Cog6ToothIcon,             visible: isAdmin,                                       group: 'admin' },
  ];

  const main = items.filter((i) => i.visible && i.group === 'main');
  const admin = items.filter((i) => i.visible && i.group === 'admin');

  const linkClass = (isActive: boolean) =>
    cn(
      'relative group flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
      collapsed ? 'justify-center px-2.5 py-2.5' : 'px-3 py-2.5',
      isActive
        ? 'bg-brand-500/15 text-white ring-1 ring-brand-400/40'
        : 'text-gray-300 hover:bg-brand-700/60 hover:text-white',
    );

  const renderItem = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/dashboard'}
      className={({ isActive }) => linkClass(isActive)}
      onClick={onNavigate}
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-brand-300" aria-hidden="true" />
          )}
          <item.icon className={cn('shrink-0 h-5 w-5')} aria-hidden="true" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-brand-700 px-2 py-1 text-xs text-white opacity-0 shadow-lg group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn('flex items-center gap-2 h-14 px-4 border-b border-brand-700/50', collapsed && 'justify-center px-2')}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center shadow-md shadow-brand-500/30 shrink-0">
          <BoltIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">NEXLevel</p>
            <p className="text-[10px] text-brand-300 uppercase tracking-wider leading-tight">EV Charge OS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {!collapsed && (
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-gray-500">Workspace</p>
        )}
        {main.map(renderItem)}

        {admin.length > 0 && (
          <>
            <div className={cn('mt-4 mb-1 border-t border-brand-700/40', !collapsed && 'mx-2')} />
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] uppercase tracking-widest text-gray-500">Admin</p>
            )}
            {admin.map(renderItem)}
          </>
        )}
      </nav>

      {/* Footer / system status */}
      {!collapsed && (
        <div className="m-3 rounded-lg border border-brand-700/60 bg-brand-700/30 p-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-xs font-semibold text-white">CSMS online</p>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">OCPP 1.6J · simulated demo data</p>
        </div>
      )}
    </div>
  );
}

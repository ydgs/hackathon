import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BoltIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/classNames';
import { getUnreadCount } from '../../services/notification.service';

export function NavBar() {
  const { currentUser, logout, isAdmin, isOperator } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    getUnreadCount()
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => {});
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-gray-300 hover:bg-brand-700 hover:text-white',
    );

  return (
    <nav
      className="bg-brand-800 border-b border-brand-700 h-14 flex items-center px-4 md:px-6 sticky top-0 z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 font-bold text-brand-400 text-base mr-6 shrink-0"
      >
        <BoltIcon className="h-6 w-6 text-brand-400" aria-hidden="true" />
        <span className="hidden sm:block">NEXLevel Charge</span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
        {currentUser?.role === 'StandardUser' && (
          <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>
        )}
        {isOperator && (
          <NavLink to="/operations/bookings" className={navLinkClass}>Operations</NavLink>
        )}
        {(isAdmin || currentUser?.role === 'Workplace' || currentUser?.role === 'ReportingESGViewer' || currentUser?.role === 'Management') && (
          <NavLink to="/reports" className={navLinkClass}>Reports</NavLink>
        )}

        {/* Admin dropdown */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setAdminOpen((o) => !o)}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium',
                'text-gray-300 hover:bg-brand-700 hover:text-white transition-colors',
              )}
              aria-expanded={adminOpen}
              aria-haspopup="true"
            >
              Admin
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            {adminOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-brand-800 border border-brand-700 rounded-lg shadow-xl z-50"
                role="menu"
              >
                {[
                  { to: '/admin/users', label: 'Users' },
                  { to: '/admin/maintenance', label: 'Maintenance' },
                  { to: '/admin/audit', label: 'Audit Log' },
                  { to: '/admin/notifications', label: 'Notifications Audit' },
                  { to: '/admin/config', label: 'Config' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-brand-700 hover:text-white first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setAdminOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-gray-300 hover:bg-brand-700 hover:text-white transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          {unreadCount > 0 ? (
            <BellAlertIcon className="h-5 w-5 text-brand-300" aria-hidden="true" />
          ) : (
            <BellIcon className="h-5 w-5" aria-hidden="true" />
          )}
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar / user */}
        <Link
          to="/profile"
          className="hidden md:flex items-center gap-2 px-2 py-1 rounded-lg text-gray-300 hover:bg-brand-700 hover:text-white transition-colors text-sm"
        >
          <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
          <span className="hidden lg:block max-w-[120px] truncate">
            {currentUser?.displayName}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hidden md:block px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-brand-700 hover:text-white transition-colors"
        >
          Sign out
        </button>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-brand-700"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-brand-800 border-b border-brand-700 shadow-xl z-40 p-4 space-y-1">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            ...(currentUser?.role === 'StandardUser' ? [{ to: '/my-bookings', label: 'My Bookings' }] : []),
            ...(isOperator ? [{ to: '/operations/bookings', label: 'Operations' }] : []),
            ...(isAdmin ? [{ to: '/reports', label: 'Reports' }] : []),
            { to: '/notifications', label: 'Notifications' },
            { to: '/profile', label: 'My Profile' },
            ...(isAdmin ? [
              { to: '/admin/users', label: 'Admin: Users' },
              { to: '/admin/maintenance', label: 'Admin: Maintenance' },
              { to: '/admin/audit', label: 'Admin: Audit Log' },
              { to: '/admin/notifications', label: 'Admin: Notifications' },
              { to: '/admin/config', label: 'Admin: Config' },
            ] : []),
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-brand-700"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}

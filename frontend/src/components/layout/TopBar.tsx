import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  Bars3Icon,
  ChevronDownIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/classNames';
import { getUnreadCount } from '../../services/notification.service';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

const LOCATIONS = [
  { code: 'ALL',         label: 'All locations' },
  { code: 'NEX-TOWER',   label: 'NEX Tower' },
  { code: 'NEXTERACOM',  label: 'NEXTERACOM' },
];

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [locOpen, setLocOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [location, setLocation] = useState(LOCATIONS[0]);

  useEffect(() => {
    if (!currentUser) return;
    getUnreadCount().then((r) => setUnread(r.unreadCount)).catch(() => {});
  }, [currentUser]);

  const initials = (currentUser?.displayName ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-brand-700/50 bg-brand-900/80 backdrop-blur-md">
      <div className="h-full flex items-center gap-2 px-3 sm:px-5">
        {/* Mobile brand + sidebar toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-brand-700"
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <Link to="/dashboard" className="md:hidden flex items-center gap-2 font-bold text-white">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center shadow shadow-brand-500/30">
            <BoltIcon className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm">NEXLevel</span>
        </Link>

        {/* Desktop location selector */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setLocOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-gray-200 hover:bg-brand-700/60 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={locOpen}
          >
            <MapPinIcon className="h-4 w-4 text-brand-300" aria-hidden="true" />
            <span className="hidden sm:block font-medium">{location.label}</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </button>
          {locOpen && (
            <ul
              role="listbox"
              className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-brand-700 bg-brand-800 shadow-xl py-1 z-50"
            >
              {LOCATIONS.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={l.code === location.code}
                    onClick={() => { setLocation(l); setLocOpen(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-brand-700',
                      l.code === location.code ? 'text-white font-semibold' : 'text-gray-300',
                    )}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-emerald-200">CSMS live · OCPP 1.6J</span>
        </div>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-gray-300 hover:bg-brand-700 hover:text-white transition-colors"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        >
          {unread > 0 ? <BellAlertIcon className="h-5 w-5 text-brand-300" aria-hidden="true" /> : <BellIcon className="h-5 w-5" aria-hidden="true" />}
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
              aria-hidden="true"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-brand-700/60 transition-colors"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 text-white text-xs font-bold flex items-center justify-center shadow ring-2 ring-brand-700">
              {initials || <UserCircleIcon className="h-5 w-5" />}
            </div>
            <div className="hidden lg:flex flex-col items-start leading-tight max-w-[140px]">
              <span className="text-xs font-semibold text-white truncate w-full">{currentUser?.displayName}</span>
              <span className="text-[10px] text-gray-400 truncate w-full">{currentUser?.role}</span>
            </div>
          </button>
          {profileOpen && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-1 w-52 rounded-lg border border-brand-700 bg-brand-800 shadow-xl py-1 z-50"
            >
              <div className="px-3 py-2 border-b border-brand-700/60">
                <p className="text-sm font-semibold text-white truncate">{currentUser?.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
              </div>
              <Link
                to="/profile"
                role="menuitem"
                className="block px-3 py-2 text-sm text-gray-300 hover:bg-brand-700 hover:text-white"
                onClick={() => setProfileOpen(false)}
              >
                My profile
              </Link>
              <Link
                to="/notifications"
                role="menuitem"
                className="block px-3 py-2 text-sm text-gray-300 hover:bg-brand-700 hover:text-white"
                onClick={() => setProfileOpen(false)}
              >
                Notifications
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-brand-700 hover:text-white"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

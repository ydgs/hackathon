import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/classNames';
import { Sidebar, SidebarContent } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-brand-900 via-brand-900 to-[#0b1b32] text-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative w-72 max-w-[85vw] h-full bg-brand-800 shadow-2xl overflow-y-auto"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setDrawerOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg text-gray-300 hover:bg-brand-700"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onToggleSidebar={() => setDrawerOpen(true)} />
        <main
          className={cn(
            'flex-1 w-full max-w-screen-2xl mx-auto',
            'px-4 sm:px-6 lg:px-8 py-5 sm:py-7',
            'pb-24 md:pb-10',
          )}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}


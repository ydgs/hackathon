import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-brand-900 flex flex-col">
      <NavBar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 md:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Brand header */}
      <div className="flex items-center gap-2 mb-8">
        <BoltIcon className="h-8 w-8 text-brand-400" aria-hidden="true" />
        <div>
          <p className="text-xl font-bold text-brand-400 leading-none">NEXLevel Charge</p>
          <p className="text-xs text-gray-400 mt-0.5">AI-Powered EV Charging Orchestration</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-brand-800 rounded-card shadow-2xl border border-brand-700/40 overflow-hidden">
        <Outlet />
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-600 text-center">
        Accenture Mauritius · NEX Tower & NEXTERACOM
      </p>
    </div>
  );
}

import { BoltIcon, MapPinIcon, WrenchScrewdriverIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { Charger } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/classNames';
import { formatTime } from '../../lib/formatters';

interface ChargerCardProps {
  charger: Charger;
  isAdmin?: boolean;
  onBook?: (charger: Charger) => void;
  onStatusChange?: (charger: Charger) => void;
}

const ACCENT: Record<string, string> = {
  Available:             'before:bg-emerald-400',
  Charging:              'before:bg-violet-400',
  Reserved:              'before:bg-brand-300',
  BlockedForMaintenance: 'before:bg-orange-400',
  Unavailable:           'before:bg-gray-400',
  Faulted:               'before:bg-red-400',
};

export function ChargerCard({ charger, isAdmin = false, onBook, onStatusChange }: ChargerCardProps) {
  const canBook = charger.status === 'Available';

  return (
    <article
      aria-labelledby={`charger-${charger.id}-name`}
      className={cn(
        'relative overflow-hidden bg-brand-800 rounded-card p-5 flex flex-col gap-3',
        'border border-brand-700/50 shadow-sm hover:shadow-xl transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-brand-500/60',
        'before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r',
        ACCENT[charger.status] ?? 'before:bg-brand-500',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={`charger-${charger.id}-name`} className="text-base font-semibold text-white truncate">
            {charger.displayName}
          </h3>
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {charger.location.name} · #{charger.connectorId}
          </p>
        </div>
        <StatusBadge status={charger.status} type="charger" />
      </div>

      {/* Connector + power meta */}
      {(charger.connectorType || charger.powerRatingKw) && (
        <div className="flex flex-wrap gap-2">
          {charger.connectorType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-700/50 border border-brand-700 text-[11px] font-medium text-gray-200">
              {charger.connectorType}
            </span>
          )}
          {charger.powerRatingKw != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-700/50 border border-brand-700 text-[11px] font-medium text-brand-200">
              <BoltIcon className="h-3 w-3" aria-hidden="true" />
              {charger.powerRatingKw} kW
            </span>
          )}
        </div>
      )}

      {/* Status-specific info */}
      {charger.status === 'Available' && (
        <p className="text-xs text-emerald-300">Charger available now</p>
      )}

      {charger.status === 'Charging' && charger.activeSession && (
        <div className="text-xs text-gray-300 space-y-1 rounded-lg bg-brand-700/30 border border-brand-700/40 p-2.5">
          <p className="flex items-center gap-1 text-violet-300 font-semibold">
            <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-mono tabular-nums">{charger.activeSession.energyKwh.toFixed(2)} kWh</span>
            <span className="text-gray-400 font-normal">· {charger.activeSession.elapsedMinutes} min elapsed</span>
          </p>
          {charger.activeSession.userDisplayName !== '***' && (
            <p className="text-gray-400 truncate">{charger.activeSession.userDisplayName}</p>
          )}
          {charger.activeSession.vehicleMake !== '***' && (
            <p className="text-gray-500 truncate">
              {charger.activeSession.vehicleMake} {charger.activeSession.vehicleModel}
            </p>
          )}
        </div>
      )}

      {charger.status === 'Reserved' && (
        <p className="flex items-center gap-1 text-xs text-brand-200">
          <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Reserved until {formatTime(new Date(Date.now() + 30 * 60_000).toISOString())}
        </p>
      )}

      {charger.status === 'Faulted' && (
        <p className="text-xs text-red-400">Error — contact security</p>
      )}

      {charger.status === 'BlockedForMaintenance' && (
        <p className="flex items-center gap-1 text-xs text-orange-300">
          <WrenchScrewdriverIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Maintenance block active
        </p>
      )}

      {charger.status === 'Unavailable' && (
        <p className="text-xs text-gray-400">Offline — last seen recently</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-3 border-t border-brand-700/40">
        {canBook && onBook ? (
          <Button variant="primary" size="sm" className="flex-1" onClick={() => onBook(charger)}>
            Book now
          </Button>
        ) : (
          <Link to={`/chargers?focus=${charger.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full" disabled={charger.status === 'Faulted'}>
              View details
            </Button>
          </Link>
        )}
        {isAdmin && onStatusChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(charger)}
            aria-label={`Update status for ${charger.displayName}`}
          >
            Status
          </Button>
        )}
      </div>
    </article>
  );
}

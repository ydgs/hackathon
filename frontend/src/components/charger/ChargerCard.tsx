import { BoltIcon, MapPinIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { Charger } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/classNames';

interface ChargerCardProps {
  charger: Charger;
  isAdmin?: boolean;
  onBook?: (charger: Charger) => void;
  onStatusChange?: (charger: Charger) => void;
}

export function ChargerCard({ charger, isAdmin = false, onBook, onStatusChange }: ChargerCardProps) {
  const canBook = charger.status === 'Available';

  return (
    <article
      aria-labelledby={`charger-${charger.id}-name`}
      className={cn(
        'bg-brand-800 rounded-card p-5 flex flex-col gap-3',
        'shadow-sm hover:shadow-md transition-shadow',
        'border border-brand-700/50',
      )}
    >
      {/* Status badge */}
      <StatusBadge status={charger.status} type="charger" />

      {/* Charger name */}
      <div>
        <h3
          id={`charger-${charger.id}-name`}
          className="text-base font-semibold text-white"
        >
          {charger.displayName}
        </h3>
        <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {charger.location.name} · Connector {charger.connectorId}
        </p>
      </div>

      {/* Status-specific info */}
      {charger.status === 'Charging' && charger.activeSession && (
        <div className="text-xs text-gray-300 space-y-1">
          <p>
            <BoltIcon className="inline h-3.5 w-3.5 text-status-charging mr-1" aria-hidden="true" />
            <span className="font-mono">{charger.activeSession.energyKwh.toFixed(2)} kWh</span>
            {' · '}
            {charger.activeSession.elapsedMinutes} min elapsed
          </p>
          {charger.activeSession.userDisplayName !== '***' && (
            <p className="text-gray-400">{charger.activeSession.userDisplayName}</p>
          )}
          {charger.activeSession.vehicleMake !== '***' && (
            <p className="text-gray-400">
              {charger.activeSession.vehicleMake} {charger.activeSession.vehicleModel}
            </p>
          )}
        </div>
      )}

      {charger.status === 'Reserved' && (
        <p className="text-xs text-gray-300">
          Slot: upcoming reservation
        </p>
      )}

      {charger.status === 'Faulted' && (
        <p className="text-xs text-red-400">Error — contact security</p>
      )}

      {charger.status === 'BlockedForMaintenance' && (
        <p className="flex items-center gap-1 text-xs text-orange-400">
          <WrenchScrewdriverIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Maintenance block active
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-brand-700/40">
        {canBook && onBook ? (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onBook(charger)}
          >
            Book
          </Button>
        ) : (
          <Link
            to={`/bookings?chargerId=${charger.id}`}
            className="flex-1"
          >
            <Button variant="secondary" size="sm" className="w-full">
              Detail
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

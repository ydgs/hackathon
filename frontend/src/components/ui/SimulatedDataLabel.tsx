import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/classNames';

interface SimulatedDataLabelProps {
  label: string;
  className?: string;
}

export function SimulatedDataLabel({ label, className }: SimulatedDataLabelProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
        'bg-amber-900/40 border border-amber-500/50 text-amber-300',
        className,
      )}
    >
      <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

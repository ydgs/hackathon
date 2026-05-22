import { cn } from '../../lib/classNames';

interface KpiTileProps {
  value: string | number;
  label: string;
  subLabel?: string;
  className?: string;
}

export function KpiTile({ value, label, subLabel, className }: KpiTileProps) {
  return (
    <div
      className={cn(
        'bg-brand-800 rounded-card p-6 flex flex-col gap-1',
        'shadow-sm',
        className,
      )}
    >
      <p className="text-4xl font-bold text-white leading-none">{value}</p>
      <p className="text-sm font-semibold text-brand-300 mt-1">{label}</p>
      {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
    </div>
  );
}

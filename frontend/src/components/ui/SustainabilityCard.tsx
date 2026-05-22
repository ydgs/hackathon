import { GlobeAltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/classNames';

interface SustainabilityCardProps {
  co2SavedKg: number;
  energyKwh: number;
  emissionFactor: number;
  /** 0..1 progress toward an arbitrary monthly goal for visual interest */
  monthlyGoalProgress?: number;
  ctaHref?: string;
  className?: string;
}

export function SustainabilityCard({
  co2SavedKg,
  energyKwh,
  emissionFactor,
  monthlyGoalProgress = 0.62,
  ctaHref,
  className,
}: SustainabilityCardProps) {
  const pct = Math.min(100, Math.max(0, monthlyGoalProgress * 100));
  // Rough equivalent: kg CO2 per tree per year ≈ 21
  const treeEquivalent = Math.max(1, Math.round(co2SavedKg / 21));

  return (
    <section
      aria-labelledby="sust-card-title"
      className={cn(
        'relative overflow-hidden rounded-card p-5 sm:p-6',
        'border border-emerald-500/30 ring-1 ring-emerald-500/20',
        'bg-gradient-to-br from-emerald-900/40 via-brand-800 to-brand-800',
        'shadow-lg',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full blur-3xl opacity-40 bg-gradient-to-tr from-emerald-500/40 via-teal-500/20 to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center" aria-hidden="true">
          <GlobeAltIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Sustainability</p>
          <h3 id="sust-card-title" className="text-sm font-semibold text-white">Your low-carbon impact</h3>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-white leading-none tabular-nums">
            {co2SavedKg.toFixed(1)}
            <span className="text-base font-medium text-emerald-300 ml-1">kg</span>
          </p>
          <p className="mt-1 text-xs text-gray-300">CO₂ avoided</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white leading-none tabular-nums">
            {energyKwh.toFixed(1)}
            <span className="text-base font-medium text-emerald-300 ml-1">kWh</span>
          </p>
          <p className="mt-1 text-xs text-gray-300">Clean energy used</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="flex justify-between text-xs text-gray-300 mb-1.5">
          <span>Monthly ESG goal</span>
          <span className="tabular-nums font-medium text-emerald-300">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full bg-brand-700/60 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Monthly ESG goal progress">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="relative mt-4 text-xs text-gray-400">
        ≈ <span className="text-emerald-300 font-semibold">{treeEquivalent} trees</span> absorbing CO₂ for a year
        <span className="text-gray-500"> · factor {emissionFactor} kg/kWh</span>
      </p>

      {ctaHref && (
        <Link
          to={ctaHref}
          className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          Open ESG report
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}

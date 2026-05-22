import React from 'react';
import { cn } from '../../lib/classNames';

export type StatAccent = 'blue' | 'green' | 'amber' | 'violet' | 'red';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
  accent?: StatAccent;
  className?: string;
}

const ACCENTS: Record<StatAccent, { ring: string; iconBg: string; iconFg: string; glow: string }> = {
  blue:   { ring: 'ring-brand-500/30',   iconBg: 'bg-brand-500/15',   iconFg: 'text-brand-300',   glow: 'from-brand-500/20' },
  green:  { ring: 'ring-emerald-500/30', iconBg: 'bg-emerald-500/15', iconFg: 'text-emerald-300', glow: 'from-emerald-500/20' },
  amber:  { ring: 'ring-amber-500/30',   iconBg: 'bg-amber-500/15',   iconFg: 'text-amber-300',   glow: 'from-amber-500/20' },
  violet: { ring: 'ring-violet-500/30',  iconBg: 'bg-violet-500/15',  iconFg: 'text-violet-300',  glow: 'from-violet-500/20' },
  red:    { ring: 'ring-red-500/30',     iconBg: 'bg-red-500/15',     iconFg: 'text-red-300',     glow: 'from-red-500/20' },
};

const TREND_STYLES = {
  up:   { color: 'text-emerald-400', symbol: '▲' },
  down: { color: 'text-red-400',     symbol: '▼' },
  flat: { color: 'text-gray-400',    symbol: '◆' },
};

export function StatCard({ icon, label, value, hint, trend, accent = 'blue', className }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-brand-800 rounded-card p-5 ring-1',
        'border border-brand-700/40 shadow-sm hover:shadow-lg transition-all duration-200',
        'hover:-translate-y-0.5',
        a.ring,
        className,
      )}
    >
      {/* Decorative glow */}
      <div
        className={cn(
          'pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-60',
          'bg-gradient-to-br',
          a.glow,
          'to-transparent',
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white leading-none tabular-nums">{value}</p>
          {hint && <p className="mt-2 text-xs text-gray-400 truncate">{hint}</p>}
          {trend && (
            <p className={cn('mt-2 text-xs font-medium flex items-center gap-1', TREND_STYLES[trend.direction].color)}>
              <span aria-hidden="true">{TREND_STYLES[trend.direction].symbol}</span>
              <span>{trend.label}</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'shrink-0 h-11 w-11 rounded-xl flex items-center justify-center',
            a.iconBg, a.iconFg,
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

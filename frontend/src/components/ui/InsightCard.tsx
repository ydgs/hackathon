import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/classNames';
import type { AiConfidence } from '../../types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface InsightCardProps {
  title: string;
  summary: string;
  bullets?: string[];
  confidence?: AiConfidence;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function InsightCard({
  title,
  summary,
  bullets,
  confidence,
  ctaLabel,
  ctaHref,
  className,
}: InsightCardProps) {
  return (
    <section
      aria-labelledby="insight-card-title"
      className={cn(
        'relative overflow-hidden rounded-card p-5 sm:p-6',
        'border border-violet-500/30 ring-1 ring-violet-500/20',
        'bg-gradient-to-br from-violet-900/40 via-brand-800 to-brand-800',
        'shadow-lg',
        className,
      )}
    >
      {/* Decorative orb */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-50 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center"
            aria-hidden="true"
          >
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">AI Insight</p>
            <h3 id="insight-card-title" className="text-sm font-semibold text-white">{title}</h3>
          </div>
        </div>
        {confidence && <ConfidenceBadge confidence={confidence} />}
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-gray-200">{summary}</p>

      {bullets && bullets.length > 0 && (
        <ul className="relative mt-3 space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-xs text-gray-300">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="relative mt-4 text-[11px] text-gray-400 italic">
        AI insights assist decisions — they do not replace operational rules.
      </p>

      {ctaLabel && ctaHref && (
        <Link
          to={ctaHref}
          className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors"
        >
          {ctaLabel}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}

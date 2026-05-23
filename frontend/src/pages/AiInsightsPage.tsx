import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  SignalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { AiInsights, AiPattern, AiAnomaly, AiRecommendation, AiGrounding, DemandForecastEntry } from '../types';
import { getAiInsights } from '../services/report.service';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { SimulatedDataLabel } from '../components/ui/SimulatedDataLabel';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { cn } from '../lib/classNames';

export function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAiInsights();
      setInsights(data);
    } catch {
      setError('AI insights are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-9 w-9 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0" aria-hidden="true">
          <SparklesIcon className="h-5 w-5 text-violet-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-xs text-gray-400 mt-0.5">Grounded in real booking and session data</p>
        </div>
        {insights && (
          <div className="ml-auto">
            <ConfidenceBadge confidence={insights.confidence} />
          </div>
        )}
      </div>

      {insights?.simulatedDataLabel && <SimulatedDataLabel label={insights.simulatedDataLabel} />}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading && <LoadingState />}

      {!loading && !error && insights && (
        <>
          {insights.confidence === 'Low' && <LowConfidenceBanner />}

          <NlSummarySection nlSummary={insights.nlSummary} />
          <GroundingSection grounding={insights.grounding} />

          {/* Demand forecast — hidden when confidence is Low */}
          {insights.confidence !== 'Low' && insights.demandForecast.length > 0 && (
            <DemandForecastSection data={insights.demandForecast} />
          )}

          {insights.patterns.length > 0 && <PatternsSection patterns={insights.patterns} />}
          {insights.anomalies.length > 0 && <AnomaliesSection anomalies={insights.anomalies} />}
          {insights.recommendations.length > 0 && <RecommendationsSection recommendations={insights.recommendations} />}

          <AiDisclaimer />
        </>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-brand-800 rounded-card p-5 animate-pulse space-y-3">
          <div className="h-4 w-32 bg-brand-700 rounded" />
          <div className="h-3 w-full bg-brand-700 rounded" />
          <div className="h-3 w-3/4 bg-brand-700 rounded" />
        </div>
      ))}
    </div>
  );
}

// ── Low confidence banner ─────────────────────────────────────────────────────
function LowConfidenceBanner() {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card border border-amber-500/40 bg-amber-900/20 p-4 text-sm text-amber-200"
    >
      <ExclamationTriangleIcon className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
      <p>
        <span className="font-semibold">Limited confidence:</span> fewer than 10 sessions were available in the
        analysis window. Point forecasts are hidden. Insights are indicative only.
      </p>
    </div>
  );
}

// ── NL Summary ────────────────────────────────────────────────────────────────
function NlSummarySection({ nlSummary }: { nlSummary: string }) {
  return (
    <section aria-labelledby="ai-summary-heading" className="bg-brand-800 rounded-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="h-4 w-4 text-violet-400" aria-hidden="true" />
        <h2 id="ai-summary-heading" className="text-sm font-semibold text-gray-200">
          Summary
        </h2>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{nlSummary}</p>
    </section>
  );
}

// ── Grounding chips ───────────────────────────────────────────────────────────
const GROUNDING_CHIPS: {
  key: keyof AiGrounding;
  label: (g: AiGrounding) => string;
  tab: string;
  title: string;
}[] = [
  {
    key: 'sessionCount',
    label: (g) => `${g.sessionCount} sessions`,
    tab: 'sessions',
    title: 'View session metrics in Reports',
  },
  {
    key: 'totalKwh',
    label: (g) => `${g.totalKwh.toFixed(1)} kWh`,
    tab: 'energy',
    title: 'View energy metrics in Reports',
  },
  {
    key: 'peakHourBucket',
    label: (g) => `Peak at ${g.peakHourBucket}:00`,
    tab: 'sessions',
    title: 'View peak hour distribution in Reports',
  },
  {
    key: 'noShowRate',
    label: (g) => `${(g.noShowRate * 100).toFixed(1)}% no-show`,
    tab: 'sessions',
    title: 'View session breakdown in Reports',
  },
  {
    key: 'avgDurationMinutes',
    label: (g) => `${g.avgDurationMinutes.toFixed(1)} min avg`,
    tab: 'sessions',
    title: 'View average session duration in Reports',
  },
];

function GroundingSection({ grounding }: { grounding: AiGrounding }) {
  return (
    <section aria-labelledby="grounding-heading" className="bg-brand-800 rounded-card p-5">
      <h2 id="grounding-heading" className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        Grounding data
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Each chip links to the corresponding metric in the Reports dashboard.
      </p>
      <div className="flex flex-wrap gap-2">
        {GROUNDING_CHIPS.map(({ key, label, tab, title }) => (
          <Link
            key={key}
            to={`/reports?tab=${tab}`}
            title={title}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              'bg-violet-900/40 text-violet-300 border border-violet-500/30',
              'hover:bg-violet-900/60 hover:text-violet-200 hover:border-violet-400/50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
            )}
          >
            {label(grounding)}
            <ArrowTopRightOnSquareIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Demand Forecast ───────────────────────────────────────────────────────────
function DemandForecastSection({ data }: { data: DemandForecastEntry[] }) {
  const max = Math.max(...data.map((d) => d.demandScore), 1);
  return (
    <section aria-labelledby="forecast-heading" className="bg-brand-800 rounded-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <h2 id="forecast-heading" className="text-sm font-semibold text-gray-200">
          Demand Forecast (next 24 h)
        </h2>
      </div>
      <div
        className="space-y-2"
        role="img"
        aria-label="Demand forecast bar chart — relative demand score by hour"
      >
        {data.map((d) => (
          <div key={d.hourBucket} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-10 shrink-0">{d.hourBucket}:00</span>
            <div className="flex-1 h-4 bg-brand-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  d.demandScore >= 0.8
                    ? 'bg-red-500'
                    : d.demandScore >= 0.5
                    ? 'bg-amber-500'
                    : 'bg-green-500',
                )}
                style={{ width: `${(d.demandScore / max) * 100}%` }}
                aria-label={`${d.hourBucket}:00 — ${(d.demandScore * 100).toFixed(0)}% demand`}
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right shrink-0">
              {(d.demandScore * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Red ≥ 80 % · Amber 50–79 % · Green &lt; 50 % — relative to highest forecast window
      </p>
    </section>
  );
}

// ── Patterns ──────────────────────────────────────────────────────────────────
const SEVERITY_STYLES: Record<string, string> = {
  High:   'bg-red-900/40 text-red-300 border-red-500/40',
  Medium: 'bg-amber-900/40 text-amber-300 border-amber-500/40',
  Low:    'bg-blue-900/40 text-blue-300 border-blue-500/40',
};

const PATTERN_LABELS: Record<string, string> = {
  UnderusedCharger:  'Underused charger',
  PeakConcentration: 'Peak concentration',
  RepeatedLateRelease: 'Repeated late release',
  RepeatedNoShow:    'Repeated no-show',
};

function PatternsSection({ patterns }: { patterns: AiPattern[] }) {
  return (
    <section aria-labelledby="patterns-heading" className="bg-brand-800 rounded-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <SignalIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <h2 id="patterns-heading" className="text-sm font-semibold text-gray-200">
          Detected Patterns
        </h2>
      </div>
      {patterns.map((p, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start justify-between gap-4 rounded-lg border p-3',
            SEVERITY_STYLES[p.severity] ?? 'bg-brand-700/40 text-gray-300 border-brand-600',
          )}
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {PATTERN_LABELS[p.patternType] ?? p.patternType}
            </p>
            <p className="text-xs opacity-80">
              Entity: <span className="font-mono">{p.entityId}</span> · {p.supportingCount} supporting records
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider opacity-80">
            {p.severity}
          </span>
        </div>
      ))}
    </section>
  );
}

// ── Anomalies ─────────────────────────────────────────────────────────────────
function AnomaliesSection({ anomalies }: { anomalies: AiAnomaly[] }) {
  return (
    <section aria-labelledby="anomalies-heading" className="bg-brand-800 rounded-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
        <h2 id="anomalies-heading" className="text-sm font-semibold text-gray-200">
          Anomalies
        </h2>
      </div>
      {anomalies.map((a, i) => (
        <div key={i} className="rounded-lg border border-amber-500/30 bg-amber-900/20 p-3 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-amber-200">{a.anomalyType}</p>
            <span className="text-xs font-mono text-amber-300 shrink-0">
              {a.observedValue} kWh
            </span>
          </div>
          <p className="text-xs text-amber-300/80">
            Expected: {a.expectedRange} · <span className="font-mono">{a.entityId}</span>
          </p>
          <p className="text-xs text-gray-400">{a.reason}</p>
        </div>
      ))}
    </section>
  );
}

// ── Recommendations ───────────────────────────────────────────────────────────
function RecommendationsSection({ recommendations }: { recommendations: AiRecommendation[] }) {
  return (
    <section aria-labelledby="recommendations-heading" className="bg-brand-800 rounded-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <LightBulbIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
        <h2 id="recommendations-heading" className="text-sm font-semibold text-gray-200">
          Recommendations
        </h2>
      </div>
      {recommendations.map((r, i) => (
        <div key={i} className="rounded-lg bg-brand-700/40 border border-brand-600 p-4 space-y-2">
          <p className="text-sm text-white leading-relaxed">{r.text}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>
              Metric: <span className="font-mono text-gray-300">{r.metric}</span>
            </span>
            <span>{r.thresholdReason}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

// ── Disclaimer ────────────────────────────────────────────────────────────────
function AiDisclaimer() {
  return (
    <p className="text-xs text-gray-500 text-center pb-4">
      AI insights assist decisions — they do not replace operational rules or the 1&nbsp;h/day fair-use
      cap. All outputs are grounded in platform data.
    </p>
  );
}

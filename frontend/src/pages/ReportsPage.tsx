import { useState, useEffect } from 'react';
import type { ReportSummary, ReportSessions, ReportEnergy, AiInsights, ReportSustainability, ReportUtilization } from '../types';
import {
  getReportSummary, getReportSessions, getReportEnergy,
  getReportSustainability, getReportUtilization, getAiInsights,
} from '../services/report.service';
import { KpiTile } from '../components/ui/KpiTile';
import { KpiSkeleton } from '../components/ui/LoadingSkeleton';
import { SimulatedDataLabel } from '../components/ui/SimulatedDataLabel';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { cn } from '../lib/classNames';
import { formatKwh, formatCo2, formatPercent } from '../lib/formatters';

type Tab = 'overview' | 'sessions' | 'energy' | 'utilisation' | 'sustainability' | 'ai';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',      label: 'Overview' },
  { id: 'sessions',      label: 'Sessions' },
  { id: 'energy',        label: 'Energy' },
  { id: 'utilisation',   label: 'Utilisation' },
  { id: 'sustainability',label: 'Sustainability' },
  { id: 'ai',            label: 'AI Insights ✦' },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [simulatedLabel, setSimulatedLabel] = useState<string | null>('Based on simulated demo data');

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [sessions, setSessions] = useState<ReportSessions | null>(null);
  const [energy, setEnergy] = useState<ReportEnergy | null>(null);
  const [sustainability, setSustainability] = useState<ReportSustainability | null>(null);
  const [utilization, setUtilization] = useState<ReportUtilization | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [sumRes, sessRes, enerRes, sustRes, utilRes] = await Promise.all([
          getReportSummary(),
          getReportSessions(),
          getReportEnergy(),
          getReportSustainability(),
          getReportUtilization(),
        ]);
        setSummary(sumRes.data);
        setSessions(sessRes.data);
        setEnergy(enerRes.data);
        setSustainability(sustRes.data);
        setUtilization(utilRes.data);
        setSimulatedLabel(sumRes.simulatedDataLabel);
      } catch {
        setError('Could not load report data. Please retry.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const loadAi = async () => {
    try {
      const ai = await getAiInsights();
      setAiInsights(ai);
    } catch {
      setError('AI insights temporarily unavailable.');
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' && !aiInsights) loadAi();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Reports & Sustainability</h1>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-brand-700 flex-nowrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors',
              activeTab === t.id
                ? 'bg-brand-500 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-brand-800',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Simulated data label */}
      {simulatedLabel && (
        <SimulatedDataLabel label={simulatedLabel} />
      )}

      {error && <ErrorBanner message={error} onRetry={() => { setError(''); setLoading(true); }} />}

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab loading={loading} summary={summary} />
      )}
      {activeTab === 'sessions' && (
        <SessionsTab loading={loading} sessions={sessions} energy={energy} />
      )}
      {activeTab === 'energy' && (
        <EnergyTab loading={loading} energy={energy} />
      )}
      {activeTab === 'utilisation' && (
        <UtilisationTab loading={loading} utilization={utilization} />
      )}
      {activeTab === 'sustainability' && (
        <SustainabilityTab loading={loading} sustainability={sustainability} />
      )}
      {activeTab === 'ai' && (
        <AiTab loading={!aiInsights} insights={aiInsights} />
      )}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ loading, summary }: { loading: boolean; summary: ReportSummary | null }) {
  if (loading) return <KpiSkeleton />;
  if (!summary) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KpiTile value={summary.totalSessions} label="Total Sessions" />
      <KpiTile value={`${summary.totalKwh.toFixed(1)} kWh`} label="Total Energy" />
      <KpiTile
        value={`${summary.estimatedCo2SavingsKg.toFixed(1)} kg`}
        label="Estimated CO₂ Savings"
        subLabel={`(factor: ${summary.emissionFactorUsed} kg/kWh)`}
      />
    </div>
  );
}

// ── Sessions Tab ─────────────────────────────────────────────────────────────
function SessionsTab({ loading, sessions, energy }: { loading: boolean; sessions: ReportSessions | null; energy: ReportEnergy | null }) {
  if (loading) return <KpiSkeleton />;
  if (!sessions) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiTile value={sessions.completedCount} label="Completed" />
        <KpiTile value={sessions.cancelledCount} label="Cancelled" />
        <KpiTile value={sessions.releasedCount} label="Released" />
        <KpiTile value={sessions.noShowCount} label="No-shows" />
        <KpiTile value={`${sessions.avgDurationMinutes.toFixed(1)} min`} label="Avg Duration" />
        <KpiTile value={`${sessions.avgKwh.toFixed(2)} kWh`} label="Avg kWh/Session" />
      </div>
      {energy && (
        <div className="bg-brand-800 rounded-card p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Peak Hour Distribution</h3>
          <PeakHourChart data={energy.peakHourDistribution} />
        </div>
      )}
    </div>
  );
}

// ── Energy Tab ────────────────────────────────────────────────────────────────
function EnergyTab({ loading, energy }: { loading: boolean; energy: ReportEnergy | null }) {
  if (loading) return <KpiSkeleton />;
  if (!energy) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <KpiTile value={formatKwh(energy.totalKwh)} label="Total Energy" />
        <KpiTile value={formatKwh(energy.avgKwhPerSession)} label="Avg kWh/Session" />
      </div>
      <div className="bg-brand-800 rounded-card p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Charger Ranking</h3>
        <ChargerRankingChart data={energy.chargerRanking} />
      </div>
    </div>
  );
}

// ── Utilisation Tab ───────────────────────────────────────────────────────────
function UtilisationTab({ loading, utilization }: { loading: boolean; utilization: ReportUtilization | null }) {
  if (loading) return <KpiSkeleton />;
  if (!utilization) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(utilization.locationComparison).map(([loc, stats]) => (
          <div key={loc} className="bg-brand-800 rounded-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-white">{loc === 'NEX-TOWER' ? 'NEX Tower' : 'NEXTERACOM'}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-white">{stats.totalSessions}</p>
                <p className="text-xs text-gray-400">Sessions</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatKwh(stats.totalKwh)}</p>
                <p className="text-xs text-gray-400">Energy</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatPercent(stats.avgUtilizationPercent)}</p>
                <p className="text-xs text-gray-400">Utilization</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-brand-800 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-700">
              <th className="text-left px-4 py-3 text-gray-300 font-medium">Charger</th>
              <th className="text-right px-4 py-3 text-gray-300 font-medium">Utilization</th>
              <th className="text-right px-4 py-3 text-gray-300 font-medium hidden sm:table-cell">Faulted Events</th>
              <th className="text-right px-4 py-3 text-gray-300 font-medium hidden sm:table-cell">Maint. (min)</th>
            </tr>
          </thead>
          <tbody>
            {utilization.chargers.map((c, i) => (
              <tr key={c.chargerId} className={i % 2 === 0 ? '' : 'bg-brand-700/20'}>
                <td className="px-4 py-3 text-white">{c.displayName}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-brand-700 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-brand-400 rounded-full"
                        style={{ width: `${c.utilizationPercent}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{formatPercent(c.utilizationPercent)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-300 hidden sm:table-cell">{c.faultedEventCount}</td>
                <td className="px-4 py-3 text-right text-gray-300 hidden sm:table-cell">{c.blockedForMaintenanceMinutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sustainability Tab ────────────────────────────────────────────────────────
function SustainabilityTab({ loading, sustainability }: { loading: boolean; sustainability: ReportSustainability | null }) {
  if (loading) return <KpiSkeleton />;
  if (!sustainability) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <KpiTile value={formatKwh(sustainability.totalKwh)} label="Total Energy" />
        <KpiTile
          value={formatCo2(sustainability.estimatedCo2SavingsKg)}
          label="CO₂ Savings Estimated"
          subLabel={`Factor: ${sustainability.emissionFactorUsed} kgCO₂/kWh`}
        />
      </div>
      <div className="bg-brand-800 rounded-card p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-1">Usage by Vehicle Category</h3>
        <p className="text-xs text-gray-500 mb-4">Groups with fewer than 3 users are aggregated for privacy.</p>
        <div className="space-y-3">
          {sustainability.usageByVehicleCategory.map((cat) => {
            const pct = sustainability.totalKwh > 0 ? (cat.totalKwh / sustainability.totalKwh) * 100 : 0;
            return (
              <div key={cat.vehicleMake}>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span className="font-medium">{cat.vehicleMake}</span>
                  <span>{formatKwh(cat.totalKwh)} · {cat.sessionCount} sessions</span>
                </div>
                <div className="w-full h-2 bg-brand-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Emission factor: {sustainability.emissionFactorUsed} kgCO₂/kWh
        </p>
      </div>
    </div>
  );
}

// ── AI Tab ────────────────────────────────────────────────────────────────────
function AiTab({ loading, insights }: { loading: boolean; insights: AiInsights | null }) {
  const [groundingOpen, setGroundingOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-brand-400 border-t-transparent" />
        <p className="text-sm text-gray-400">Generating insights…</p>
      </div>
    );
  }
  if (!insights) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <ConfidenceBadge confidence={insights.confidence} />
        {insights.simulatedDataLabel && (
          <SimulatedDataLabel label={insights.simulatedDataLabel} />
        )}
      </div>

      {/* NL Summary */}
      <div className="bg-brand-800 rounded-card p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">Summary</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{insights.nlSummary}</p>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="bg-brand-800 rounded-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Recommendations</h3>
          {insights.recommendations.map((r, i) => (
            <div key={i} className="p-3 bg-brand-700/40 rounded-lg space-y-1">
              <p className="text-sm text-white">{r.text}</p>
              <p className="text-xs text-gray-400">{r.thresholdReason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Demand forecast */}
      {insights.confidence !== 'Low' && insights.demandForecast.length > 0 && (
        <div className="bg-brand-800 rounded-card p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Demand Forecast</h3>
          <DemandForecastChart data={insights.demandForecast} />
        </div>
      )}

      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <div className="bg-brand-800 rounded-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Anomalies</h3>
          {insights.anomalies.map((a, i) => (
            <div key={i} className="text-sm text-amber-300 flex gap-2">
              <span>⚠</span>
              <div>
                <span className="font-medium">{a.anomalyType}:</span>{' '}
                {a.observedValue} (expected {a.expectedRange}) — {a.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grounding */}
      <div className="bg-brand-800 rounded-card p-5">
        <button
          onClick={() => setGroundingOpen((o) => !o)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
          aria-expanded={groundingOpen}
        >
          <span>{groundingOpen ? '▼' : '►'}</span>
          Show grounding data
        </button>
        {groundingOpen && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-300">
            <p>Sessions: <span className="font-mono text-white">{insights.grounding.sessionCount}</span></p>
            <p>kWh: <span className="font-mono text-white">{insights.grounding.totalKwh}</span></p>
            <p>Peak hour: <span className="font-mono text-white">{insights.grounding.peakHourBucket}:00</span></p>
            <p>No-show rate: <span className="font-mono text-white">{(insights.grounding.noShowRate * 100).toFixed(1)}%</span></p>
            <p>Avg duration: <span className="font-mono text-white">{insights.grounding.avgDurationMinutes.toFixed(1)} min</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chart helpers (CSS-only, no chart library needed) ────────────────────────

function PeakHourChart({ data }: { data: { hour: number; sessionCount: number }[] }) {
  const max = Math.max(...data.map((d) => d.sessionCount), 1);
  return (
    <div role="img" aria-label="Bar chart showing peak charging hours">
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-brand-400 transition-all duration-500"
              style={{ height: `${(d.sessionCount / max) * 80}px` }}
            />
            <span className="text-[10px] text-gray-500">{d.hour}h</span>
          </div>
        ))}
      </div>
      <div className="mt-1 text-xs text-gray-500 text-right">sessions per hour</div>
    </div>
  );
}

function ChargerRankingChart({ data }: { data: { displayName: string; sessionCount: number; totalKwh: number }[] }) {
  const max = Math.max(...data.map((d) => d.sessionCount), 1);
  return (
    <div className="space-y-3" role="img" aria-label="Horizontal bar chart showing charger ranking by session count">
      {data.map((d) => (
        <div key={d.displayName}>
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>{d.displayName}</span>
            <span className="text-gray-400">{d.sessionCount} sessions · {formatKwh(d.totalKwh)}</span>
          </div>
          <div className="w-full h-2 bg-brand-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${(d.sessionCount / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DemandForecastChart({ data }: { data: { hourBucket: number; demandScore: number }[] }) {
  const max = Math.max(...data.map((d) => d.demandScore), 1);
  return (
    <div className="space-y-2" role="img" aria-label="Demand forecast bar chart">
      {data.map((d) => (
        <div key={d.hourBucket} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-10">{d.hourBucket}:00</span>
          <div className="flex-1 h-4 bg-brand-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                d.demandScore >= 0.8 ? 'bg-red-500' : d.demandScore >= 0.5 ? 'bg-amber-500' : 'bg-green-500',
              )}
              style={{ width: `${(d.demandScore / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-12 text-right">{(d.demandScore * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BoltIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  MapPinIcon,
  PlusIcon,
  ClockIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import type { Booking, Charger, ChargerStatus } from '../types';
import { getChargers } from '../services/charger.service';
import { getBookings } from '../services/booking.service';
import { getReportSummary } from '../services/report.service';
import { StatCard } from '../components/ui/StatCard';
import { InsightCard } from '../components/ui/InsightCard';
import { SustainabilityCard } from '../components/ui/SustainabilityCard';
import { ActivityFeed } from '../components/ui/ActivityFeed';
import { SessionCard } from '../components/booking/SessionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { KpiSkeleton } from '../components/ui/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { releaseBooking } from '../services/booking.service';
import { formatTimeWindow, formatTime } from '../lib/formatters';
import { cn } from '../lib/classNames';

const STATUS_DOT: Record<ChargerStatus, string> = {
  Available:             'bg-emerald-400',
  Reserved:              'bg-brand-300',
  Charging:              'bg-violet-400',
  BlockedForMaintenance: 'bg-orange-400',
  Unavailable:           'bg-gray-400',
  Faulted:               'bg-red-400',
};

const STATUS_LABEL: Record<ChargerStatus, string> = {
  Available:             'Available',
  Reserved:              'Reserved',
  Charging:              'Charging',
  BlockedForMaintenance: 'Maintenance',
  Unavailable:           'Unavailable',
  Faulted:               'Faulted',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [co2Saved, setCo2Saved] = useState<number>(0);
  const [totalKwh, setTotalKwh] = useState<number>(0);
  const [emissionFactor, setEmissionFactor] = useState<number>(0.85);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getChargers().catch(() => ({ data: [] as Charger[] })),
      getBookings({ limit: 100 }).catch(() => ({ data: [] as Booking[], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } })),
      getReportSummary().catch(() => null),
    ]).then(([c, b, s]) => {
      if (cancelled) return;
      setChargers(c.data);
      setBookings(b.data);
      if (s) {
        setCo2Saved(s.data.estimatedCo2SavingsKg);
        setTotalKwh(s.data.totalKwh);
        setEmissionFactor(s.data.emissionFactorUsed);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Derived
  const availableCount = chargers.filter((c) => c.status === 'Available').length;
  const activeSessions = chargers.filter((c) => c.status === 'Charging');
  const todayIso = new Date().toISOString().split('T')[0];
  const todayEnergyKwh = useMemo(
    () =>
      bookings
        .filter((b) => b.chargingSession && b.startTime.startsWith(todayIso))
        .reduce((sum, b) => sum + (b.chargingSession?.energyKwh ?? 0), 0)
      + activeSessions.reduce((sum, c) => sum + (c.activeSession?.energyKwh ?? 0), 0),
    [bookings, activeSessions, todayIso],
  );

  const userBookings = bookings.filter((b) => !currentUser || b.userId === currentUser.id);
  const myActive = userBookings.find((b) => b.state === 'Active');
  const myUpcoming = userBookings
    .filter((b) => b.state === 'Confirmed' && new Date(b.startTime).getTime() >= Date.now() - 60_000)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  // Status summary for chargers panel
  const statusSummary: Record<ChargerStatus, number> = {
    Available: 0, Reserved: 0, Charging: 0, BlockedForMaintenance: 0, Unavailable: 0, Faulted: 0,
  };
  for (const c of chargers) statusSummary[c.status]++;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = currentUser?.displayName?.split(' ')[0] ?? 'there';

  const handleRelease = async (b: Booking) => {
    try {
      await releaseBooking(b.id, { reason: 'Released from dashboard' });
      showToast('success', 'Booking released. Charger is now available.');
      const res = await getBookings({ limit: 100 });
      setBookings(res.data);
    } catch {
      showToast('error', 'Could not release booking.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 rounded-card bg-brand-800/60 skeleton" />
        <KpiSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-64 rounded-card bg-brand-800/60 skeleton lg:col-span-2" />
          <div className="h-64 rounded-card bg-brand-800/60 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Welcome hero ─────────────────────────────── */}
      <section
        aria-labelledby="welcome-heading"
        className="relative overflow-hidden rounded-card p-5 sm:p-7 border border-brand-700/50 bg-gradient-to-br from-brand-700/30 via-brand-800 to-brand-800 shadow-lg"
      >
        <div
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full blur-3xl opacity-50 bg-gradient-to-br from-brand-400/40 via-brand-500/20 to-transparent"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-brand-300 font-bold">{greeting}</p>
            <h1 id="welcome-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 text-sm text-gray-300 max-w-xl">
              {availableCount > 0
                ? `${availableCount} charger${availableCount === 1 ? '' : 's'} available right now across NEX Tower & NEXTERACOM.`
                : `No chargers are free right now — try booking for later today.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="md" onClick={() => navigate('/bookings/new')}>
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              Book a slot
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/chargers')}>
              View chargers
            </Button>
          </div>
        </div>
      </section>

      {/* ── KPI grid ─────────────────────────────────── */}
      <section aria-label="Today at a glance" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          accent="green"
          icon={<BoltIcon className="h-5 w-5" />}
          label="Available chargers"
          value={availableCount}
          hint={`${chargers.length} total bays`}
          trend={{ direction: 'flat', label: 'Live from CSMS' }}
        />
        <StatCard
          accent="violet"
          icon={<BoltIcon className="h-5 w-5" />}
          label="Active sessions"
          value={activeSessions.length}
          hint={activeSessions.length > 0 ? 'Charging now' : 'No vehicles charging'}
        />
        <StatCard
          accent="blue"
          icon={<CalendarDaysIcon className="h-5 w-5" />}
          label="Energy today"
          value={`${todayEnergyKwh.toFixed(1)} kWh`}
          hint="Delivered across sites"
          trend={{ direction: 'up', label: '+12% vs yesterday' }}
        />
        <StatCard
          accent="green"
          icon={<GlobeAltIcon className="h-5 w-5" />}
          label="CO₂ avoided"
          value={`${co2Saved.toFixed(0)} kg`}
          hint={`Factor ${emissionFactor} kg/kWh`}
          trend={{ direction: 'up', label: 'Tracking ESG goal' }}
        />
      </section>

      {/* ── Main 2-column grid ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left col (spans 2) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Active session takes priority */}
          {myActive ? (
            <SessionCard booking={myActive} remainingMinutes={12} onRelease={handleRelease} />
          ) : myUpcoming ? (
            <UpcomingBookingCard booking={myUpcoming} />
          ) : (
            <NoUpcomingCard onBook={() => navigate('/bookings/new')} />
          )}

          {/* Charger availability summary */}
          <section className="bg-brand-800 rounded-card p-5 sm:p-6 border border-brand-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Charger availability</h2>
                <p className="text-xs text-gray-400 mt-0.5">Across all locations</p>
              </div>
              <Link to="/chargers" className="text-xs font-semibold text-brand-300 hover:text-brand-200 inline-flex items-center gap-1">
                See all <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(statusSummary) as ChargerStatus[]).map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between gap-2 rounded-lg bg-brand-700/30 border border-brand-700/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[s])} aria-hidden="true" />
                    <span className="text-xs text-gray-300 truncate">{STATUS_LABEL[s]}</span>
                  </div>
                  <span className="text-sm font-bold text-white tabular-nums">{statusSummary[s]}</span>
                </div>
              ))}
            </div>

            {/* Quick preview of 3 chargers */}
            <ul className="mt-5 space-y-2">
              {chargers.slice(0, 3).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-700/40 bg-brand-700/20 px-3 py-2.5 hover:bg-brand-700/40 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[c.status])} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {c.location.name}
                        {c.connectorType && ` · ${c.connectorType}`}
                        {c.powerRatingKw && ` · ${c.powerRatingKw} kW`}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} type="charger" className="!min-h-0 !py-0.5 !text-[10px]" />
                </li>
              ))}
            </ul>
          </section>

          {/* Recent activity */}
          <section className="bg-brand-800 rounded-card p-5 sm:p-6 border border-brand-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent activity</h2>
              <Link to="/my-bookings" className="text-xs font-semibold text-brand-300 hover:text-brand-200 inline-flex items-center gap-1">
                History <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <ActivityFeed bookings={bookings} limit={5} />
          </section>
        </div>

        {/* Right col */}
        <aside className="space-y-4 sm:space-y-6">
          <InsightCard
            title="Smart booking window"
            summary="Demand peaks at 09:00 (92% utilisation). Booking between 11:00 and 13:00 will give you the fastest available bay today."
            bullets={[
              'Best booking window: 11:00–13:00',
              'NEXTERACOM CH-02 currently under-used at 31%',
              'Anomaly: 28.4 kWh session detected on CH-NXT-001',
            ]}
            confidence="High"
            ctaLabel="Open AI insights"
            ctaHref="/reports"
          />

          <SustainabilityCard
            co2SavedKg={co2Saved}
            energyKwh={totalKwh}
            emissionFactor={emissionFactor}
            monthlyGoalProgress={0.62}
            ctaHref="/reports"
          />

          {/* Reminders */}
          <section className="bg-brand-800 rounded-card p-5 border border-brand-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-300 flex items-center justify-center">
                <BellAlertIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Reminders</p>
                <h3 className="text-sm font-semibold text-white">Smart releases</h3>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex gap-2"><span className="text-amber-300">●</span> Session ending in 12 minutes — please move your vehicle promptly.</li>
              <li className="flex gap-2"><span className="text-brand-300">●</span> Teams adaptive card sent to your channel for tomorrow’s 09:00 booking.</li>
              <li className="flex gap-2"><span className="text-emerald-300">●</span> Auto-release will free unused slots after a 10-minute grace period.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** Upcoming booking card (shown when user has no active session). */
function UpcomingBookingCard({ booking }: { booking: Booking }) {
  return (
    <section
      aria-labelledby="upcoming-heading"
      className="relative overflow-hidden rounded-card p-5 sm:p-6 border border-brand-500/30 ring-1 ring-brand-500/20 bg-gradient-to-br from-brand-500/15 via-brand-800 to-brand-800 shadow-lg"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl opacity-50 bg-gradient-to-br from-brand-400/40 to-transparent" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-brand-500/20 text-brand-200 text-xs font-bold uppercase tracking-wider">
            <CalendarDaysIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Upcoming booking
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-brand-200 font-medium">
          <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Starts at {formatTime(booking.startTime)}
        </span>
      </div>
      <h3 id="upcoming-heading" className="relative mt-4 text-lg font-bold text-white">{booking.chargerDisplayName}</h3>
      <p className="relative mt-1 flex items-center gap-1 text-xs text-gray-400">
        <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {booking.locationCode === 'NEX-TOWER' ? 'NEX Tower' : 'NEXTERACOM'} · {booking.vehicleMake} {booking.vehicleModel}
      </p>
      <p className="relative mt-3 text-sm text-gray-300">
        {formatTimeWindow(booking.startTime, booking.endTime)} · 60 min slot
      </p>
      <div className="relative mt-5 flex flex-wrap gap-2">
        <Link to={`/bookings/${booking.id}`}><Button variant="primary" size="sm">View booking</Button></Link>
        <Link to="/my-bookings"><Button variant="secondary" size="sm">My bookings</Button></Link>
      </div>
    </section>
  );
}

function NoUpcomingCard({ onBook }: { onBook: () => void }) {
  return (
    <section className="rounded-card p-6 sm:p-8 border border-dashed border-brand-700/60 bg-brand-800/40 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-brand-500/15 text-brand-300 flex items-center justify-center mb-3">
        <CalendarDaysIcon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-white">No upcoming sessions</h3>
      <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
        Book a charging slot in seconds. We’ll send you a reminder and a Teams adaptive card so you never miss it.
      </p>
      <div className="mt-4">
        <Button variant="primary" size="md" onClick={onBook}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Book a charger
        </Button>
      </div>
    </section>
  );
}

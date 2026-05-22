/**
 * Date, energy, and duration formatters.
 * All API timestamps are UTC ISO 8601 — display in UTC+4 (Mauritius).
 */

const MU_LOCALE = 'en-MU';
const MU_TZ = 'Indian/Mauritius';

/** Format a UTC ISO string to a time string in Mauritius time (HH:mm). */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(MU_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MU_TZ,
    hour12: false,
  });
}

/** Format a UTC ISO string to "DD MMM YYYY" in Mauritius time. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(MU_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: MU_TZ,
  });
}

/** Format a UTC ISO string to "DD MMM HH:mm" for compact display. */
export function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString(MU_LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MU_TZ,
    hour12: false,
  });
}

/**
 * Relative time label: "08:01 today", "Yesterday 14:22", full date for older.
 */
export function formatRelativeTimestamp(iso: string): string {
  const now = new Date();
  const d = new Date(iso);

  const todayStr = now.toLocaleDateString(MU_LOCALE, { timeZone: MU_TZ });
  const dStr = d.toLocaleDateString(MU_LOCALE, { timeZone: MU_TZ });

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString(MU_LOCALE, { timeZone: MU_TZ });

  if (dStr === todayStr) {
    return `${formatTime(iso)} today`;
  }
  if (dStr === yesterdayStr) {
    return `Yesterday ${formatTime(iso)}`;
  }
  return formatDatetime(iso);
}

/** Format a booking time window, e.g. "09:00 – 10:00". */
export function formatTimeWindow(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
}

/** Format kWh to 1 decimal, e.g. "4.2 kWh". */
export function formatKwh(value: number): string {
  return `${value.toFixed(1)} kWh`;
}

/** Format kg CO₂ to 1 decimal, e.g. "350.7 kg CO₂". */
export function formatCo2(value: number): string {
  return `${value.toFixed(1)} kg CO₂`;
}

/** Format duration in minutes to "X min" or "X h Y min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Format a percentage, e.g. "62.4%". */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

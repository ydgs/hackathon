// MOCK: replace with GET /api/v1/reports/* when backend is ready

import type {
  ReportSummary,
  ReportSessions,
  ReportEnergy,
  ReportUtilization,
  ReportSustainability,
  AiInsights,
} from '../types';

// Hero numbers per design spec "Seeded Data Quality" section
export const MOCK_REPORT_SUMMARY: ReportSummary = {
  totalSessions: 57,
  totalKwh: 412.6,
  estimatedCo2SavingsKg: 350.71,
  emissionFactorUsed: 0.85,
};

export const MOCK_REPORT_SESSIONS: ReportSessions = {
  totalSessions: 57,
  completedCount: 49,
  cancelledCount: 4,
  releasedCount: 2,
  noShowCount: 2,
  avgDurationMinutes: 48.2,
  avgKwh: 7.23,
};

export const MOCK_REPORT_ENERGY: ReportEnergy = {
  totalKwh: 412.6,
  avgKwhPerSession: 7.23,
  peakHourDistribution: [
    { hour: 7,  sessionCount: 4 },
    { hour: 8,  sessionCount: 12 },
    { hour: 9,  sessionCount: 18 },
    { hour: 10, sessionCount: 10 },
    { hour: 11, sessionCount: 6 },
    { hour: 12, sessionCount: 3 },
    { hour: 13, sessionCount: 2 },
    { hour: 14, sessionCount: 2 },
  ],
  chargerRanking: [
    { chargerId: 'chr-nex-001', displayName: 'NEX Tower CH-01',     sessionCount: 21, totalKwh: 162.4 },
    { chargerId: 'chr-nex-002', displayName: 'NEX Tower CH-02',     sessionCount: 13, totalKwh:  82.7 },
    { chargerId: 'chr-nxt-001', displayName: 'NEXTERACOM CH-01',    sessionCount: 16, totalKwh: 120.3 },
    { chargerId: 'chr-nxt-002', displayName: 'NEXTERACOM CH-02',    sessionCount:  7, totalKwh:  47.2 },
  ],
};

export const MOCK_REPORT_UTILIZATION: ReportUtilization = {
  chargers: [
    { chargerId: 'chr-nex-001', displayName: 'NEX Tower CH-01',  utilizationPercent: 62.4, blockedForMaintenanceMinutes: 0,  faultedEventCount: 0 },
    { chargerId: 'chr-nex-002', displayName: 'NEX Tower CH-02',  utilizationPercent: 54.1, blockedForMaintenanceMinutes: 30, faultedEventCount: 1 },
    { chargerId: 'chr-nxt-001', displayName: 'NEXTERACOM CH-01', utilizationPercent: 48.6, blockedForMaintenanceMinutes: 0,  faultedEventCount: 0 },
    { chargerId: 'chr-nxt-002', displayName: 'NEXTERACOM CH-02', utilizationPercent: 31.2, blockedForMaintenanceMinutes: 60, faultedEventCount: 2 },
  ],
  locationComparison: {
    'NEX-TOWER':  { totalSessions: 34, totalKwh: 245.1, avgUtilizationPercent: 58.2 },
    'NEXTERACOM': { totalSessions: 23, totalKwh: 167.5, avgUtilizationPercent: 39.9 },
  },
};

export const MOCK_REPORT_SUSTAINABILITY: ReportSustainability = {
  totalKwh: 412.6,
  estimatedCo2SavingsKg: 350.71,
  emissionFactorUsed: 0.85,
  usageByVehicleCategory: [
    { vehicleMake: 'Tesla',   userCount: 4, sessionCount: 18, totalKwh: 142.6 },
    { vehicleMake: 'Renault', userCount: 3, sessionCount: 14, totalKwh:  98.4 },
    { vehicleMake: 'Other',   userCount: 8, sessionCount: 25, totalKwh: 171.6 },
  ],
};

export const MOCK_AI_INSIGHTS: AiInsights = {
  nlSummary:
    'In the last 7 days, 57 charging sessions delivered 412.6 kWh across NEX Tower and NEXTERACOM. Peak demand occurs at 09:00 with 18 sessions. The no-show rate is 3.5%. Estimated CO₂ savings stand at 350.7 kg based on the 0.85 kgCO₂/kWh emission factor. NEXTERACOM Charger 2 is the lowest-utilised asset at 31.2%.',
  demandForecast: [
    { hourBucket: 8,  demandScore: 0.71 },
    { hourBucket: 9,  demandScore: 0.92 },
    { hourBucket: 10, demandScore: 0.63 },
    { hourBucket: 11, demandScore: 0.41 },
    { hourBucket: 12, demandScore: 0.22 },
    { hourBucket: 14, demandScore: 0.38 },
  ],
  patterns: [
    {
      patternType: 'UnderusedCharger',
      entityId: 'chr-nxt-002',
      supportingCount: 7,
      severity: 'Low',
    },
    {
      patternType: 'PeakConcentration',
      entityId: 'chr-nex-001',
      supportingCount: 21,
      severity: 'Medium',
    },
  ],
  anomalies: [
    {
      entityId: 'sess-002',
      anomalyType: 'EnergySpike',
      observedValue: 28.4,
      expectedRange: '5–15 kWh',
      reason: '3× session average — possible long overnight session',
    },
  ],
  recommendations: [
    {
      text: 'Encourage off-peak booking between 11:00–13:00 to reduce 09:00 congestion. Maintain the 1-hour-per-user-per-day cap to preserve fairness.',
      metric: 'PeakHourSessions',
      thresholdReason: 'Peak 09:00 utilization 92% across both sites',
    },
    {
      text: 'Review NEXTERACOM Charger 2 scheduling — low utilization may indicate access or awareness issues rather than low demand.',
      metric: 'ChargerUtilization',
      thresholdReason: 'NEXTERACOM CH-02 at 31.2% vs site average 39.9%',
    },
  ],
  grounding: {
    sessionCount: 57,
    totalKwh: 412.6,
    topChargerId: 'chr-nex-001',
    peakHourBucket: 9,
    noShowRate: 0.035,
    avgDurationMinutes: 48.2,
  },
  confidence: 'High',
  simulatedDataLabel: 'Based on simulated demo data',
};

export const MOCK_SIMULATED_LABEL = 'Based on simulated demo data';

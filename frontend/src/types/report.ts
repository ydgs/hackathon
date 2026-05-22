// Report types — field names match api-contract.md §9.8 exactly

export interface ReportSummary {
  totalSessions: number;
  totalKwh: number;
  estimatedCo2SavingsKg: number;
  emissionFactorUsed: number;
}

export interface ReportSessions {
  totalSessions: number;
  completedCount: number;
  cancelledCount: number;
  releasedCount: number;
  noShowCount: number;
  avgDurationMinutes: number;
  avgKwh: number;
}

export interface PeakHourEntry {
  hour: number;
  sessionCount: number;
}

export interface ChargerRankingEntry {
  chargerId: string;
  displayName: string;
  sessionCount: number;
  totalKwh: number;
}

export interface ReportEnergy {
  totalKwh: number;
  avgKwhPerSession: number;
  peakHourDistribution: PeakHourEntry[];
  chargerRanking: ChargerRankingEntry[];
}

export interface ChargerUtilization {
  chargerId: string;
  displayName: string;
  utilizationPercent: number;
  blockedForMaintenanceMinutes: number;
  faultedEventCount: number;
}

export interface LocationStats {
  totalSessions: number;
  totalKwh: number;
  avgUtilizationPercent: number;
}

export interface ReportUtilization {
  chargers: ChargerUtilization[];
  locationComparison: Record<string, LocationStats>;
}

export interface VehicleCategoryUsage {
  vehicleMake: string;
  userCount: number;
  sessionCount: number;
  totalKwh: number;
}

export interface ReportSustainability {
  totalKwh: number;
  estimatedCo2SavingsKg: number;
  emissionFactorUsed: number;
  usageByVehicleCategory: VehicleCategoryUsage[];
}

export interface ReportEnvelope<T> {
  data: T;
  simulatedDataLabel: string | null;
  appliedFilters: {
    dateFrom: string | null;
    dateTo: string | null;
    locationCode: string | null;
    chargerId: string | null;
  };
}

// AI Insights — matches api-contract.md §9.9
export type AiConfidence = 'Low' | 'Medium' | 'High';

export interface DemandForecastEntry {
  hourBucket: number;
  demandScore: number;
}

export interface AiPattern {
  patternType: string;
  entityId: string;
  supportingCount: number;
  severity: string;
}

export interface AiAnomaly {
  entityId: string;
  anomalyType: string;
  observedValue: number;
  expectedRange: string;
  reason: string;
}

export interface AiRecommendation {
  text: string;
  metric: string;
  thresholdReason: string;
}

export interface AiGrounding {
  sessionCount: number;
  totalKwh: number;
  topChargerId: string;
  peakHourBucket: number;
  noShowRate: number;
  avgDurationMinutes: number;
}

export interface AiInsights {
  nlSummary: string;
  demandForecast: DemandForecastEntry[];
  patterns: AiPattern[];
  anomalies: AiAnomaly[];
  recommendations: AiRecommendation[];
  grounding: AiGrounding;
  confidence: AiConfidence;
  simulatedDataLabel: string | null;
}

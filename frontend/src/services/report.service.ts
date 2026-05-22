// MOCK: replace USE_MOCKS=false when backend /reports is ready
import type {
  ReportEnvelope,
  ReportSummary,
  ReportSessions,
  ReportEnergy,
  ReportUtilization,
  ReportSustainability,
  AiInsights,
} from '../types';
import {
  MOCK_REPORT_SUMMARY,
  MOCK_REPORT_SESSIONS,
  MOCK_REPORT_ENERGY,
  MOCK_REPORT_UTILIZATION,
  MOCK_REPORT_SUSTAINABILITY,
  MOCK_AI_INSIGHTS,
  MOCK_SIMULATED_LABEL,
} from '../mocks/reports.mock';

const USE_MOCKS = true;

async function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

type ReportParams = { dateFrom?: string; dateTo?: string; locationCode?: string; chargerId?: string };

function buildEnvelope<T>(data: T, params?: ReportParams): ReportEnvelope<T> {
  return {
    data,
    simulatedDataLabel: MOCK_SIMULATED_LABEL,
    appliedFilters: {
      dateFrom: params?.dateFrom ?? null,
      dateTo: params?.dateTo ?? null,
      locationCode: params?.locationCode ?? null,
      chargerId: params?.chargerId ?? null,
    },
  };
}

export async function getReportSummary(params?: ReportParams): Promise<ReportEnvelope<ReportSummary>> {
  await delay();
  if (USE_MOCKS) return buildEnvelope(MOCK_REPORT_SUMMARY, params);
  const { apiClient } = await import('./apiClient');
  return apiClient.get<ReportEnvelope<ReportSummary>>('/reports/summary');
}

export async function getReportSessions(params?: ReportParams): Promise<ReportEnvelope<ReportSessions>> {
  await delay();
  if (USE_MOCKS) return buildEnvelope(MOCK_REPORT_SESSIONS, params);
  const { apiClient } = await import('./apiClient');
  return apiClient.get<ReportEnvelope<ReportSessions>>('/reports/sessions');
}

export async function getReportEnergy(params?: ReportParams): Promise<ReportEnvelope<ReportEnergy>> {
  await delay();
  if (USE_MOCKS) return buildEnvelope(MOCK_REPORT_ENERGY, params);
  const { apiClient } = await import('./apiClient');
  return apiClient.get<ReportEnvelope<ReportEnergy>>('/reports/energy');
}

export async function getReportUtilization(params?: ReportParams): Promise<ReportEnvelope<ReportUtilization>> {
  await delay();
  if (USE_MOCKS) return buildEnvelope(MOCK_REPORT_UTILIZATION, params);
  const { apiClient } = await import('./apiClient');
  return apiClient.get<ReportEnvelope<ReportUtilization>>('/reports/utilization');
}

export async function getReportSustainability(params?: ReportParams): Promise<ReportEnvelope<ReportSustainability>> {
  await delay();
  if (USE_MOCKS) return buildEnvelope(MOCK_REPORT_SUSTAINABILITY, params);
  const { apiClient } = await import('./apiClient');
  return apiClient.get<ReportEnvelope<ReportSustainability>>('/reports/sustainability');
}

export async function getAiInsights(_params?: ReportParams): Promise<AiInsights> {
  await delay(600);
  if (USE_MOCKS) return MOCK_AI_INSIGHTS;
  const { apiClient } = await import('./apiClient');
  return apiClient.get<AiInsights>('/ai/insights');
}

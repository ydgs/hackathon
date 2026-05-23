import type {
  ReportEnvelope,
  ReportSummary,
  ReportSessions,
  ReportEnergy,
  ReportUtilization,
  ReportSustainability,
  AiInsights,
} from '../types';
import { apiClient } from './apiClient';

type ReportParams = { dateFrom?: string; dateTo?: string; locationCode?: string; chargerId?: string };

function buildQs(params?: ReportParams): string {
  const qs = new URLSearchParams();
  if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params?.dateTo) qs.set('dateTo', params.dateTo);
  if (params?.locationCode) qs.set('locationCode', params.locationCode);
  if (params?.chargerId) qs.set('chargerId', params.chargerId);
  return qs.toString() ? '?' + qs : '';
}

export async function getReportSummary(params?: ReportParams): Promise<ReportEnvelope<ReportSummary>> {
  return apiClient.get<ReportEnvelope<ReportSummary>>(`/reports/summary${buildQs(params)}`);
}

export async function getReportSessions(params?: ReportParams): Promise<ReportEnvelope<ReportSessions>> {
  return apiClient.get<ReportEnvelope<ReportSessions>>(`/reports/sessions${buildQs(params)}`);
}

export async function getReportEnergy(params?: ReportParams): Promise<ReportEnvelope<ReportEnergy>> {
  return apiClient.get<ReportEnvelope<ReportEnergy>>(`/reports/energy${buildQs(params)}`);
}

export async function getReportUtilization(params?: ReportParams): Promise<ReportEnvelope<ReportUtilization>> {
  return apiClient.get<ReportEnvelope<ReportUtilization>>(`/reports/utilization${buildQs(params)}`);
}

export async function getReportSustainability(params?: ReportParams): Promise<ReportEnvelope<ReportSustainability>> {
  return apiClient.get<ReportEnvelope<ReportSustainability>>(`/reports/sustainability${buildQs(params)}`);
}

export async function getAiInsights(params?: ReportParams): Promise<AiInsights> {
  return apiClient.get<AiInsights>(`/ai/insights${buildQs(params)}`);
}

import type { PaginatedResponse } from '../types';
import { apiClient } from './apiClient';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState: string | null;
  afterState: string | null;
  reason: string | null;
  source: string;
}

export interface GetAuditLogsParams {
  actorUserId?: string;
  action?: string;       // comma-separated allowed
  entityType?: string;   // comma-separated allowed
  entityId?: string;
  source?: string;       // User | Admin | System | Csms
  dateFrom?: string;     // ISO datetime
  dateTo?: string;       // ISO datetime
  page?: number;
  limit?: number;
}

export async function getAuditLogs(
  params?: GetAuditLogsParams,
): Promise<PaginatedResponse<AuditLogEntry>> {
  const qs = new URLSearchParams();
  if (params?.actorUserId) qs.set('actorUserId', params.actorUserId);
  if (params?.action) qs.set('action', params.action);
  if (params?.entityType) qs.set('entityType', params.entityType);
  if (params?.entityId) qs.set('entityId', params.entityId);
  if (params?.source) qs.set('source', params.source);
  if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params?.dateTo) qs.set('dateTo', params.dateTo);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<AuditLogEntry>>(
    `/audit-logs${qs.toString() ? '?' + qs : ''}`,
  );
}

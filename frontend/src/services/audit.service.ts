// MOCK: replace USE_MOCKS=false when backend GET /audit-logs is ready
import type { PaginatedResponse } from '../types';
import { MOCK_AUDIT_LOGS, type AuditLogEntry } from '../mocks/auditLogs.mock';

const USE_MOCKS = true;

async function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
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

function csvIncludes(csv: string | undefined, value: string): boolean {
  if (!csv) return true;
  return csv.split(',').map((s) => s.trim().toLowerCase()).includes(value.toLowerCase());
}

export async function getAuditLogs(
  params?: GetAuditLogsParams,
): Promise<PaginatedResponse<AuditLogEntry>> {
  await delay();

  if (USE_MOCKS) {
    let data = [...MOCK_AUDIT_LOGS];

    if (params?.actorUserId) {
      const q = params.actorUserId.toLowerCase();
      data = data.filter(
        (l) =>
          l.actorUserId.toLowerCase().includes(q) ||
          l.actorRole.toLowerCase().includes(q),
      );
    }
    if (params?.action) {
      data = data.filter((l) => csvIncludes(params.action, l.action));
    }
    if (params?.entityType) {
      data = data.filter((l) => csvIncludes(params.entityType, l.entityType));
    }
    if (params?.entityId) {
      data = data.filter((l) => l.entityId === params.entityId);
    }
    if (params?.source) {
      data = data.filter((l) => l.source.toLowerCase() === params.source!.toLowerCase());
    }
    if (params?.dateFrom) {
      const from = new Date(params.dateFrom).getTime();
      data = data.filter((l) => new Date(l.timestamp).getTime() >= from);
    }
    if (params?.dateTo) {
      const to = new Date(params.dateTo).getTime();
      data = data.filter((l) => new Date(l.timestamp).getTime() <= to);
    }

    // Default sort: timestamp desc (matches §6 default in api-contract.md)
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const limit = params?.limit ?? 20;
    const page = params?.page ?? 1;
    const total = data.length;
    const pageData = data.slice((page - 1) * limit, page * limit);
    return {
      data: pageData,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  const { apiClient } = await import('./apiClient');
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

export type { AuditLogEntry };

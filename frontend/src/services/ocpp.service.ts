import type {
  OcppStation,
  OcppSession,
  OcppSessionStatus,
  OcppAuthorizedTag,
  OcppAuthorizeTagBody,
} from '../types';

// Proxied via Vite: /ocpp/* → http://localhost:3000/*
// /ocpp/api/stations → http://localhost:3000/api/stations
const OCPP_BASE = '/ocpp/api';

async function ocppFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${OCPP_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as unknown as T;
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? `OCPP error ${res.status}`);
  return data as T;
}

const ocppGet  = <T>(path: string)              => ocppFetch<T>('GET',    path);
const ocppPost = <T>(path: string, body: unknown) => ocppFetch<T>('POST',   path, body);
const ocppPut  = <T>(path: string, body?: unknown) => ocppFetch<T>('PUT',    path, body);
const ocppDel  = <T>(path: string)              => ocppFetch<T>('DELETE', path);

// ── Stations ──────────────────────────────────────────────────────────────
export function getOcppStations(location?: string): Promise<OcppStation[]> {
  const qs = location ? `?location=${encodeURIComponent(location)}` : '';
  return ocppGet<OcppStation[]>(`/stations${qs}`);
}

export function getOcppStation(identity: string): Promise<OcppStation> {
  return ocppGet<OcppStation>(`/stations/${encodeURIComponent(identity)}`);
}

export function blockConnector(identity: string, connectorId: number, reason: string): Promise<void> {
  return ocppPut<void>(`/stations/${encodeURIComponent(identity)}/connectors/${connectorId}/block`, { reason });
}

export function unblockConnector(identity: string, connectorId: number): Promise<void> {
  return ocppDel<void>(`/stations/${encodeURIComponent(identity)}/connectors/${connectorId}/block`);
}

export function remoteStart(identity: string, body: { idTag: string; connectorId?: number }): Promise<void> {
  return ocppPost<void>(`/stations/${encodeURIComponent(identity)}/remote-start`, body);
}

export function remoteStop(identity: string, body: { transactionId: number }): Promise<void> {
  return ocppPost<void>(`/stations/${encodeURIComponent(identity)}/remote-stop`, body);
}

// ── Sessions ──────────────────────────────────────────────────────────────
export interface OcppSessionFilters {
  station?: string;
  idTag?: string;
  status?: OcppSessionStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

function buildSessionQs(f?: OcppSessionFilters): string {
  if (!f) return '';
  const qs = new URLSearchParams();
  if (f.station) qs.set('station', f.station);
  if (f.idTag)   qs.set('idTag',   f.idTag);
  if (f.status)  qs.set('status',  f.status);
  if (f.from)    qs.set('from',    f.from);
  if (f.to)      qs.set('to',      f.to);
  if (f.limit != null)  qs.set('limit',  String(f.limit));
  if (f.offset != null) qs.set('offset', String(f.offset));
  return qs.toString() ? '?' + qs : '';
}

export function getOcppSessions(filters?: OcppSessionFilters): Promise<OcppSession[]> {
  return ocppGet<OcppSession[]>(`/sessions${buildSessionQs(filters)}`);
}

export function getOcppActiveSessions(): Promise<OcppSession[]> {
  return ocppGet<OcppSession[]>('/sessions/active');
}

export function getOcppSession(id: number): Promise<OcppSession> {
  return ocppGet<OcppSession>(`/sessions/${id}`);
}

// ── Auth tags ─────────────────────────────────────────────────────────────
export function authorizeTag(body: OcppAuthorizeTagBody): Promise<OcppAuthorizedTag> {
  return ocppPost<OcppAuthorizedTag>('/auth/tags', body);
}

export function revokeTag(idTag: string): Promise<void> {
  return ocppDel<void>(`/auth/tags/${encodeURIComponent(idTag)}`);
}

export function getOcppTags(activeOnly?: boolean): Promise<OcppAuthorizedTag[]> {
  const qs = activeOnly ? '?active=true' : '';
  return ocppGet<OcppAuthorizedTag[]>(`/auth/tags${qs}`);
}

import type { SessionState } from '../types';
import type { PaginatedResponse } from '../types';
import { apiClient } from './apiClient';

export interface Session {
  id: string;
  bookingId: string;
  chargerId: string;
  chargerDisplayName: string;
  userId: string;
  userDisplayName: string;
  state: SessionState;
  startTime: string;
  stopTime: string | null;
  energyKwh: number;
  source: string;
}

export async function getSessions(params?: {
  chargerId?: string;
  userId?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Session>> {
  const qs = new URLSearchParams();
  if (params?.chargerId) qs.set('chargerId', params.chargerId);
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.state) qs.set('state', params.state);
  if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params?.dateTo) qs.set('dateTo', params.dateTo);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<Session>>(`/sessions${qs.toString() ? '?' + qs : ''}`);
}

export async function getSession(id: string): Promise<Session> {
  return apiClient.get<Session>(`/sessions/${id}`);
}

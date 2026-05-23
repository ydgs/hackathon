import type { Charger, ListResponse } from '../types';
import { apiClient } from './apiClient';

export async function getChargers(params?: {
  locationCode?: string;
  status?: string;
}): Promise<ListResponse<Charger>> {
  const qs = new URLSearchParams();
  if (params?.locationCode) qs.set('locationCode', params.locationCode);
  if (params?.status) qs.set('status', params.status);
  return apiClient.get<ListResponse<Charger>>(`/chargers${qs.toString() ? '?' + qs : ''}`);
}

export async function getCharger(id: string): Promise<Charger> {
  return apiClient.get<Charger>(`/chargers/${id}`);
}

export async function updateChargerStatus(
  id: string,
  status: string,
  reason: string,
): Promise<Charger> {
  return apiClient.put<Charger>(`/chargers/${id}/status`, { status, reason });
}

// MOCK: replace USE_MOCKS=false when backend /chargers is ready
import type { Charger, ListResponse } from '../types';
import { MOCK_CHARGERS } from '../mocks/chargers.mock';

const USE_MOCKS = true;

async function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getChargers(params?: {
  locationCode?: string;
  status?: string;
}): Promise<ListResponse<Charger>> {
  await delay(300);
  if (USE_MOCKS) {
    let data = [...MOCK_CHARGERS];
    if (params?.locationCode) {
      data = data.filter((c) => c.location.code === params.locationCode);
    }
    if (params?.status) {
      const statuses = params.status.split(',');
      data = data.filter((c) => statuses.includes(c.status));
    }
    return { data };
  }
  const { apiClient } = await import('./apiClient');
  const qs = new URLSearchParams();
  if (params?.locationCode) qs.set('locationCode', params.locationCode);
  if (params?.status) qs.set('status', params.status);
  return apiClient.get<ListResponse<Charger>>(`/chargers${qs.toString() ? '?' + qs : ''}`);
}

export async function getCharger(id: string): Promise<Charger> {
  await delay(200);
  if (USE_MOCKS) {
    const found = MOCK_CHARGERS.find((c) => c.id === id);
    if (!found) throw new Error('Charger not found');
    return found;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.get<Charger>(`/chargers/${id}`);
}

export async function updateChargerStatus(
  id: string,
  status: string,
  reason: string,
): Promise<Charger> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_CHARGERS.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Charger not found');
    MOCK_CHARGERS[idx] = { ...MOCK_CHARGERS[idx], status: status as Charger['status'] };
    return MOCK_CHARGERS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.put<Charger>(`/chargers/${id}/status`, { status, reason });
}

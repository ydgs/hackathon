import { apiClient } from './apiClient';

export interface MaintenanceBlockPayload {
  chargerId: string;
  startTime: string;
  endTime?: string;
  reason: string;
  forceReleaseExistingBookings: boolean;
}

export interface MaintenanceBlockResponse {
  id: string;
  chargerId: string;
  startTime: string;
  endTime: string | null;
  reason: string;
  isActive: boolean;
}

export async function createMaintenanceBlock(payload: MaintenanceBlockPayload): Promise<MaintenanceBlockResponse> {
  return apiClient.post<MaintenanceBlockResponse>('/maintenance-blocks', payload);
}

export async function deleteMaintenanceBlock(id: string): Promise<void> {
  return apiClient.delete<void>(`/maintenance-blocks/${id}`);
}

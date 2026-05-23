import { apiClient } from './apiClient';

export interface ConfigEntry {
  key: string;
  value: string;
  description?: string;
}

export interface GetConfigResponse {
  data: ConfigEntry[];
}

export async function getConfig(): Promise<GetConfigResponse> {
  return apiClient.get<GetConfigResponse>('/config');
}

export async function updateConfig(entries: ConfigEntry[]): Promise<GetConfigResponse> {
  return apiClient.put<GetConfigResponse>('/config', { entries });
}

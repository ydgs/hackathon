import type {
  EligibleUser,
  CreateEligibleUserRequest,
  UpdateEligibleUserRequest,
  PaginatedResponse,
} from '../types';
import { apiClient } from './apiClient';

export async function getEligibleUsers(params?: {
  search?: string;
  eligibilityStatus?: string;
  siteContext?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<EligibleUser>> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.eligibilityStatus) qs.set('eligibilityStatus', params.eligibilityStatus);
  if (params?.siteContext) qs.set('siteContext', params.siteContext);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<EligibleUser>>(`/eligible-users${qs.toString() ? '?' + qs : ''}`);
}

export async function getEligibleUser(id: string): Promise<EligibleUser> {
  return apiClient.get<EligibleUser>(`/eligible-users/${id}`);
}

export async function createEligibleUser(req: CreateEligibleUserRequest): Promise<EligibleUser> {
  return apiClient.post<EligibleUser>('/eligible-users', req);
}

export async function updateEligibleUser(id: string, req: UpdateEligibleUserRequest): Promise<EligibleUser> {
  return apiClient.put<EligibleUser>(`/eligible-users/${id}`, req);
}

export async function deleteEligibleUser(id: string): Promise<void> {
  return apiClient.delete(`/eligible-users/${id}`);
}

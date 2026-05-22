// MOCK: replace USE_MOCKS=false when backend /eligible-users is ready
import type {
  EligibleUser,
  CreateEligibleUserRequest,
  UpdateEligibleUserRequest,
  PaginatedResponse,
} from '../types';
import { MOCK_ELIGIBLE_USERS } from '../mocks/users.mock';

const USE_MOCKS = true;

async function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getEligibleUsers(params?: {
  search?: string;
  eligibilityStatus?: string;
  siteContext?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<EligibleUser>> {
  await delay();
  if (USE_MOCKS) {
    let data = [...MOCK_ELIGIBLE_USERS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.workplaceRegistryEid.toLowerCase().includes(q),
      );
    }
    if (params?.eligibilityStatus) {
      const statuses = params.eligibilityStatus.split(',');
      data = data.filter((u) => statuses.includes(u.eligibilityStatus));
    }
    if (params?.siteContext) {
      data = data.filter((u) => u.siteContext === params.siteContext);
    }
    return { data, pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 } };
  }
  const { apiClient } = await import('./apiClient');
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.eligibilityStatus) qs.set('eligibilityStatus', params.eligibilityStatus);
  if (params?.siteContext) qs.set('siteContext', params.siteContext);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<EligibleUser>>(`/eligible-users${qs.toString() ? '?' + qs : ''}`);
}

export async function getEligibleUser(id: string): Promise<EligibleUser> {
  await delay(200);
  if (USE_MOCKS) {
    const found = MOCK_ELIGIBLE_USERS.find((u) => u.id === id);
    if (!found) throw new Error('User not found');
    return found;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.get<EligibleUser>(`/eligible-users/${id}`);
}

export async function createEligibleUser(req: CreateEligibleUserRequest): Promise<EligibleUser> {
  await delay(500);
  if (USE_MOCKS) {
    const newUser: EligibleUser = {
      id: `eu-mock-${Date.now()}`,
      userId: `usr-mock-${Date.now()}`,
      displayName: req.displayName,
      email: req.email,
      workplaceRegistryEid: req.workplaceRegistryEid,
      badgeId: req.badgeId,
      eligibilityStatus: req.eligibilityStatus,
      vehicleMake: req.vehicleMake ?? '',
      vehicleModel: req.vehicleModel ?? '',
      siteContext: req.siteContext,
      privacyAcknowledgementStatus: 'NotAcknowledged',
      lastUpdatedAt: new Date().toISOString(),
    };
    MOCK_ELIGIBLE_USERS.push(newUser);
    return newUser;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.post<EligibleUser>('/eligible-users', req);
}

export async function updateEligibleUser(id: string, req: UpdateEligibleUserRequest): Promise<EligibleUser> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_ELIGIBLE_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    MOCK_ELIGIBLE_USERS[idx] = { ...MOCK_ELIGIBLE_USERS[idx], ...req, lastUpdatedAt: new Date().toISOString() };
    return MOCK_ELIGIBLE_USERS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.put<EligibleUser>(`/eligible-users/${id}`, req);
}

export async function deleteEligibleUser(id: string): Promise<void> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_ELIGIBLE_USERS.findIndex((u) => u.id === id);
    if (idx !== -1) MOCK_ELIGIBLE_USERS.splice(idx, 1);
    return;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.delete(`/eligible-users/${id}`);
}

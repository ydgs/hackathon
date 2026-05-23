import type { LoginRequest, LoginResponse, CurrentUser } from '../types';
import { apiClient } from './apiClient';

/**
 * login — calls POST /api/v1/auth/login.
 * Returns token + basic user summary (id, email, displayName, role).
 * Callers must call getMe() separately to get eligibility + privacy data.
 */
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', req);
  // Persist the JWT for subsequent requests
  localStorage.setItem('nexlevel_token', res.token);
  return res;
}

/**
 * logout — calls POST /api/v1/auth/logout (audit log) then clears local storage.
 * Non-fatal if the API call fails — we clear local state regardless.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Silently swallow — logout should always clear local state
  } finally {
    localStorage.removeItem('nexlevel_token');
    localStorage.removeItem('nexlevel_user');
  }
}

/**
 * getMe — calls GET /api/v1/auth/me.
 * Returns full CurrentUser including eligibility and privacy sub-objects.
 */
export async function getMe(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>('/auth/me');
}

// MOCK: replace USE_MOCKS=false when backend /auth/login and /auth/me are ready
import type { LoginRequest, LoginResponse, CurrentUser } from '../types';
import { mockUsers } from '../mocks/users.mock';
import { DEMO_ACCOUNTS } from '../hooks/useAuth';

const USE_MOCKS = true;

async function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  await delay(400);
  if (USE_MOCKS) {
    const account = DEMO_ACCOUNTS.find((a) => a.email === req.email);
    if (!account || req.password !== 'demo-password') {
      const err = new Error('Invalid email or password.') as Error & {
        apiError: { message: string; errors: { code: string; message: string }[]; traceId: string };
      };
      err.apiError = {
        message: 'Invalid email or password.',
        errors: [{ code: 'Unauthenticated', message: 'Invalid email or password.' }],
        traceId: 'mock-trace-001',
      };
      throw err;
    }
    // Store a fake token
    localStorage.setItem('nexlevel_token', 'mock-jwt-token');
    return {
      token: 'mock-jwt-token',
      expiresAt: '2026-05-24T08:00:00Z',
      user: {
        id: account.user.id,
        email: account.user.email,
        displayName: account.user.displayName,
        role: account.user.role,
      },
    };
  }
  // Real API call when backend is ready
  const { apiClient } = await import('./apiClient');
  return apiClient.post<LoginResponse>('/auth/login', req);
}

export async function logout(): Promise<void> {
  await delay(100);
  localStorage.removeItem('nexlevel_token');
  if (!USE_MOCKS) {
    const { apiClient } = await import('./apiClient');
    await apiClient.post('/auth/logout');
  }
}

export async function getMe(): Promise<CurrentUser> {
  await delay(200);
  if (USE_MOCKS) {
    // Return the stored user from localStorage (set by useAuth login)
    const raw = localStorage.getItem('nexlevel_user');
    if (!raw) throw new Error('Not authenticated');
    return JSON.parse(raw) as CurrentUser;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.get<CurrentUser>('/auth/me');
}

export { mockUsers };

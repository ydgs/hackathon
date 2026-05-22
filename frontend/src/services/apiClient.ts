/**
 * Fetch wrapper — base URL, JSON error envelope handling.
 * Matches api-contract.md §2 base URL and §7 error shape.
 */

import type { ApiError } from '../types';

const BASE_URL = 'http://localhost:5000/api/v1';

function getToken(): string | null {
  try {
    const user = localStorage.getItem('nexlevel_user');
    if (!user) return null;
    // In the real flow this would be the JWT from the login response.
    // For mock mode, we store the user object; real JWT goes in nexlevel_token.
    return localStorage.getItem('nexlevel_token');
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const data = await res.json();

  if (!res.ok) {
    // Throw ApiError shape for callers to handle
    const err = data as ApiError;
    const e = new Error(err.message ?? 'Request failed') as Error & { apiError: ApiError };
    e.apiError = err;
    throw e;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

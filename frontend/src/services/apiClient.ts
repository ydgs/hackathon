/**
 * Fetch wrapper — base URL, JSON error envelope handling.
 * Matches api-conventions.md error shape.
 *
 * In development, Vite proxies /api/* to https://localhost:7000/api/*
 * so we use a relative path here. This also works in production when
 * the frontend and backend are served from the same origin.
 */

import type { ApiError } from '../types';

// Use relative path so Vite proxy works in dev and same-origin works in prod.
// Falls back to absolute URL if VITE_API_BASE_URL is set (e.g. in CI or staging).
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

function getToken(): string | null {
  try {
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
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

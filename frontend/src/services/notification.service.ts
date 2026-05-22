// MOCK: replace USE_MOCKS=false when backend /notifications is ready
import type { Notification, NotificationAuditItem, UnreadCountResponse, PaginatedResponse } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_NOTIFICATION_AUDIT } from '../mocks/notifications.mock';

const USE_MOCKS = true;

async function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getNotifications(params?: {
  unreadOnly?: boolean;
  severity?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Notification>> {
  await delay(250);
  if (USE_MOCKS) {
    let data = [...MOCK_NOTIFICATIONS];
    if (params?.unreadOnly) {
      data = data.filter((n) => !n.readState);
    }
    if (params?.severity) {
      data = data.filter((n) => n.severity === params.severity);
    }
    return { data, pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 } };
  }
  const { apiClient } = await import('./apiClient');
  const qs = new URLSearchParams();
  if (params?.unreadOnly) qs.set('unreadOnly', 'true');
  if (params?.severity) qs.set('severity', params.severity);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<Notification>>(`/notifications${qs.toString() ? '?' + qs : ''}`);
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  await delay(100);
  if (USE_MOCKS) {
    const count = MOCK_NOTIFICATIONS.filter((n) => !n.readState).length;
    return { unreadCount: count };
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
}

export async function markNotificationRead(id: string): Promise<Notification> {
  await delay(200);
  if (USE_MOCKS) {
    const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
    if (idx !== -1) MOCK_NOTIFICATIONS[idx] = { ...MOCK_NOTIFICATIONS[idx], readState: true };
    return MOCK_NOTIFICATIONS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.put<Notification>(`/notifications/${id}/read`);
}

export async function getNotificationAudit(params?: {
  channel?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<NotificationAuditItem>> {
  await delay(300);
  if (USE_MOCKS) {
    return {
      data: MOCK_NOTIFICATION_AUDIT,
      pagination: { page: 1, limit: 20, total: MOCK_NOTIFICATION_AUDIT.length, totalPages: 1 },
    };
  }
  const { apiClient } = await import('./apiClient');
  const qs = new URLSearchParams();
  if (params?.channel) qs.set('channel', params.channel);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<NotificationAuditItem>>(`/notifications/audit${qs.toString() ? '?' + qs : ''}`);
}

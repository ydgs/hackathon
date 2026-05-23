import type { Notification, NotificationAuditItem, UnreadCountResponse, PaginatedResponse } from '../types';
import { apiClient } from './apiClient';

export async function getNotifications(params?: {
  unreadOnly?: boolean;
  severity?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Notification>> {
  const qs = new URLSearchParams();
  if (params?.unreadOnly) qs.set('unreadOnly', 'true');
  if (params?.severity) qs.set('severity', params.severity);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<Notification>>(`/notifications${qs.toString() ? '?' + qs : ''}`);
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return apiClient.put<Notification>(`/notifications/${id}/read`);
}

export async function getNotificationAudit(params?: {
  channel?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<NotificationAuditItem>> {
  const qs = new URLSearchParams();
  if (params?.channel) qs.set('channel', params.channel);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<NotificationAuditItem>>(`/notifications/audit${qs.toString() ? '?' + qs : ''}`);
}

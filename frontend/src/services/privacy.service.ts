import { apiClient } from './apiClient';

export interface PrivacyNotice {
  version: string;
  content: string;
  effectiveDate: string;
}

export interface PrivacyAcknowledgement {
  id: string;
  userId: string;
  version: string;
  acknowledgedAt: string;
}

export async function getPrivacyNotice(): Promise<PrivacyNotice> {
  return apiClient.get<PrivacyNotice>('/privacy-notice');
}

export async function acknowledgePrivacyNotice(version: string): Promise<PrivacyAcknowledgement> {
  return apiClient.post<PrivacyAcknowledgement>('/privacy-notice/acknowledge', { version });
}

import type {
  Booking,
  CreateBookingRequest,
  CancelBookingRequest,
  ReleaseBookingRequest,
  OverrideBookingRequest,
  OperatorReleaseRequest,
  PaginatedResponse,
} from '../types';
import { apiClient } from './apiClient';

export async function getBookings(params?: {
  state?: string;
  chargerId?: string;
  userId?: string;
  locationCode?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Booking>> {
  const qs = new URLSearchParams();
  if (params?.state) qs.set('state', params.state);
  if (params?.chargerId) qs.set('chargerId', params.chargerId);
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.locationCode) qs.set('locationCode', params.locationCode);
  if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params?.dateTo) qs.set('dateTo', params.dateTo);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<Booking>>(`/bookings${qs.toString() ? '?' + qs : ''}`);
}

export async function getBooking(id: string): Promise<Booking> {
  return apiClient.get<Booking>(`/bookings/${id}`);
}

export async function createBooking(req: CreateBookingRequest): Promise<Booking> {
  return apiClient.post<Booking>('/bookings', req);
}

export async function cancelBooking(id: string, req: CancelBookingRequest): Promise<Booking> {
  return apiClient.put<Booking>(`/bookings/${id}/cancel`, req);
}

export async function releaseBooking(id: string, req: ReleaseBookingRequest): Promise<Booking> {
  return apiClient.put<Booking>(`/bookings/${id}/release`, req);
}

export async function overrideBooking(id: string, req: OverrideBookingRequest): Promise<Booking> {
  return apiClient.put<Booking>(`/bookings/${id}/override`, req);
}

/**
 * operatorReleaseBooking — Operator (Security/Workplace/Admin) forcibly releases an active booking.
 * Maps to PUT /bookings/{id}/release with a required reason (same endpoint, different caller role).
 */
export async function operatorReleaseBooking(id: string, req: OperatorReleaseRequest): Promise<Booking> {
  return apiClient.put<Booking>(`/bookings/${id}/release`, { reason: req.reason });
}

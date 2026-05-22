// MOCK: replace USE_MOCKS=false when backend /bookings is ready
import type {
  Booking,
  CreateBookingRequest,
  CancelBookingRequest,
  ReleaseBookingRequest,
  OverrideBookingRequest,
  OperatorReleaseRequest,
  PaginatedResponse,
} from '../types';
import { MOCK_BOOKINGS } from '../mocks/bookings.mock';

const USE_MOCKS = true;

async function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

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
  await delay(300);
  if (USE_MOCKS) {
    let data = [...MOCK_BOOKINGS];
    if (params?.state) {
      const states = params.state.split(',');
      data = data.filter((b) => states.includes(b.state));
    }
    if (params?.locationCode) {
      data = data.filter((b) => b.locationCode === params.locationCode);
    }
    // Date range filtering — compare booking startTime against dateFrom/dateTo
    if (params?.dateFrom) {
      const fromMs = new Date(params.dateFrom).getTime();
      data = data.filter((b) => new Date(b.startTime).getTime() >= fromMs);
    }
    if (params?.dateTo) {
      const toMs = new Date(params.dateTo).getTime();
      data = data.filter((b) => new Date(b.startTime).getTime() <= toMs);
    }
    const total = data.length;
    return {
      data,
      pagination: { page: 1, limit: 100, total, totalPages: 1 },
    };
  }
  const { apiClient } = await import('./apiClient');
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
  await delay(200);
  if (USE_MOCKS) {
    const found = MOCK_BOOKINGS.find((b) => b.id === id);
    if (!found) throw new Error('Booking not found');
    return found;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.get<Booking>(`/bookings/${id}`);
}

export async function createBooking(req: CreateBookingRequest): Promise<Booking> {
  await delay(500);
  if (USE_MOCKS) {
    const newBooking: Booking = {
      id: `bk-mock-${Date.now()}`,
      userId: 'usr-alice-001',
      userDisplayName: 'Alice Standard',
      chargerId: req.chargerId,
      chargerDisplayName: 'NEX Tower Charger 1',
      locationCode: 'NEX-TOWER',
      startTime: req.startTime,
      endTime: req.endTime,
      state: 'Confirmed',
      vehicleMake: req.vehicleMake,
      vehicleModel: req.vehicleModel,
      csmsIdTag: 'EID-00123-MOCK',
      csmsSyncStatus: 'Authorized',
      reasonForOverride: req.reasonForOverride,
      actorUserId: req.onBehalfOfUserId ? 'usr-admin-003' : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_BOOKINGS.unshift(newBooking);
    return newBooking;
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.post<Booking>('/bookings', req);
}

export async function cancelBooking(id: string, req: CancelBookingRequest): Promise<Booking> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    MOCK_BOOKINGS[idx] = { ...MOCK_BOOKINGS[idx], state: 'Cancelled', csmsSyncStatus: 'Revoked' };
    return MOCK_BOOKINGS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.put<Booking>(`/bookings/${id}/cancel`, req);
}

export async function releaseBooking(id: string, req: ReleaseBookingRequest): Promise<Booking> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    MOCK_BOOKINGS[idx] = { ...MOCK_BOOKINGS[idx], state: 'Released', csmsSyncStatus: 'Revoked' };
    return MOCK_BOOKINGS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.put<Booking>(`/bookings/${id}/release`, req);
}

export async function overrideBooking(id: string, req: OverrideBookingRequest): Promise<Booking> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    MOCK_BOOKINGS[idx] = { ...MOCK_BOOKINGS[idx], state: 'Overridden', endTime: req.newEndTime, reasonForOverride: req.reason };
    return MOCK_BOOKINGS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.put<Booking>(`/bookings/${id}/override`, req);
}

export async function operatorReleaseBooking(id: string, req: OperatorReleaseRequest): Promise<Booking> {
  await delay(400);
  if (USE_MOCKS) {
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    MOCK_BOOKINGS[idx] = {
      ...MOCK_BOOKINGS[idx],
      state: 'Overridden',
      csmsSyncStatus: 'Revoked',
      reasonForOverride: req.reason,
    };
    return MOCK_BOOKINGS[idx];
  }
  const { apiClient } = await import('./apiClient');
  return apiClient.post<Booking>(`/bookings/${id}/operator-release`, req);
}

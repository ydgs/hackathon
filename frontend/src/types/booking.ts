// Booking types — field names match api-contract.md §9.5 exactly

export type BookingState =
  | 'Pending'
  | 'Confirmed'
  | 'Active'
  | 'Completed'
  | 'Cancelled'
  | 'Released'
  | 'NoShow'
  | 'Overridden';

export type CsmsSyncStatus =
  | 'AuthorizationPending'
  | 'Authorized'
  | 'AuthorizationFailed'
  | 'Revoked';

export type SessionState =
  | 'NotStarted'
  | 'Authenticating'
  | 'Charging'
  | 'Completed'
  | 'StoppedByUser'
  | 'StoppedByAdmin'
  | 'Faulted'
  | 'Expired';

export interface ChargingSession {
  id: string;
  state: SessionState;
  startTime: string;
  stopTime: string | null;
  energyKwh: number;
  source: string;
}

export interface Booking {
  id: string;
  userId: string;
  userDisplayName: string;
  chargerId: string;
  chargerDisplayName: string;
  locationCode: string;
  startTime: string;
  endTime: string;
  state: BookingState;
  vehicleMake: string;
  vehicleModel: string;
  csmsIdTag: string;
  csmsSyncStatus: CsmsSyncStatus;
  reasonForOverride: string | null;
  actorUserId: string | null;
  createdAt: string;
  updatedAt: string;
  chargingSession?: ChargingSession | null;
}

export interface CreateBookingRequest {
  chargerId: string;
  startTime: string;
  endTime: string;
  vehicleMake: string;
  vehicleModel: string;
  onBehalfOfUserId: string | null;
  reasonForOverride: string | null;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface ReleaseBookingRequest {
  reason?: string;
}

export interface OverrideBookingRequest {
  newEndTime: string;
  reason: string;
}

export interface OperatorReleaseRequest {
  reason: string;
}

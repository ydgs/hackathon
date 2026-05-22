// Notification types — field names match api-contract.md §9.7 exactly

export type NotificationSeverity = 'Info' | 'Warning' | 'Critical';
export type NotificationChannel = 'InApp' | 'Email' | 'Teams';
export type DeliveryStatus = 'Sent' | 'Previewed' | 'Failed';

export type TriggerEvent =
  | 'BookingConfirmation'
  | 'SessionStartingSoon'
  | 'GracePeriodWarning'
  | 'SessionEndingSoon'
  | 'SessionEnded'
  | 'MoveVehicle'
  | 'SlotRelease'
  | 'AutoRelease'
  | 'AdminIntervention';

export interface Notification {
  id: string;
  triggerEvent: TriggerEvent;
  channel: NotificationChannel;
  severity: NotificationSeverity;
  title: string;
  body: string;
  readState: boolean;
  linkedBookingId: string | null;
  linkedSessionId: string | null;
  linkedChargerId: string | null;
  timestamp: string;
}

export interface NotificationAuditItem {
  id: string;
  audienceUserId: string;
  audienceUserDisplayName: string;
  triggerEvent: TriggerEvent;
  channel: NotificationChannel;
  severity: NotificationSeverity;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  deliveryStatus: DeliveryStatus;
  readState: boolean;
  correlationId: string;
  linkedBookingId: string | null;
  linkedSessionId: string | null;
  linkedChargerId: string | null;
  timestamp: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

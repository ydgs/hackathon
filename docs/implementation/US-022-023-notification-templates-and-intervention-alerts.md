# US-022 / US-023 — Notification Templates and Intervention Alerts — Backend Implementation Notes

## Status
Implemented

## Summary

Extended the P1 background services and booking flow to complete US-022 (nine reminder templates) and implement US-023 (intervention alerts for Security/Workplace/Admin). Also fixed a pre-existing bug where the `CorrelationId` DB column was too narrow (varchar(36)) to hold composite correlation keys used by the reminder services.

## What Was Done

### US-021/US-022: BookingConfirmation notification (BookingService)
When a booking is confirmed, a `BookingConfirmation` in-app notification is now generated immediately, visible in the user's notification center.

### US-022: AutoReleaseNoShow notification (NoShowCheckerService)
When the no-show checker marks a booking as `NoShow`, an `AutoReleaseNoShow` in-app notification is sent to the booking user.

### US-022: Extended ReminderSchedulerService (4 new reminder types)
- `BookingGracePeriodWarning` — sent ~grace/3 minutes after booking start if no active session detected. Warns the user to proceed to the charger.
- `ChargingSessionEnded` — sent when a session transitions to `Completed` within the last 2 minutes. Informs the user the session is done.
- `MoveVehiclePrompt` — sent alongside `ChargingSessionEnded` to prompt the user to disconnect and move their vehicle.
- `SlotReleasePrompt` — sent when an Active booking is overdue (past `endTime + gracePeriod`). Critical severity. Prompts the user to disconnect.

### US-023: New InterventionAlertService (IHostedService)
A new background service running every 5 minutes that sends operational alerts to all Security/Workplace/Admin users:
- **Repeated no-shows**: when a user has >= `NO_SHOW_THRESHOLD_COUNT` no-show bookings in `NO_SHOW_THRESHOLD_DAYS` days (default 2 in 7 days). Daily deduplication per offending user.
- **Late release**: when an Active booking is still active past `endTime + gracePeriod`. Daily deduplication per booking.
- **Charger fault during active session**: when a `Faulted` charger has an active `Charging` or `Authenticating` session. Notifies both the session user (Critical) and all operators.

### Migration: ExpandCorrelationIdLength
`notifications.correlation_id` column expanded from `varchar(36)` to `varchar(100)`. This was a pre-existing bug in the schema — the existing `ReminderSchedulerService` was already writing correlation IDs longer than 36 characters (`reminder-start-{bookingId}` = 51 chars). The migration fixes this.

## APIs Added or Changed

No new REST endpoints. All notifications are visible via existing endpoints:
- `GET /api/v1/notifications` — user's InApp notifications (now includes BookingConfirmation, AutoReleaseNoShow, etc.)
- `GET /api/v1/notifications/unread-count` — reflects all new notification types
- `GET /api/v1/notifications/audit` (Admin/Security/Workplace) — all intervention alerts visible here

## Data / Persistence Changes

### Entities changed
| Entity | Change |
|--------|--------|
| `notifications.correlation_id` | Expanded from varchar(36) to varchar(100) |
| `notifications` | New rows added by BookingService, NoShowCheckerService, ReminderSchedulerService, InterventionAlertService |

### Migration
- `20260522234514_ExpandCorrelationIdLength` — alters `notifications.correlation_id` column to varchar(100)
- Applied automatically on startup via `db.Database.MigrateAsync()`

## Business Rules and Validation

### BookingConfirmation
- Generated in `BookingService.CreateBookingAsync()` after booking is persisted and CSMS tag is authorized
- CorrelationId: `booking-confirm-{bookingId}` — unique per booking, no duplicates possible

### AutoReleaseNoShow
- Generated in `NoShowCheckerService` when booking state changes to `NoShow`
- CorrelationId: `noshow-autorelease-{bookingId}` — sent once per booking

### GracePeriodWarning
- Sent when booking start time was `gracePeriod/3` minutes ago and no active session exists
- Default: 5 minutes after start (for default 15-minute grace period)
- Deduplicated by `grace-warning-{bookingId}`

### ChargingSessionEnded + MoveVehiclePrompt
- Sent when session `StopTime` is within the last 2 minutes
- Each sent once per session via `session-ended-{sessionId}` and `move-vehicle-{sessionId}`

### SlotReleasePrompt
- Sent when Active booking `endTime + gracePeriod` has passed
- Deduplicated by `slot-release-{bookingId}` — sent once

### Intervention Alerts (US-023)
- Fan-out to all users with roles `Security`, `Workplace`, `Admin`
- Each operator gets their own notification record (their AudienceUserId)
- All intervention alerts use `NotificationTrigger.AdminSecurityWorkplaceInterventionAlert`
- Daily deduplication prevents alert storms (daily window key in CorrelationId)

## Files Changed

- `backend/hackathon.API/Services/BookingService.cs` — added BookingConfirmation notification on booking creation
- `backend/hackathon.API/Services/NoShowCheckerService.cs` — added AutoReleaseNoShow notification per no-show
- `backend/hackathon.API/Services/ReminderSchedulerService.cs` — added 4 new reminder methods + updated GetReminderMinutes signature
- `backend/hackathon.API/Services/InterventionAlertService.cs` — **new** — US-023 intervention alert service
- `backend/hackathon.API/Program.cs` — registered `InterventionAlertService` as hosted service
- `backend/hackathon.API/Data/AppDbContext.cs` — updated CorrelationId max length to 100
- `backend/hackathon.API/Migrations/20260522234514_ExpandCorrelationIdLength.cs` — **new migration**
- `backend/hackathon.API/Migrations/AppDbContextModelSnapshot.cs` — updated snapshot

## How to Test

### BookingConfirmation
1. POST /api/v1/bookings with valid data (authenticated as alice@nexlevel.mu)
2. GET /api/v1/notifications — should show a `BookingConfirmation` notification immediately
3. GET /api/v1/notifications/unread-count — count should be >= 1

### GracePeriodWarning
1. Create a booking with `startTime` 5 minutes in the past (test only, bypass startTime validation)
2. Wait up to 60 seconds for ReminderSchedulerService to run
3. GET /api/v1/notifications — should show `BookingGracePeriodWarning` notification

### ChargingSessionEnded + MoveVehiclePrompt
1. Have an Active booking with a Charging session
2. Mark the session as Completed with StopTime = now
3. Wait up to 60 seconds
4. GET /api/v1/notifications — should show both `ChargingSessionEnded` and `MoveVehiclePrompt`

### AutoReleaseNoShow
1. Create a Confirmed booking with startTime 16+ minutes in the past
2. Wait 60 seconds for NoShowCheckerService
3. GET /api/v1/bookings/{id} — should show state=NoShow
4. GET /api/v1/notifications — should show `AutoReleaseNoShow` notification

### InterventionAlerts (US-023)
1. Give user alice 2+ no-show bookings updated in the last 7 days
2. Wait 5 minutes for InterventionAlertService
3. Login as carol (Security) and GET /api/v1/notifications — should show repeated no-show alert

### Slot Release Prompt
1. Have an Active booking whose endTime + 15min has passed
2. Wait 60 seconds for ReminderSchedulerService
3. GET /api/v1/notifications — should show `SlotReleasePrompt`

## Assumptions

1. All reminder types deduplicate on CorrelationId — if the backend restarts, the same notification will not be sent twice (idempotent).
2. Intervention alerts fan out to ALL users with operator roles; this is intentional for demo visibility.
3. `GracePeriodWarning` offset uses `gracePeriod / 3` to provide a mid-grace warning regardless of the configured grace period value.
4. Charger fault detection only triggers if there is a currently active Charging/Authenticating session — faults on idle chargers do not generate user notifications.

## Known Limitations / Technical Debt

- Email and Teams delivery channels are not implemented for any of these notifications (payload-preview model per backlog assumption A4).
- The `SendSessionEndedNotifications` window of 2 minutes may miss sessions if the service restarts within that window; a more robust approach would track "notified" state on the session entity.
- InterventionAlertService checks faulted chargers on every 5-minute cycle, which could generate multiple identical alerts if the charger stays faulted. Daily deduplication mitigates this.

## Demo Notes

- Booking confirmation notification appears in the notification bell immediately after a user books a charger — visible to the demo audience without waiting.
- Intervention alerts appear in Security/Admin notification feeds — demonstrable by logging in as carol (Security) or dave (Admin) after alice has two no-shows.
- The migration `ExpandCorrelationIdLength` fixes a silent data truncation bug that would have caused notifications to silently fail when written to the DB.

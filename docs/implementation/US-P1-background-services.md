# P1 — Background Services — Backend Implementation Notes

## Status
Implemented

## Summary

Three `IHostedService` background services are now registered and running when the backend starts. They cover the three core P1 automation flows: CSMS session synchronisation, no-show detection, and session reminder notifications.

## APIs Added or Changed

No new endpoints. Background services write directly to the database.

All notification records created by `ReminderSchedulerService` are visible via the existing:
- `GET /api/v1/notifications` — user's InApp notifications
- `GET /api/v1/notifications/unread-count`
- `GET /api/v1/notifications/audit` (Admin/Security/Workplace)

All audit log entries created by `NoShowCheckerService` are visible via:
- `GET /api/v1/audit-logs` (Admin/Security/Workplace)

## Data / Persistence Changes

### Entities/columns changed by background services at runtime

| Entity | Field | Change trigger |
|--------|-------|---------------|
| `bookings` | `state` | NoShow → `NoShow`; CSMS confirms → `Active`; session ends → `Completed` |
| `bookings` | `updated_at` | Updated on each state change |
| `charging_sessions` | `state` | `NotStarted` → `Charging` → `Completed` / `Expired` |
| `charging_sessions` | `csms_session_id` | Updated from PENDING placeholder to real CSMS session ID |
| `charging_sessions` | `energy_kwh` | Synced from CSMS on every poll |
| `charging_sessions` | `start_time`, `stop_time` | Set by CSMS sync |
| `chargers` | `status` | `Reserved` → `Charging` → `Available` |
| `notifications` | new rows | Created by ReminderSchedulerService |
| `audit_logs` | new rows | Created by NoShowCheckerService per no-show booking |

No migration required — existing schema supports all writes.

## Business Rules and Validation

### SessionSyncService
- Polls `GET /api/sessions/active` from CSMS every 30 seconds
- Matches sessions to local bookings via `idTag` + `stationIdentity` (charger `external_station_id`)
- When a CSMS session matches a booking:
  - Updates placeholder session: `NotStarted` → `Charging`, sets real `CsmsSessionId`
  - Transitions booking: `Confirmed` → `Active`
- When a CSMS session is no longer active:
  - Marks local session as `Completed`, booking as `Completed`, charger back to `Available`
- Sessions without a matching booking are skipped (BookingId is non-nullable in schema)
- CSMS unavailability returns empty list — no sessions processed, no error thrown

### NoShowCheckerService
- Runs every 60 seconds
- Checks: `booking.State == Confirmed AND booking.startTime + GRACE_PERIOD_MINUTES <= now`
- Grace period: `SystemConfig["GRACE_PERIOD_MINUTES"]` (default: 15 minutes)
- Additional condition: linked session must still be in `NotStarted` or `Authenticating` state
- Actions:
  - Booking → `NoShow`
  - Charger → `Available` (if was `Reserved`)
  - Session → `Expired`
  - Audit log entry: `BookingAutoNoShow` by `system/System`

### ReminderSchedulerService
- Runs every 60 seconds
- `SessionStartingSoon`: sent when a Confirmed booking starts in `PRE_SESSION_REMINDER_MINUTES` ± 1 minute
  - Default: 10 minutes before start
- `ChargingSessionEndingSoon`: sent when an Active booking ends in `SESSION_ENDING_REMINDER_MINUTES` ± 1 minute
  - Default: 5 minutes before end
- Deduplication: `CorrelationId` = `reminder-start-{bookingId}` / `reminder-end-{bookingId}`
  - If a notification with the same CorrelationId already exists, it is skipped (no duplicates)
- Channel: `InApp` only (Email/Teams delivery not implemented)

## Files Changed

- `backend/hackathon.API/Services/SessionSyncService.cs` — **new**
- `backend/hackathon.API/Services/NoShowCheckerService.cs` — **new**
- `backend/hackathon.API/Services/ReminderSchedulerService.cs` — **new**
- `backend/hackathon.API/Program.cs` — registered three hosted services with `AddHostedService<T>()`
- `tests/testing-assumptions.md` — updated Known Gaps section

## How to Test

The services are auto-started when `dotnet run` is executed.

### NoShowCheckerService manual test
1. Create a booking with `startTime` in the past (e.g., 20 minutes ago)
2. Ensure the booking state is `Confirmed` and no active session exists
3. Wait up to 60 seconds (service runs every minute)
4. `GET /api/v1/bookings/{id}` should return `state: "NoShow"`
5. `GET /api/v1/audit-logs?entityId={bookingId}` should show `BookingAutoNoShow` entry

### ReminderSchedulerService manual test
1. Create a booking with `startTime` exactly 10 minutes from now
2. Wait up to 60 seconds for the service to run
3. `GET /api/v1/notifications` (as the booking user) should show a `SessionStartingSoon` notification
4. Check that re-waiting another minute does NOT produce a duplicate (deduplication by CorrelationId)

### SessionSyncService manual test (with live CSMS)
1. Start CSMS: `http://localhost:3000`
2. Ensure CSMS has an active session with a matching idTag from a Confirmed local booking
3. Wait 30 seconds
4. `GET /api/v1/bookings/{id}` should show `state: "Active"`
5. `GET /api/v1/sessions/{id}` should show `state: "Charging"` with energy_kwh updated

## Assumptions

1. CSMS mock mode (`Csms:MockMode=true`) results in `GetActiveSessionsAsync()` returning empty list — sync cycle runs but does nothing. This is the expected demo fallback.
2. `CsmsSession.IdTag` is the same idTag stored in `Booking.CsmsIdTag` — used as the primary matching key.
3. `CsmsSession.StationIdentity` maps to `Charger.ExternalStationId` exactly.
4. Grace period of 15 minutes default is safe for demo — the seeded "Active" booking will not be incorrectly marked as no-show.

## Known Limitations / Technical Debt

- No retry backoff for CSMS errors — if CSMS is slow, 30s poll may queue up
- `SaveChangesAsync` is called inside the sync loop per charger — could be batched for efficiency
- NoShow service does not send a notification to the user (only audit logs)
- No email/Teams delivery for reminders

## Demo Notes

- With CSMS simulator running, real-time session energy updates will appear in the dashboard on page refresh (frontend polls every 5s)
- NoShow detection gives the demo a realistic operational flow (bookings that expire are cleaned up automatically)
- In-app notifications from reminders will appear in the notification bell within 1 minute of a session approaching

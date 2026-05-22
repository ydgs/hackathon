# Testing Assumptions

## Backend Foundation

### Database
- PostgreSQL must be running on `localhost:5432`
- Database: `hackathon_ev_charging`, user: `postgres`, password: `postgres`
- Migrations are applied automatically on startup via `db.Database.MigrateAsync()`
- Seed data is inserted only in Development environment and is idempotent

### CSMS Simulator
- The CSMS (NexLevel simulator) runs on `http://localhost:3000` in development
- All CSMS calls fail gracefully — bookings are still created if CSMS is unavailable
- `csmsSyncStatus` in booking response reflects actual sync state: `Synced`, `Failed`, `Pending`
- Sessions data from CSMS simulator is flagged with `source: "CSMS-Simulator"` to distinguish from real data

### Authentication
- JWT tokens expire after 24 hours
- Token invalidation on logout is client-side only (no server-side token blacklist)
- All seeded user passwords are `demo1234`

### AI Insights Confidence
- "High" confidence requires >= 50 completed charging sessions in the query period
- "Medium" confidence requires >= 10 sessions
- "Low" confidence (< 10 sessions) does NOT include demand forecast data
- 50+ sessions are seeded to ensure demo shows "High" confidence by default

### Date/Time
- All times stored and returned as UTC (ISO 8601 with Z suffix)
- Booking `startTime` must be at least 1 minute in the future (tolerance for test setup)
- `startTime` to `endTime` must be > 0 minutes and <= 60 minutes for non-admin users

### Booking Overlap Detection
- Overlap is detected for bookings in states: Pending, Confirmed, Active
- Cancelled, Released, Completed, NoShow, Overridden bookings do NOT block new bookings

### Privacy Notice
- There must be exactly 1 PrivacyNotice with `isCurrentVersion: true` for the privacy check to work
- Users must acknowledge the CURRENT version — acknowledging an old version is insufficient

### Data Masking
- `GET /chargers` and `GET /chargers/{id}`: userDisplayName, vehicleMake, vehicleModel in active session are masked as "***" for StandardUser role
- Admin, Security, Workplace roles see unmasked data

### Sustainability Report Privacy
- Vehicle category groups with fewer than 3 distinct users are merged into "Other"
- This is enforced server-side regardless of the requesting role

### Pagination Defaults
- Default `page`: 1
- Default `limit`: 20
- Maximum `limit`: not enforced in current implementation (assumption: front-end respects reasonable limits)

### Audit Log
- AuditLog entries are immutable — any attempt to modify or delete throws at the application level
- `actorUserId` is stored as a string (allows "system" as actor for automated processes)
- Security and Workplace roles see only Booking, Charger, MaintenanceBlock, and Csms entity type entries

### Notifications
- `GET /notifications` returns only InApp channel notifications
- `GET /notifications/audit` returns all channels (Admin/Security/Workplace only)
- Notification delivery (Email/Teams) is not actually sent in this implementation — only recorded in DB

## Background Services (P1 — Now Implemented)

### SessionSyncService
- Polls CSMS `GET /api/sessions/active` every 30 seconds
- Matches CSMS sessions to local bookings by `idTag` and `stationIdentity`
- Updates placeholder sessions (state: NotStarted → Charging) when CSMS session starts
- Marks local Charging sessions as Completed when CSMS session is no longer active
- Creates new session records for CSMS sessions with linked bookings (no unlinked sessions)
- Updates charger status (Available/Reserved → Charging → Available)
- Startup delay: 10 seconds to avoid CSMS startup races

### NoShowCheckerService
- Runs every 60 seconds
- Grace period read from `SystemConfig["GRACE_PERIOD_MINUTES"]` (default: 15)
- Marks `Confirmed` bookings as `NoShow` if `startTime + gracePeriod < now` and no active session
- Marks linked placeholder session as `Expired`
- Returns charger to `Available` if it was `Reserved`
- Creates audit log entry for each no-show: `BookingAutoNoShow`
- Startup delay: 20 seconds

### ReminderSchedulerService
- Runs every 60 seconds
- Sends `SessionStartingSoon` InApp notification X minutes before Confirmed booking starts
- Sends `ChargingSessionEndingSoon` InApp notification Y minutes before Active booking end time
- Notification timing from `SystemConfig["PRE_SESSION_REMINDER_MINUTES"]` (default: 10) and `SystemConfig["SESSION_ENDING_REMINDER_MINUTES"]` (default: 5)
- Deduplication via `CorrelationId` (`reminder-start-{bookingId}` / `reminder-end-{bookingId}`)
- Startup delay: 30 seconds

### Background Service Test Notes
- CSMS unavailability is handled gracefully — `GetActiveSessionsAsync()` returns empty list on error
- All services use `IServiceScopeFactory` for scoped DB context (required for `BackgroundService`)
- Services log errors and continue — a single failed cycle does not stop the service
- For demo: with CSMS mock mode (`Csms:MockMode=true`), `GetActiveSessionsAsync()` returns empty — sync does nothing

## Known Gaps (Still Remaining)

- No rate limiting on login endpoint
- No refresh token — users must re-login after 24 hours
- No actual Email or Teams notification delivery (notifications saved to DB only)

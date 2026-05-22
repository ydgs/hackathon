# Backend Foundation - Implementation Notes

## Status
Implemented

## Summary
Complete ASP.NET Core Web API (.NET 8) backend for the EV Charging Orchestration Platform. Covers all 12 entities, all 36+ API endpoints defined in `api-conventions.md`, full JWT authentication, EF Core migrations, seed/demo data, and Swagger UI.

## APIs Added or Changed

All endpoints are prefixed with `/api/v1/`.

### Auth
- `POST /auth/login` — Email/password login, returns JWT + user summary (anonymous)
- `POST /auth/logout` — Audit-logs logout, token discard is client-side (requires auth)
- `GET /auth/me` — Returns current user with eligibility + privacy acknowledgement status

### Privacy
- `GET /privacy-notice` — Returns current privacy notice version (anonymous)
- `POST /privacy-notice/acknowledge` — Records acknowledgement for current user

### Chargers
- `GET /chargers` — List chargers with optional `?locationCode=&status=` filters; masks sensitive fields (`***`) for StandardUser role
- `GET /chargers/{id}` — Single charger with current active session info
- `PUT /chargers/{id}/status` — Admin/Workplace update charger status

### Bookings
- `POST /bookings` — Create booking with full 12-step validation chain (eligibility, privacy, daily cap, conflict, CSMS auth)
- `GET /bookings` — List bookings; StandardUser sees only own; supports `?state=&chargerId=&userId=&dateFrom=&dateTo=&page=&limit=`
- `GET /bookings/{id}` — Single booking with charging session detail
- `DELETE /bookings/{id}` — Cancel booking (sets state=Cancelled, revokes CSMS tag)
- `POST /bookings/{id}/release` — Release booking mid-session (Security/Workplace/Admin)
- `PUT /bookings/{id}/override` — Admin override of any state transition with mandatory reason

### Eligible Users
- `GET /eligible-users` — List; StandardUser can only see own record
- `POST /eligible-users` — Create (Admin/Workplace)
- `GET /eligible-users/{id}` — Single record
- `PUT /eligible-users/{id}` — Update; StandardUser can only update vehicleMake/vehicleModel on own record
- `DELETE /eligible-users/{id}` — Soft-delete (sets Inactive) if historical bookings exist; Admin only

### Charging Sessions
- `GET /sessions` — List with filters; supports `?chargerId=&userId=&state=&dateFrom=&dateTo=&page=&limit=`
- `GET /sessions/{id}` — Single session detail

### Notifications
- `GET /notifications` — InApp notifications scoped to current user
- `GET /notifications/unread-count` — Count of unread InApp notifications
- `PUT /notifications/{id}/read` — Mark notification read
- `GET /notifications/audit` — All-channel notification log (Admin/Security/Workplace)

### Reports
- `GET /reports/summary` — High-level KPIs (sessions, energy, users, no-show rate)
- `GET /reports/sessions` — Session list with pagination
- `GET /reports/energy` — Energy data with peak hours and charger ranking
- `GET /reports/utilization` — Charger utilization rates
- `GET /reports/sustainability` — CO2 savings grouped by vehicle category (privacy-safe: groups <3 users as "Other")

### Audit Logs
- `GET /audit-logs` — Paginated; Admin sees all; Security/Workplace see filtered subset (Booking/Charger/MaintenanceBlock/Csms only)

### Maintenance Blocks
- `POST /maintenance-blocks` — Create block + CSMS BlockConnector call + optional force-cancel existing bookings
- `DELETE /maintenance-blocks/{id}` — Remove block + CSMS UnblockConnector + set charger Available

### System Config
- `GET /config` — Get all config key-value pairs (Admin)
- `PUT /config` — Batch update config keys (Admin); allowed keys whitelist enforced

### AI Insights
- `GET /ai/insights` — Grounded NL summary + demand forecast + patterns + recommendations (no external LLM call for MVP; derived from DB data)

### Health
- `GET /health` — Returns `{ status: "healthy", timestamp }` (anonymous)

All paginated responses use: `{ data: [...], pagination: { page, limit, total, totalPages } }`
All error responses use: `{ message, errors: [{ field, code, message }], traceId }`

## Data / Persistence Changes

### Entities Added
1. `Location` — physical charging location
2. `Charger` — individual charger unit linked to location
3. `User` — platform users with roles (Admin, StandardUser, Security, Workplace, ReportingESGViewer, Management)
4. `EligibleEvUser` — workplace EV eligibility record linked 1:1 to User
5. `PrivacyNotice` — versioned privacy notice content
6. `PrivacyAcknowledgement` — user acknowledgements of specific notice versions
7. `Booking` — EV charging time slot reservations
8. `ChargingSession` — actual OCPP charging sessions (from CSMS)
9. `MaintenanceBlock` — charger maintenance windows
10. `Notification` — multi-channel notifications (InApp/Email/Teams)
11. `AuditLog` — immutable audit trail (application + DB enforced)
12. `SystemConfig` — key-value configuration store

### Database
- PostgreSQL with EF Core snake_case naming convention
- All PK/FK indexes, unique constraints, and composite indexes for booking overlap detection
- Migration: `Migrations/20260522222001_InitialCreate.cs`
- Applied automatically on startup via `db.Database.MigrateAsync()`

### Seed Data (Development only)
- 2 locations (HQ Campus, South Block)
- 8 chargers (4 per location)
- 7 users: alice (StandardUser/Active/Acknowledged), bob (StandardUser/Active/NotAcknowledged), carol (Security), dave (Workplace), emma (Admin), frank (ReportingESGViewer), grace (Management). All passwords: `demo1234`
- 4 eligible EV user records
- 1 privacy notice v1.0
- 5 current bookings
- 50+ charging sessions (4 recent + 46 historical with fixed Random seed 42 for determinism)
- 1 maintenance block
- 4 demo notifications
- 5 audit log entries
- 9 system config entries

## Business Rules and Validation

### Booking creation 12-step chain
1. Required fields (chargerId, startTime, endTime, vehicleMake, vehicleModel)
2. Time format and end > start
3. Start time not in the past (1-minute tolerance)
4. Duration <= 60 minutes (admin override with reason bypasses)
5. User must have EligibilityStatus.Active
6. User must have acknowledged current privacy notice
7. Daily cap: 60 minutes/user/day
8. No existing Active/Confirmed booking for same user on same day
9. Charger must have status Available
10. No overlapping confirmed/active/pending bookings for same charger+time
11. No maintenance block conflict for same charger+time
12. CSMS authorization tag call (graceful: booking created even on CSMS failure, csmsSyncStatus reflects state)

### Authorization
- Roles: Admin, StandardUser, Security, Workplace, ReportingESGViewer, Management
- StandardUser: scoped to own bookings/records
- Security/Workplace: operational access (release, maintenance blocks, filtered audit)
- Admin: full access including config, overrides, all audit logs
- ReportingESGViewer/Management: reports + AI insights only

### AuditLog immutability
- EF Core `SaveChanges` override throws `InvalidOperationException` on any attempt to modify/delete AuditLog entries

### Data masking
- `GET /chargers` and `GET /chargers/{id}`: for StandardUser role, `userDisplayName`, `vehicleMake`, `vehicleModel` are returned as `"***"`

### Sustainability report privacy
- Vehicle categories with fewer than 3 distinct users are grouped into "Other"

## Files Changed

- `backend/hackathon.API/hackathon.API.csproj` — Added EF Core, JWT Bearer, BCrypt, EFCore.NamingConventions, Design packages
- `backend/hackathon.API/Models/` — 12 entity files + Enums.cs
- `backend/hackathon.API/Data/AppDbContext.cs` — DbContext with Fluent API, timestamp hooks, AuditLog immutability
- `backend/hackathon.API/Data/DataSeeder.cs` — Idempotent seed data
- `backend/hackathon.API/DTOs/` — AuthDTOs.cs, BookingDTOs.cs, ChargerDTOs.cs, ReportingDTOs.cs, Common.cs
- `backend/hackathon.API/Infrastructure/CsmsClient.cs` — ICsmsClient + CsmsClient typed HTTP client
- `backend/hackathon.API/Services/` — TokenService.cs, AuditLogService.cs, BookingService.cs
- `backend/hackathon.API/Controllers/` — 12 controllers (Auth, Privacy, Chargers, Bookings, EligibleUsers, Sessions, Notifications, Reports, AuditLogs, MaintenancBlocks, Config, Ai)
- `backend/hackathon.API/Migrations/` — InitialCreate migration (auto-applied on startup)
- `backend/hackathon.API/Program.cs` — Full DI, middleware pipeline, health check
- `backend/hackathon.API/appsettings.json` + `appsettings.Development.json` — Config with JWT and CSMS settings
- `NuGet.Config` (repo root) — Disables private Azure Artifacts feed for this project

## How to Test

1. Ensure PostgreSQL is running on `localhost:5432` with database `hackathon_ev_charging`, user/password `postgres`/`postgres`
2. Run: `cd backend/hackathon.API && dotnet run`
3. App auto-applies migrations and seeds demo data on first run
4. Open Swagger UI: `http://localhost:5219/swagger` (port may vary - check console output)
5. Login: `POST /api/v1/auth/login` with `{ "email": "emma@nexlevel.mu", "password": "demo1234" }` for Admin
6. Copy the JWT token and use `Authorize` button in Swagger
7. Test booking creation: `POST /api/v1/bookings` with a future start/end time

### Quick test credentials
| User | Email | Role |
|------|-------|------|
| Alice | alice@nexlevel.mu | StandardUser (Active, Acknowledged) |
| Emma | emma@nexlevel.mu | Admin |
| Carol | carol@nexlevel.mu | Security |
| Dave | dave@nexlevel.mu | Workplace |
| Frank | frank@nexlevel.mu | ReportingESGViewer |
| Grace | grace@nexlevel.mu | Management |

All passwords: `demo1234`

## Assumptions

1. CSMS base URL defaults to `http://localhost:3000` in development; graceful degradation when unavailable
2. JWT expiry is 24 hours (configurable via `Jwt:ExpiryHours`)
3. `Program.cs` calls `MigrateAsync()` on startup — migrations are applied automatically; no manual `dotnet ef database update` needed at runtime
4. Seed data is idempotent — re-running the app won't duplicate seed records
5. Background sync services (StationSyncService, SessionSyncService, NoShowCheckerService, ReminderSchedulerService) are P1 and not yet implemented

## Known Limitations / Technical Debt

- No background services for CSMS sync, no-show detection, or reminder scheduling (P1 work)
- CORS allows both `localhost:5173` and `localhost:3000` (API conventions doc says 5173 only — documented deviation for dev flexibility)
- AI insights use database-derived logic, not an external LLM (sufficient for demo; `docs/architecture.md` notes this as P2)
- No rate limiting on login endpoint
- Notification delivery (Email/Teams) is recorded in DB but not actually sent (webhook/SMTP config needed for P1)

## Demo Notes

- AI insights endpoint (`GET /api/v1/ai/insights`) returns "High" confidence because 50+ seeded historical sessions exist
- All seed data uses fixed GUIDs and deterministic Random(42) — demo will show consistent data on every run
- Admin user (emma@nexlevel.mu) can access all features including config, audit logs, and AI insights
- Charger status changes, booking creation, and cancellation all generate audit log entries visible via `GET /api/v1/audit-logs`

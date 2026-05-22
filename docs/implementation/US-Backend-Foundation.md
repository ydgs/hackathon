# US-Backend-Foundation — Backend Database Foundation Implementation Notes

## Status
Implemented

## Summary

Complete ASP.NET Core Web API (.NET 8) backend for the EV Charging Orchestration Platform. All 12 entities from the data model are implemented with full EF Core configuration, indexes, foreign keys, migrations, seed/demo data, and a health endpoint. The build succeeds with zero warnings.

## APIs Added or Changed

### Health (anonymous)
- `GET /health` — returns `{ "status": "healthy", "timestamp": "..." }` — 200 OK

### Auth
- `POST /api/v1/auth/login` — email/password, returns JWT + user summary
- `POST /api/v1/auth/logout` — audit-logs logout (requires auth)
- `GET /api/v1/auth/me` — returns current user with eligibility and privacy ack status

### All other endpoints
See `docs/api-conventions.md` for the full endpoint list.

All endpoints follow the standard error shape:
```json
{
  "message": "Short description.",
  "errors": [{ "field": "startTime", "code": "InvalidStartTime", "message": "Start time must be in the future." }],
  "traceId": "optional"
}
```

## Data / Persistence Changes

### Entities created (12 total)

| Entity | Table | Key Fields |
|--------|-------|-----------|
| Location | `locations` | id, name, code (unique) |
| Charger | `chargers` | id, location_id (FK), external_station_id (unique), connector_id, display_name, status |
| User | `users` | id, email (unique), display_name, role, password_hash |
| EligibleEvUser | `eligible_ev_users` | id, user_id (FK, unique), workplace_registry_eid (unique), badge_id (unique), eligibility_status, privacy_acknowledgement_status |
| PrivacyNotice | `privacy_notices` | id, version (unique), content, effective_date, is_current_version |
| PrivacyAcknowledgement | `privacy_acknowledgements` | id, user_id (FK), privacy_notice_id (FK), version, acknowledged_at |
| Booking | `bookings` | id, user_id (FK), charger_id (FK), actor_user_id (FK, nullable), start_time, end_time, state, csms_id_tag, csms_sync_status |
| ChargingSession | `charging_sessions` | id, booking_id (FK, unique), charger_id (FK), user_id (FK), csms_session_id, state, energy_kwh, source |
| MaintenanceBlock | `maintenance_blocks` | id, charger_id (FK), actor_user_id (FK), start_time, end_time, reason, is_active |
| Notification | `notifications` | id, audience_user_id (FK), trigger_event, channel, severity, payload (jsonb), delivery_status, read_state, correlation_id |
| AuditLog | `audit_logs` | id, timestamp, actor_user_id (string), actor_role, action, entity_type, entity_id, before_state, after_state, source |
| SystemConfig | `system_configs` | key (PK), value, updated_at, updated_by |

### Database tables and migrations

- Migration 1: `20260522222001_InitialCreate` — all 12 tables with PK/FK constraints and standard indexes
- Migration 2: `20260523000000_AddPartialIndexesAndAuditTrigger` — partial indexes + PostgreSQL audit_log immutability trigger

Migrations are applied automatically on startup via `db.Database.MigrateAsync()` in Program.cs.

### Key indexes for booking overlap detection

- `ix_bookings_charger_state_time` — `(charger_id, state, start_time, end_time)` — composite overlap check
- `ix_bookings_user_state_day` — `(user_id, state, start_time)` — daily cap check
- `ix_maintenance_blocks_is_active` — partial index WHERE `is_active = true`
- `ix_maintenance_blocks_time_range` — `(charger_id, start_time, end_time)`

### Seed data (development only)

| Entity | Count | Notes |
|--------|-------|-------|
| locations | 2 | NEX Tower, NEXTERACOM |
| chargers | 8 | 4 per location, various statuses |
| users | 7 | one per role, all password `demo1234` |
| eligible_ev_users | 4 | Active+Acked (alice), Active+NotAcked (bob), Suspended (carol), Inactive (dave) |
| privacy_notices | 1 | v1, is_current_version=true |
| privacy_acknowledgements | 1 | alice acknowledged v1 |
| bookings | 5 (explicit) + 46 historical | Confirmed, Active, Completed, Cancelled, NoShow + random historical |
| charging_sessions | 4 (explicit) + 46 historical | Total 50+ for AI insights "High" confidence |
| maintenance_blocks | 1 | NEX Tower Charger 4, firmware update |
| notifications | 4 | 3 for alice's BookingConfirmation (InApp/Email/Teams) + 1 SessionStartingSoon |
| audit_logs | 5 | maintenance block created, CSMS block, booking created, CSMS auth success, privacy ack |
| system_configs | 9 | GRACE_PERIOD_MINUTES=15, DAILY_CAP_MINUTES=60, EMISSION_FACTOR_KG_PER_KWH=0.85, etc. |

Seed is idempotent — uses `AnyAsync()` check before each entity group.

## Business Rules and Validation

### Booking creation (12-step validation chain)
1. Required fields check
2. End time > start time
3. Start time not in the past (1-min tolerance)
4. Duration <= 60 min (admin bypass with reason)
5. User must be EligibilityStatus.Active
6. User must have acknowledged current privacy notice
7. Daily cap: total <= 60 min/day (admin bypass)
8. No existing Pending/Confirmed/Active booking for same user (admin bypass)
9. Charger must not be BlockedForMaintenance / Unavailable / Faulted
10. No overlapping bookings for same charger + time window
11. No active maintenance block for same charger + time window
12. CSMS authorization tag call (graceful: booking saved even on CSMS failure; csms_sync_status reflects outcome)

### Authorization rules
- `StandardUser` — own bookings/notifications/profile only
- `Security` / `Workplace` — all today's bookings, release, maintenance blocks, audit (operational scope)
- `Admin` — full access: eligible-user CRUD, system config, overrides, all audit logs
- `ReportingESGViewer` / `Management` — read-only reports and AI insights

### AuditLog immutability
- EF Core SaveChanges override throws on any Modified or Deleted AuditLog entity
- PostgreSQL trigger `trg_audit_logs_immutable` (migration 2) blocks UPDATE/DELETE at DB level

### Privacy denormalization
- `eligible_ev_users.privacy_acknowledgement_status` is updated whenever a new acknowledgement is recorded
- Used as a fast gate check in booking creation (avoids join to privacy_acknowledgements table)

## Files Changed

- `backend/hackathon.API/Models/` — 12 entity POCOs + `Enums.cs`
- `backend/hackathon.API/Data/AppDbContext.cs` — DbContext with Fluent API, timestamp auto-update, AuditLog immutability guard
- `backend/hackathon.API/Data/DataSeeder.cs` — Idempotent seed with deterministic historical sessions (Random seed 42)
- `backend/hackathon.API/Migrations/20260522222001_InitialCreate.cs` — all tables, FKs, standard indexes
- `backend/hackathon.API/Migrations/20260523000000_AddPartialIndexesAndAuditTrigger.cs` — partial indexes + audit trigger
- `backend/hackathon.API/Program.cs` — DI, JWT, CORS, CSMS HTTP client, migration on startup, health endpoint
- `backend/hackathon.API/appsettings.json` — placeholder JWT (replace before demo)
- `backend/hackathon.API/appsettings.Development.json` — local dev config (postgres/postgres, JWT secret)
- `docs/architecture.md` — tech stack, entity list, commands
- `docs/api-conventions.md` — full API contract reference
- `.env.example` — all required environment variables with comments

## How to Test

1. Start PostgreSQL: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 --name hackathon-pg -d postgres:16`
2. Run backend: `cd backend/hackathon.API && dotnet run`
3. App auto-applies both migrations and seeds demo data on first run
4. Verify health: `curl http://localhost:5219/health` — should return `{"status":"healthy",...}`
5. Open Swagger UI: `http://localhost:5219/swagger`
6. Login as Admin: `POST /api/v1/auth/login` body `{"email":"emma@nexlevel.mu","password":"demo1234"}`
7. Copy JWT token, click Authorize in Swagger, paste `Bearer <token>`
8. Test `GET /api/v1/chargers` — should return 8 chargers
9. Test `GET /api/v1/bookings` — should return 5 bookings
10. Test `GET /api/v1/reports/summary` — should return energy/session metrics

### Demo credentials
| User | Email | Role | Eligible? | Privacy Acked? |
|------|-------|------|-----------|----------------|
| Alice | alice@nexlevel.mu | StandardUser | Active | Yes |
| Bob | bob@nexlevel.mu | StandardUser | Active | No |
| Carol | carol@nexlevel.mu | Security | Suspended | Yes |
| Dave | dave@nexlevel.mu | Workplace | Inactive | No |
| Emma | emma@nexlevel.mu | Admin | — | — |
| Frank | frank@nexlevel.mu | ReportingESGViewer | — | — |
| Grace | grace@nexlevel.mu | Management | — | — |

All passwords: `demo1234`

## Assumptions

1. CSMS unavailable at startup is non-fatal — app starts and serves from seeded data.
2. `dotnet ef database update` is not required manually — migrations run automatically on startup.
3. Seed data is development-only (guarded by `app.Environment.IsDevelopment()`).
4. `bookings.vehicle_make` and `bookings.vehicle_model` are required (NOT NULL) per data model assumption A-DM-05.
5. `bookings.csms_id_tag` is derived as `{badge_id}-{random-8-char-uuid-prefix}` pending confirmation of CSMS idTag format (BQ-DM-01).
6. Background services (StationSyncService, SessionSyncService, NoShowCheckerService, ReminderSchedulerService) are not yet implemented — P1 work.

## Known Limitations / Technical Debt

- Background CSMS sync services are not implemented yet (P1).
- CSMS mock mode flag (`Csms__MockMode`) is accepted by CsmsClient but full fixture response is not implemented — CSMS errors are logged and return false/null gracefully.
- Notification delivery (email/Teams) saves payload to DB but does not send (SMTP/webhook config is P1).
- AI insights endpoint returns DB-derived logic (not Azure OpenAI) — sufficient for MVP demo.
- No rate limiting on login endpoint.
- CORS allows `localhost:3000` in addition to `localhost:5173` for local dev flexibility (deviation from api-conventions.md which specifies 5173 only).

## Demo Notes

- All seed GUIDs are deterministic — demo data is consistent across restarts.
- Historical sessions use `Random(42)` fixed seed — same data every run.
- `GET /api/v1/ai/insights` returns "High" confidence (50+ seeded sessions).
- `GET /api/v1/reports/sustainability` returns CO2 savings based on `0.85 kg/kWh` emission factor.
- Alice has a confirmed booking + active charging session visible in the dashboard.
- NEX Tower Charger 4 is `BlockedForMaintenance` with a maintenance block from Emma (Admin).

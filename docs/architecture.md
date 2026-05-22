# Architecture — EV Charging Orchestration Platform

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | ASP.NET Core Web API (.NET 8, C#) |
| ORM | Entity Framework Core 8 (Npgsql) |
| Database | PostgreSQL 16 |
| Auth | JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer) |
| Password hashing | BCrypt.Net-Next |
| Snake_case naming | EFCore.NamingConventions |
| AI (P2) | Azure OpenAI GPT-4o via Azure.AI.OpenAI |

## Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (Kestrel) | 5000 (or 5219 in dev) |
| PostgreSQL | 5432 |
| CSMS REST API | 3000 |

## Folder Structure

```
backend/
  hackathon.API/
    Controllers/      — Route handlers
    Data/             — AppDbContext, DataSeeder, Migrations
    DTOs/             — Request/response shapes
    Infrastructure/   — CsmsClient typed HttpClient
    Models/           — EF Core entity POCOs + Enums
    Services/         — Business logic (Booking, Token, AuditLog)
    Program.cs
    appsettings.json
    appsettings.Development.json

frontend/
  src/
    api/              — typed fetch wrappers
    pages/            — route-level components
    components/       — shared components
    hooks/
    context/

docs/
  architecture.md     (this file)
  api-conventions.md
  implementation/     — per-feature implementation notes

tests/
  api/                — manual API test cases
  test-data/          — sample JSON data
```

## Entities

All entities use:
- UUID primary keys (`gen_random_uuid()`)
- `created_at` / `updated_at` timestamptz on all tables except `audit_logs` and `system_configs`
- snake_case column names via `UseSnakeCaseNamingConvention()`
- Enums stored as varchar strings

### P0 Entities

1. `locations` — physical charging sites
2. `chargers` — individual charging points
3. `users` — platform users (6 roles)
4. `eligible_ev_users` — workplace EV eligibility registry
5. `privacy_notices` — versioned privacy notice content
6. `privacy_acknowledgements` — user acknowledgement audit trail
7. `bookings` — time-slot reservations
8. `charging_sessions` — CSMS-sourced session data
9. `audit_logs` — immutable action audit trail
10. `system_configs` — key-value configuration

### P1 Entities

11. `maintenance_blocks` — charger maintenance windows
12. `notifications` — multi-channel notification records

## Migration

Migration name: `InitialCreate`
Location: `backend/hackathon.API/Migrations/`
Applied: automatically on startup via `db.Database.MigrateAsync()`

Manual run: `cd backend/hackathon.API && dotnet ef database update`

## Seed Data

Applied in development mode only via `DataSeeder.SeedAsync(dbContext)`.
All seed methods are idempotent (check `AnyAsync()` before inserting).

Seed includes:
- 2 locations, 8 chargers (4 per site)
- 7 users (one per role), all password: `demo1234`
- 4 eligible EV user records (Active/Active-NotAcked/Suspended/Inactive)
- 1 privacy notice v1 + 1 acknowledgement (alice)
- 5 bookings + 50 charging sessions (4 explicit + 46 historical random)
- 1 maintenance block, 4 notifications, 5 audit log entries
- 9 system config keys

## Environment Variables

All secrets and external URLs must be configured via environment or appsettings:

```
ConnectionStrings__DefaultConnection  PostgreSQL connection string
Jwt__Secret                           HS256 JWT signing key (min 32 chars)
Jwt__Issuer                           JWT issuer claim
Jwt__Audience                         JWT audience claim
Jwt__ExpiryHours                      Token expiry (default: 24)
Csms__BaseUrl                         CSMS REST API base URL (default: http://localhost:3000)
Csms__MockMode                        true = bypass live CSMS calls (demo fallback)
```

## Database Commands

```bash
# Start PostgreSQL (Docker)
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 --name hackathon-pg -d postgres:16

# Apply migrations (auto-applied on startup; or run manually)
cd backend/hackathon.API
dotnet ef database update

# Run backend
dotnet run

# Run frontend
cd frontend
npm install
npm run dev
```

## Key Design Decisions

- Single-project monolith with internal folder separation (not Clean Architecture layers)
- HTTP polling every 5s from frontend for dashboard refresh — no WebSocket/SignalR
- IHostedService background services for CSMS sync, no-show checking, reminder scheduling
- AuditLog immutability enforced at EF Core layer (SaveChanges interceptor) + PostgreSQL trigger
- Privacy acknowledgement status denormalized on EligibleEvUser for fast booking gate check
- CSMS mock mode flag bypasses all live CSMS calls for demo resilience

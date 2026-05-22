# Solution Architecture — AI-Powered EV Charging Orchestration Platform

**Event:** Hackathon 2026 — Accenture Mauritius NEXLevel Reinvented
**Status:** Architecture baseline for hackathon MVP
**Date:** 2026-05-22
**Author:** Solution Architect Agent
**Sources:** `use-case-brief.md`, `as-is-to-be.md`, `functional-requirements.md`, `user-journeys.md`, `backlog-structure.md`
**Stack Confirmed:** React 18 + Vite + TypeScript + Tailwind CSS / ASP.NET Core Web API (.NET 8, C#) / Entity Framework Core / PostgreSQL 16

---

## 1. Architecture Overview

### Summary

The platform is a monolithic responsive web application backed by a single ASP.NET Core Web API and one PostgreSQL database. Background jobs run inside the same backend process using `IHostedService` / `BackgroundService`. The frontend calls the custom backend exclusively — it never calls the provided CSMS REST API directly. The backend wraps the provided NexLevel CSMS REST API for all charging infrastructure data. No custom OCPP server is built.

### Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend framework | React 18 (Vite + TypeScript) | Fast setup, rich ecosystem, component-based for role-driven UI; Vite provides instant HMR |
| Styling | Tailwind CSS | Utility-first, mobile-first responsive layout with minimal custom CSS |
| Backend framework | ASP.NET Core Web API (.NET 8, C#) | Mature, strongly typed, built-in DI container, excellent tooling; team familiar with C# |
| Language | C# (backend), TypeScript (frontend) | Strong typing end-to-end; C# enforces contracts at compile time; TypeScript catches UI-layer errors early |
| Database | PostgreSQL 16 | Relational integrity for booking/session state machines; JSONB for notification payloads |
| ORM | Entity Framework Core 8 (Npgsql provider) | Code-first migrations; strongly typed LINQ queries; excellent .NET DI integration |
| Authentication | Simplified JWT (seeded users + mock login) | Full IdP out of scope; seeded role-based users with JWT via Microsoft.AspNetCore.Authentication.JwtBearer |
| AI integration | Azure OpenAI (GPT-4o) via Azure.AI.OpenAI NuGet SDK | Authorized Accenture tool; used only for P2 AI insights panel |
| Notifications (email) | MailKit + MailHog (local) or Ethereal | Payload preview first; live SMTP if available |
| Notifications (Teams) | Incoming Webhook (Adaptive Card JSON) | Direct webhook post if available; otherwise payload persisted for preview |
| Background jobs | IHostedService / BackgroundService (in-process) | Polling loops for CSMS sync and reminder scheduling; no separate queue or Redis needed at this scale |
| Real-time dashboard | HTTP polling (5-second interval from frontend) | Simplest reliable demo path; SignalR deferred unless time allows |
| Hosting | `dotnet run` / Kestrel + Vite dev server (demo) | No cloud infra needed for hackathon demo; single command per process |
| Ports | Frontend: 5173 / Backend API: 5000 / DB: 5432 | Standard defaults; no conflict |

### Architecture Diagram

```
+---------------------------------------------------------------------+
|                      BROWSER (React + Tailwind)                     |
|                                                                     |
|  Employee Flow   Admin / Security / Workplace   Reporting / AI      |
|  (mobile-first)       (operational views)        (dashboards)       |
|                                                                     |
|  HTTP polling every 5s for dashboard refresh                        |
+----------------------------------+----------------------------------+
                                   | REST (JSON over HTTP, port 5000)
                                   |
+----------------------------------v----------------------------------+
|                CUSTOM BACKEND (ASP.NET Core Web API / .NET 8)       |
|                                                                     |
|  JWT Bearer Auth middleware     RBAC policy / [Authorize(Roles=)]   |
|                                                                     |
|  +------------------+  +-----------------+  +-------------------+  |
|  | Booking Engine   |  | CsmsClient      |  | NotificationSvc   |  |
|  | (fair-use rules) |  | (HttpClient     |  | (in-app / email / |  |
|  | state machine    |  |  REST wrapper)  |  |  Teams payloads)  |  |
|  +------------------+  +-----------------+  +-------------------+  |
|                                                                     |
|  +------------------+  +-----------------+  +-------------------+  |
|  | ReportingService |  | AiInsightSvc    |  | AuditLogService   |  |
|  | (EF Core queries)|  | (Azure OpenAI   |  | (append-only)     |  |
|  +------------------+  |  NuGet SDK)     |  +-------------------+  |
|                         +-----------------+                         |
|  Background services (IHostedService / BackgroundService):          |
|    - StationSyncService     (every 5s)                              |
|    - SessionSyncService     (every 5s)                              |
|    - NoShowCheckerService   (every 30s)                             |
|    - ReminderSchedulerService (every 60s)                           |
+------------------+---------------------------+----------------------+
                   |                           |
    EF Core        |                           |  HTTP REST
    (Npgsql)       v                           v
+------------------+         +---------------------------------+
| PostgreSQL 16    |         |  PROVIDED NexLevel CSMS         |
| (port 5432)      |         |  REST API (CSMS_BASE_URL)       |
|                  |         |                                 |
| Bookings         |         |  GET  /api/stations             |
| ChargingSessions |         |  GET  /api/stations/:identity   |
| Chargers         |         |  GET  /api/sessions             |
| Locations        |         |  GET  /api/sessions/active      |
| EligibleEvUsers  |         |  GET  /api/sessions/:id         |
| Users            |         |  POST /api/auth/tags            |
| Notifications    |         |  DELETE /api/auth/tags/:idTag   |
| AuditLogs        |         |  GET  /api/auth/tags?active=true|
| PrivacyNotices   |         |  PUT  .../connectors/:n/block   |
| PrivacyAcks      |         |  DELETE .../connectors/:n/block |
| SystemConfigs    |         |  POST .../remote-start (P2)     |
| MaintenanceBlocks|         |  POST .../remote-stop (P2)      |
+------------------+         +---------------------------------+
                                          |
                                 OCPP 1.6J (owned by CSMS)
                                          |
                             +---------------------------------+
                             |  NexLevel OCPP 1.6J Simulator   |
                             |  (simulator-backed charge points)|
                             +---------------------------------+
```

---

## 2. Frontend Responsibilities

- Render the mobile-first responsive UI using React 18, Vite, TypeScript, and Tailwind CSS.
- Implement all six role-based views: Standard User, Security, Workplace, Admin, Reporting/ESG Viewer, Management/Jury.
- Show four states on every data-driven component: loading skeleton, empty state, success/data, and error banner.
- Implement HTTP polling every 5 seconds for the charger dashboard (call `GET /api/v1/chargers` on the custom backend).
- Render charger status cards colour-coded by status (Available, Reserved, Charging, BlockedForMaintenance, Unavailable, Faulted).
- Implement the booking form: charger select, start/end time pickers, vehicle make/model (pre-filled from user profile), fair-use rule disclosure, remaining daily allowance indicator.
- Implement client-side booking validation: duration <= 60 minutes, startTime not in the past — and also let server errors surface inline.
- Render the in-app notification center with unread badge count, ordered list, read/unread toggle, and channel indicator (InApp / Email / Teams).
- Render the Reporting & Sustainability dashboard: metric tiles (sessions, kWh, CO2, utilization, peak hours, etc.), date-range and location filters, "Based on simulated demo data" label.
- Render the AI Insights panel (P2): NL summary card, demand forecast, pattern findings, anomaly list, grounding block, confidence badge.
- Render the Admin screens: eligible EV user CRUD, maintenance block management, configuration panel, audit log viewer, notification audit/history with payload preview.
- Render the privacy notice modal and acknowledgement flow (first-booking gate).
- Apply RBAC in the UI: hide or disable controls not permitted for the current role; do not rely on UI RBAC as a security gate — backend enforces it.
- Use exact field names from `docs/api-conventions.md` — do not rename fields to fit the UI.
- Label all temporary mock data with `// MOCK: replace with [endpoint]`.
- Keep all pages responsive at minimum 320px (mobile) and functional at 1024px+ (admin/demo laptop).
- Use `axios` or the native `fetch` API for HTTP calls; wrap all calls in a typed API client layer under `src/api/`.

---

## 3. Backend Responsibilities

- Serve a single REST API on port 5000 under `/api/v1/` using ASP.NET Core controllers (not minimal APIs — controllers provide clearer route grouping and attribute-based RBAC for a team under time pressure).
- Validate all incoming requests server-side using FluentValidation or data annotations; return errors in the standard shape defined in Section 5.
- Issue and validate JWTs using `Microsoft.AspNetCore.Authentication.JwtBearer`; expose `POST /api/v1/auth/login` and `POST /api/v1/auth/logout`.
- Enforce RBAC on every protected route using `[Authorize(Roles = "...")]` attributes; return HTTP 403 with a machine-readable reason for denied access.
- Run the booking engine: enforce BR-001..BR-017 (1h cap per booking, daily cumulative <= 60 min, no overlap, eligible user gate, privacy gate, startTime in future, charger not blocked/faulted/unavailable).
- On booking confirmation: call `POST /api/auth/tags` on the CSMS via the `CsmsClient`; set `CsmsSyncStatus` to `Authorized` or `AuthorizationFailed`; trigger audit log and intervention alert on failure (BR-027).
- On booking cancellation/release/no-show/override: call `DELETE /api/auth/tags/:idTag` on the CSMS; set `CsmsSyncStatus` to `Revoked`; audit-log the outcome (BR-028).
- Expose wrapping endpoints for charger availability sourced from the CSMS (`GET /api/v1/chargers`, `GET /api/v1/chargers/:id`).
- Run `StationSyncService` (`BackgroundService`): every 5 seconds, fetch `GET /api/stations` and `GET /api/sessions/active` from the CSMS; update local `Chargers` and `ChargingSessions` tables via EF Core.
- Run `SessionSyncService` (`BackgroundService`): every 5 seconds, fetch `GET /api/sessions/:id` for any local session in `Charging` state; persist `EnergyKWh` and stop timestamp on completion.
- Run `NoShowCheckerService` (`BackgroundService`): every 30 seconds, for every `Confirmed` booking past its `StartTime + GraceMinutes`, transition to `NoShow`, revoke CSMS auth, send auto-release notification, audit-log.
- Run `ReminderSchedulerService` (`BackgroundService`): every 60 seconds, for bookings approaching start or end within configured lead times, generate notification records across in-app, email, and Teams channels.
- Generate notification records for every trigger event using the nine template registry (FR-REM-017); persist email payload (JSON) and Teams Adaptive Card JSON in the `Notifications` table; deliver live if configured.
- Expose reporting endpoints aggregating data from local `Bookings` and `ChargingSessions` tables; support date-range and location filters using EF Core LINQ queries.
- Expose the AI insights endpoint (P2): call Azure OpenAI via `Azure.AI.OpenAI` NuGet SDK with a grounded prompt constructed from reporting data; return structured insight with `grounding`, `confidence`, and `simulatedDataLabel` fields.
- Persist every critical action to the `AuditLogs` table (append-only; no UPDATE or DELETE on this table — enforced via EF Core interceptor or PostgreSQL trigger).
- Expose the audit log endpoint with filtering (date range, actor, action type, entity type); enforce read-only access per role.
- Expose the notification audit/history endpoint for authorized operators.
- Use environment variables for all external configuration (CSMS_BASE_URL, CSMS_AUTH_HEADER, OPENAI_API_KEY, ConnectionStrings__DefaultConnection, JWT_SECRET, SMTP_HOST, TEAMS_WEBHOOK_URL). Provide `.env.example` and `appsettings.Development.json.example`.
- Seed the database on startup (or via `dotnet ef database update` + a dedicated seed method) with demo users, chargers, and sample sessions.

### API Surface Summary

| Resource | Endpoints |
|---|---|
| Auth | `POST /login`, `POST /logout`, `GET /me` |
| Privacy | `GET /privacy-notice`, `POST /privacy-notice/acknowledge` |
| Eligible EV Users | `GET /eligible-users`, `GET /eligible-users/{id}`, `POST /eligible-users`, `PUT /eligible-users/{id}`, `DELETE /eligible-users/{id}` |
| Chargers | `GET /chargers`, `GET /chargers/{id}`, `PUT /chargers/{id}/status` |
| Bookings | `GET /bookings` (list, filter), `POST /bookings`, `GET /bookings/{id}`, `PUT /bookings/{id}/cancel`, `PUT /bookings/{id}/release`, `PUT /bookings/{id}/override` |
| Sessions | `GET /sessions` (list, filter), `GET /sessions/{id}` |
| Notifications | `GET /notifications` (current user), `PUT /notifications/{id}/read`, `GET /notifications/unread-count`, `GET /notifications/audit` (admin) |
| Reporting | `GET /reports/summary`, `GET /reports/sessions`, `GET /reports/energy`, `GET /reports/utilization`, `GET /reports/sustainability` |
| AI Insights | `GET /ai/insights` |
| Audit Log | `GET /audit-logs` (filter) |
| Maintenance | `POST /maintenance-blocks`, `DELETE /maintenance-blocks/{id}` |
| Config | `GET /config`, `PUT /config` (admin only) |

All routes are prefixed with `/api/v1/`. Full request/response shapes, status codes, and error formats are defined in `docs/api-conventions.md`.

---

## 4. Database Responsibilities

- Persist all application state: users, eligibility, privacy acknowledgements, chargers, bookings, charging sessions, notifications, audit log, configuration.
- Enforce referential integrity via EF Core navigation properties and foreign key constraints in PostgreSQL.
- Enforce immutability of the `AuditLogs` table through an EF Core `SaveChangesInterceptor` that throws on UPDATE/DELETE targeting `AuditLog` entities, plus a PostgreSQL-level trigger as belt-and-suspenders.
- Serve as the single source of truth for booking state and fair-use calculations (daily cumulative duration).

### Data Model

All entities are C# POCOs with EF Core mapping. PascalCase property names map to snake_case column names via `UseSnakeCaseNamingConvention()` (EFCore.NamingConventions NuGet). Enums are stored as strings (`HasConversion<string>()`). Timestamps are stored as `timestamp with time zone` (UTC).

#### Entity: `Location`
```csharp
public class Location
{
    public Guid Id { get; set; }                    // PK
    public string Name { get; set; }                // "NEX Tower", "NEXTERACOM"  REQUIRED
    public string Code { get; set; }                // "NEX-TOWER", "NEXTERACOM"  REQUIRED UNIQUE
    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<Charger> Chargers { get; set; }
}
```

#### Entity: `Charger`
```csharp
public class Charger
{
    public Guid Id { get; set; }                    // PK
    public Guid LocationId { get; set; }            // FK -> Location  REQUIRED
    public string ExternalStationId { get; set; }   // CSMS station identity  REQUIRED UNIQUE
    public int ConnectorId { get; set; }            // default 1
    public string DisplayName { get; set; }         // e.g. "NEX-TOWER-CH-01"  REQUIRED
    public ChargerStatus Status { get; set; }        // enum: Available, Reserved, Charging, BlockedForMaintenance, Unavailable, Faulted
    public DateTime? LastCsmsSyncAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Location Location { get; set; }
    public ICollection<Booking> Bookings { get; set; }
    public ICollection<MaintenanceBlock> MaintenanceBlocks { get; set; }
}
```

#### Entity: `User`
```csharp
public class User
{
    public Guid Id { get; set; }                    // PK
    public string Email { get; set; }               // REQUIRED UNIQUE
    public string DisplayName { get; set; }         // REQUIRED
    public UserRole Role { get; set; }              // enum: StandardUser, Security, Workplace, Admin, ReportingESGViewer, Management
    public string PasswordHash { get; set; }        // bcrypt; for mock login
    public DateTime CreatedAt { get; set; }

    // Navigation
    public EligibleEvUser? EligibleEvUser { get; set; }
    public ICollection<Booking> Bookings { get; set; }
    public ICollection<Notification> Notifications { get; set; }
}
```

#### Entity: `EligibleEvUser`
```csharp
public class EligibleEvUser
{
    public Guid Id { get; set; }                    // PK
    public Guid UserId { get; set; }                // FK -> User  REQUIRED UNIQUE
    public string WorkplaceRegistryEid { get; set; } // REQUIRED UNIQUE
    public string BadgeId { get; set; }             // REQUIRED UNIQUE
    public EligibilityStatus EligibilityStatus { get; set; } // enum: Active, Inactive, Suspended
    public string VehicleMake { get; set; }
    public string VehicleModel { get; set; }
    public SiteContext SiteContext { get; set; }    // enum: NexTower, Nexteracom, Both
    public PrivacyAckStatus PrivacyAcknowledgementStatus { get; set; } // enum: NotAcknowledged, Acknowledged
    public DateTime LastUpdatedAt { get; set; }

    // Navigation
    public User User { get; set; }
}
```

#### Entity: `PrivacyNotice`
```csharp
public class PrivacyNotice
{
    public Guid Id { get; set; }                    // PK
    public string Version { get; set; }             // REQUIRED UNIQUE e.g. "v1"
    public string Content { get; set; }             // Full notice text  REQUIRED
    public DateOnly EffectiveDate { get; set; }     // REQUIRED
    public bool IsCurrentVersion { get; set; }      // At most one row is true

    // Navigation
    public ICollection<PrivacyAcknowledgement> Acknowledgements { get; set; }
}
```

#### Entity: `PrivacyAcknowledgement`
```csharp
public class PrivacyAcknowledgement
{
    public Guid Id { get; set; }                    // PK
    public Guid UserId { get; set; }                // FK -> User  REQUIRED
    public Guid PrivacyNoticeId { get; set; }       // FK -> PrivacyNotice  REQUIRED
    public string Version { get; set; }             // Denormalized for audit convenience
    public DateTime AcknowledgedAt { get; set; }    // REQUIRED
    // UNIQUE constraint on (UserId, PrivacyNoticeId)

    // Navigation
    public User User { get; set; }
    public PrivacyNotice PrivacyNotice { get; set; }
}
```

#### Entity: `Booking`
```csharp
public class Booking
{
    public Guid Id { get; set; }                    // PK
    public Guid UserId { get; set; }                // FK -> User  REQUIRED
    public Guid ChargerId { get; set; }             // FK -> Charger  REQUIRED
    public DateTime StartTime { get; set; }         // UTC  REQUIRED
    public DateTime EndTime { get; set; }           // UTC  REQUIRED
    public BookingState State { get; set; }         // enum: Pending, Confirmed, Active, Completed, Cancelled, Released, NoShow, Overridden
    public string VehicleMake { get; set; }         // Captured at booking time  REQUIRED
    public string VehicleModel { get; set; }        // Captured at booking time  REQUIRED
    public string? CsmsIdTag { get; set; }          // RFID/tag used for CSMS authorization
    public CsmsSyncStatus CsmsSyncStatus { get; set; } // enum: AuthorizationPending, Authorized, AuthorizationFailed, Revoked
    public string? ReasonForOverride { get; set; }  // Required for admin/security/workplace overrides
    public Guid? ActorUserId { get; set; }          // FK -> User NULLABLE — admin who created on behalf or overrode
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; }
    public Charger Charger { get; set; }
    public User? ActorUser { get; set; }
    public ChargingSession? ChargingSession { get; set; }
    public ICollection<Notification> Notifications { get; set; }
}
```

#### Entity: `ChargingSession`
```csharp
public class ChargingSession
{
    public Guid Id { get; set; }                    // PK
    public Guid BookingId { get; set; }             // FK -> Booking  REQUIRED UNIQUE
    public string CsmsSessionId { get; set; }       // Session ID from CSMS  REQUIRED
    public Guid ChargerId { get; set; }             // FK -> Charger  REQUIRED
    public Guid UserId { get; set; }                // FK -> User  REQUIRED
    public string VehicleMake { get; set; }
    public string VehicleModel { get; set; }
    public SessionState State { get; set; }         // enum: NotStarted, Authenticating, Charging, Completed, StoppedByUser, StoppedByAdmin, Faulted, Expired
    public DateTime? StartTime { get; set; }        // From CSMS
    public DateTime? StopTime { get; set; }         // From CSMS
    public decimal EnergyKWh { get; set; }          // Retrieved from CSMS GET /sessions/:id; default 0
    public string Source { get; set; }              // "CSMS" or "CSMS-Simulator"  REQUIRED
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Booking Booking { get; set; }
    public Charger Charger { get; set; }
    public User User { get; set; }
}
```

#### Entity: `MaintenanceBlock`
```csharp
public class MaintenanceBlock
{
    public Guid Id { get; set; }                    // PK
    public Guid ChargerId { get; set; }             // FK -> Charger  REQUIRED
    public DateTime StartTime { get; set; }         // UTC  REQUIRED
    public DateTime? EndTime { get; set; }          // NULLABLE — open-ended if null
    public string Reason { get; set; }              // REQUIRED
    public Guid ActorUserId { get; set; }           // FK -> User (Admin who created it)  REQUIRED
    public bool IsActive { get; set; }              // default true
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Charger Charger { get; set; }
    public User ActorUser { get; set; }
}
```

#### Entity: `Notification`
```csharp
public class Notification
{
    public Guid Id { get; set; }                    // PK
    public Guid AudienceUserId { get; set; }        // FK -> User  REQUIRED
    public NotificationTrigger TriggerEvent { get; set; } // enum: BookingConfirmation, SessionStartingSoon, BookingGracePeriodWarning, ChargingSessionEndingSoon, ChargingSessionEnded, MoveVehiclePrompt, SlotReleasePrompt, AutoReleaseNoShow, AdminSecurityWorkplaceInterventionAlert
    public NotificationChannel Channel { get; set; } // enum: InApp, Email, Teams
    public NotificationSeverity Severity { get; set; } // enum: Info, Warning, Critical
    public string Title { get; set; }               // REQUIRED
    public string Body { get; set; }                // REQUIRED
    public string? Payload { get; set; }            // JSONB — Email JSON or Teams Adaptive Card JSON
    public DeliveryStatus DeliveryStatus { get; set; } // enum: Sent, Previewed, Failed
    public bool ReadState { get; set; }             // default false; In-app only
    public Guid? LinkedBookingId { get; set; }      // FK -> Booking NULLABLE
    public Guid? LinkedSessionId { get; set; }      // FK -> ChargingSession NULLABLE
    public Guid? LinkedChargerId { get; set; }      // FK -> Charger NULLABLE
    public DateTime Timestamp { get; set; }         // REQUIRED

    // Navigation
    public User AudienceUser { get; set; }
    public Booking? LinkedBooking { get; set; }
    public ChargingSession? LinkedSession { get; set; }
    public Charger? LinkedCharger { get; set; }
}
```

#### Entity: `AuditLog`
```csharp
public class AuditLog
{
    public Guid Id { get; set; }                    // PK
    public DateTime Timestamp { get; set; }         // REQUIRED
    public string ActorUserId { get; set; }         // userId string or "system"  REQUIRED
    public string ActorRole { get; set; }           // Role at time of action  REQUIRED
    public string Action { get; set; }              // e.g. BookingOverride, CsmsAuthorizationFailed, EligibleUserCreated  REQUIRED
    public string EntityType { get; set; }          // e.g. Booking, ChargePoint, EligibleEVUser  REQUIRED
    public string EntityId { get; set; }            // REQUIRED
    public string? BeforeState { get; set; }        // JSONB serialized as string
    public string? AfterState { get; set; }         // JSONB serialized as string
    public string? Reason { get; set; }
    public AuditSource Source { get; set; }         // enum: User, Admin, System, Csms
}
```
Note: The `AuditLog` table has no navigation properties pointing back to other entities — entity IDs are stored as strings to avoid cascade delete complications.

#### Entity: `SystemConfig`
```csharp
public class SystemConfig
{
    public string Key { get; set; }                 // PK e.g. "GRACE_PERIOD_MINUTES", "EMISSION_FACTOR_KG_PER_KWH"
    public string Value { get; set; }               // REQUIRED
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }            // FK -> User NULLABLE
}
```

### DbContext

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Location> Locations { get; set; }
    public DbSet<Charger> Chargers { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<EligibleEvUser> EligibleEvUsers { get; set; }
    public DbSet<PrivacyNotice> PrivacyNotices { get; set; }
    public DbSet<PrivacyAcknowledgement> PrivacyAcknowledgements { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<ChargingSession> ChargingSessions { get; set; }
    public DbSet<MaintenanceBlock> MaintenanceBlocks { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<SystemConfig> SystemConfigs { get; set; }
}
```

### Key Relationships

- One `Location` has many `Chargers`.
- One `User` has at most one `EligibleEvUser` record.
- One `User` has many `Bookings` (but at most one Pending/Confirmed/Active at a time — enforced server-side).
- One `Booking` has at most one `ChargingSession`.
- One `Charger` has many `Bookings` (no overlap allowed — enforced server-side).
- One `Charger` has many `MaintenanceBlocks`.
- One `User` has many `Notifications` (as audience).
- `AuditLog` has no EF Core navigation properties (entity IDs stored as strings).

### Key Indexes (declared in `OnModelCreating`)

- `Booking.UserId`, `Booking.ChargerId`, `Booking.State`, `Booking.StartTime` — used by overlap and fair-use queries.
- `ChargingSession.BookingId`, `ChargingSession.ChargerId`, `ChargingSession.State` — used by session sync and reporting.
- `Notification.AudienceUserId`, `Notification.Timestamp` — used by notification center polling.
- `AuditLog.Timestamp`, `AuditLog.ActorUserId`, `AuditLog.Action`, `AuditLog.EntityType` — used by audit log filters.

---

## 5. Integration Strategy

### Custom Backend as the Single Integration Point

The frontend never calls the provided CSMS REST API. All CSMS interactions are encapsulated in the custom backend's `CsmsClient` class, which is registered as a typed `HttpClient` in DI (`services.AddHttpClient<CsmsClient>()`).

### CsmsClient (.NET Typed HttpClient)

```csharp
public class CsmsClient
{
    // GET /api/stations
    Task<List<StationDto>> GetStationsAsync();

    // GET /api/stations/:identity
    Task<StationDto> GetStationAsync(string identity);

    // GET /api/sessions/active
    Task<List<ActiveSessionDto>> GetActiveSessionsAsync();

    // GET /api/sessions/:id
    Task<SessionDetailDto> GetSessionAsync(string id);

    // GET /api/sessions?station=&idTag=&status=&from=&to=
    Task<List<SessionDto>> GetSessionsAsync(SessionQueryParams filters);

    // POST /api/auth/tags
    Task<AuthTagResponseDto> AuthorizeTagAsync(AuthTagRequestDto payload);

    // DELETE /api/auth/tags/:idTag
    Task RevokeTagAsync(string idTag);

    // GET /api/auth/tags?active=true
    Task<List<ActiveTagDto>> GetActiveTagsAsync();

    // PUT /api/stations/:id/connectors/:n/block
    Task BlockConnectorAsync(string stationId, int connectorId);

    // DELETE /api/stations/:id/connectors/:n/block
    Task UnblockConnectorAsync(string stationId, int connectorId);

    // POST /api/stations/:id/remote-start (P2, optional)
    Task RemoteStartAsync(string stationId, RemoteStartDto payload);

    // POST /api/stations/:id/remote-stop (P2, optional)
    Task RemoteStopAsync(string stationId, RemoteStopDto payload);
}
```

Header injection (Bearer or no-auth) is configured via `CSMS_AUTH_HEADER` environment variable applied in the `HttpClient` `DelegatingHandler`.

### Background Services (IHostedService / BackgroundService)

| Service | Interval | CSMS calls | Local writes (EF Core) |
|---|---|---|---|
| `StationSyncService` | 5s | `GetStationsAsync()`, `GetStationAsync(id)` | Update `Charger.Status`, `Charger.LastCsmsSyncAt` |
| `SessionSyncService` | 5s | `GetActiveSessionsAsync()` | Map to `ChargingSession`; update charger status to Charging |
| `SessionDetailSyncService` | 5s per Charging session | `GetSessionAsync(id)` | Persist `EnergyKWh`, `StopTime`, `State = Completed` |
| `NoShowCheckerService` | 30s | — | Bookings past `StartTime + GraceMinutes` with no session → NoShow + revoke |
| `ReminderSchedulerService` | 60s | — | Generate `Notification` rows for upcoming start/end thresholds |

Each `BackgroundService` runs in a `while (!stoppingToken.IsCancellationRequested)` loop with a `Task.Delay(interval, stoppingToken)`. All CSMS calls are wrapped in try/catch — errors are logged but do not crash the service.

### CSMS Booking Authorization Flow

```
User submits booking form
  -> Controller validates eligibility, privacy, daily cap, overlap, charger status
  -> If valid: INSERT Booking (State=Confirmed, CsmsSyncStatus=AuthorizationPending)
  -> Call CsmsClient.AuthorizeTagAsync({ idTag, stationId, connectorId, validFrom, validUntil })
  -> On 2xx: UPDATE Booking SET CsmsSyncStatus=Authorized
  -> On non-2xx/timeout: UPDATE Booking SET CsmsSyncStatus=AuthorizationFailed
               + raise InterventionAlert notification
               + write AuditLog entry (Action=CsmsAuthorizationFailed)
```

### CSMS Revocation Flow

```
Cancel / Release / Override / NoShow
  -> UPDATE Booking state
  -> Call CsmsClient.RevokeTagAsync(booking.CsmsIdTag)
  -> On 2xx: UPDATE Booking SET CsmsSyncStatus=Revoked + AuditLog
  -> On failure: AuditLog (Action=CsmsRevocationFailed) + surface for admin reconciliation
                 Admin can trigger GET /api/auth/tags?active=true to reconcile
```

### Fallback Demo Scenario

If the CSMS/simulator is unavailable during the demo, the backend serves from pre-seeded `ChargingSessions` and `Chargers` data as a static snapshot. A `CSMS_MOCK_MODE=true` environment flag bypasses live CSMS calls and returns fixture data. This is the fallback plan described in the use-case brief.

---

## 6. Authentication and Authorization Approach

### Authentication (Simplified — MVP)

- A seeded set of users covers all six roles.
- The login screen presents a user-picker (dropdown or card selection) with a simple password field backed by BCrypt.Net-Next (`BCrypt.Net.BCrypt.Verify()`).
- On login, the backend issues a signed JWT containing `{ userId, role, displayName }` with a 24-hour expiry, signed with `HS256` using `JWT_SECRET` from environment configuration.
- Middleware: `app.UseAuthentication(); app.UseAuthorization();` with `services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(...)`.
- The JWT is stored in browser `localStorage` (acceptable for hackathon; in production, use httpOnly cookies).
- All protected API routes require `Authorization: Bearer <token>` header; missing or invalid tokens return HTTP 401.

### Authorization (RBAC)

- ASP.NET Core policy-based or role-based authorization via `[Authorize(Roles = "Admin,Security")]` on controllers/actions.
- Roles and their permitted actions:

| Role | Key permitted actions |
|---|---|
| StandardUser | Own bookings CRUD (within fair-use), own profile read, own notifications, privacy acknowledgement |
| Security | View all today's bookings, manual release with reason, mark charger status, view audit log (operational scope) |
| Workplace | Same as Security + create booking on behalf of user |
| Admin | All Security + Workplace actions + eligible user CRUD, maintenance blocks, system config, full audit log, full notification audit |
| ReportingESGViewer | Read-only reporting dashboard and sustainability metrics |
| Management | Read-only all dashboards (same as ReportingESGViewer + AI insights) |

- Denied actions return HTTP 403 with body `{ "errors": [{ "code": "Forbidden", "message": "..." }] }`.
- Role-restricted UI controls are hidden on the frontend to avoid confusion, but the backend is the authoritative security gate.

### Eligibility and Privacy Gates

- Before booking creation logic runs, the controller (or a dedicated `BookingValidationService`) checks:
  1. User is on the `EligibleEvUsers` registry with `EligibilityStatus = Active` → else HTTP 403, reason `NotEligible`.
  2. User has a `PrivacyAcknowledgements` row for the current `PrivacyNotices.IsCurrentVersion = true` record → else HTTP 403, reason `PrivacyNotAcknowledged`.
- These checks happen before any CSMS call (`POST /api/auth/tags` is never issued unless both gates pass).

---

## 7. Notification Approach

### In-App (Required — P0)

- Every trigger event inserts one or more rows in the `Notifications` table with `Channel = InApp`.
- The frontend polls `GET /api/v1/notifications?unreadOnly=false` on load and on tab focus.
- Unread badge count comes from `GET /api/v1/notifications/unread-count`.
- Users mark notifications read via `PUT /api/v1/notifications/{id}/read`.
- High-severity (Critical) notifications also surface as a toast/snackbar in the UI.

### Email (P1 — Payload Preview Fallback)

- The `NotificationService` builds an email payload object `{ to, subject, htmlBody, textBody }` for every trigger event.
- If `SMTP_HOST` is configured: MailKit sends the email; `DeliveryStatus = Sent`.
- If not configured: the payload JSON is stored in `Notifications.Payload`; `DeliveryStatus = Previewed`.
- The admin notification audit/history view renders the email payload as a readable preview.

### Microsoft Teams Adaptive Card (P1 — Payload Preview Fallback)

- The `NotificationService` builds a valid Adaptive Card JSON for every trigger event.
- Actions on cards deep-link back to the web application (e.g. `http://localhost:5173/bookings/{id}`).
- If `TEAMS_WEBHOOK_URL` is configured: the card is posted via `HttpClient` POST; `DeliveryStatus = Sent`.
- If not configured: the Adaptive Card JSON is stored in `Notifications.Payload`; `DeliveryStatus = Previewed`.
- The admin notification audit/history view renders a visual card preview and allows the JSON to be copied.

### Nine Reminder Templates

Templates are implemented as C# methods in `NotificationTemplateService.cs`. Each method accepts a context object and returns `NotificationPayload { Title, Body, EmailPayload, TeamsPayload }`. Templates:

1. BookingConfirmation
2. SessionStartingSoon (10 min pre-start)
3. BookingGracePeriodWarning (5 min post-start if no CSMS session)
4. ChargingSessionEndingSoon (10 min pre-end)
5. ChargingSessionEnded
6. MoveVehiclePrompt
7. SlotReleasePrompt
8. AutoReleaseNoShow (15 min post-start)
9. AdminSecurityWorkplaceInterventionAlert (no-show threshold / late release / charger fault)

### Cross-Channel Rule

One trigger event → one notification record per channel (InApp + Email + Teams = 3 rows linked by a shared `CorrelationId` ULID). All three rows share the same `TriggerEvent`, `AudienceUserId`, `Timestamp`, and linked entity IDs. Channel fan-out is synchronous inside the `NotificationService` (acceptable at hackathon scale).

---

## 8. AI Layer Approach

The AI layer is P2 (Could-have); it is built after P0 and P1 are stable, starting at hour 14.

### Design

- Backend exposes `GET /api/v1/ai/insights?locationId=&dateFrom=&dateTo=` (Admin / ReportingESGViewer / Management only).
- The handler queries the reporting service internally to assemble a grounding context: total sessions, total kWh, top charger, peak hour bucket, no-show rate, average duration.
- A grounded prompt is constructed, injecting the metric values as structured JSON into the system message. The LLM is instructed to produce a structured JSON response with fields: `nlSummary`, `demandForecast`, `patterns`, `anomalies`, `recommendations`, `grounding`, `confidence`, `simulatedDataLabel`.
- The LLM is called via the `Azure.AI.OpenAI` NuGet package (`OpenAIClient`, `ChatClient`). API key and endpoint are read from `appsettings` / environment variables.
- If the Azure OpenAI call fails, the endpoint returns HTTP 503 with a fallback static summary for demo resilience.
- The AI MUST NOT output any numeric not present in the `grounding` block (enforced in the prompt; output is validated server-side before returning to the client).
- If `confidence = "Low"` (fewer than 10 sessions in the window), point forecasts are omitted from the response.
- If any session in the window has `Source = "CSMS-Simulator"`, `simulatedDataLabel` is set to `"Based on simulated demo data"`.

### Responsible AI Rules (enforced in prompt and server-side validation)

- Every numeric in `nlSummary` must appear in `grounding`.
- `confidence` field is mandatory: High (>=50 sessions) / Medium (10-49) / Low (<10).
- `simulatedDataLabel` is mandatory when simulator-sourced data is present.
- No fabricated metrics.
- Fair-use recommendations cite the 1h/day BR002 baseline explicitly.

---

## 9. Reporting Approach

### Design

- All reporting queries run against the local PostgreSQL database (Bookings + ChargingSessions + Notifications + Chargers tables) using EF Core LINQ queries.
- The `ReportingService` class in the Application layer exposes specific async query methods per metric.
- Results are filtered by `LocationId` and date range (`DateFrom`, `DateTo`) at the LINQ query level.
- All widgets that include any session with `Source = "CSMS-Simulator"` return a `SimulatedDataLabel` flag in the response, which the frontend renders as a visible banner.

### Endpoint to Metric Mapping

| Endpoint | Metrics returned |
|---|---|
| `GET /api/v1/reports/summary` | totalSessions, totalKwh, estimatedCo2SavingsKg (= totalKwh * EMISSION_FACTOR), emissionFactorUsed |
| `GET /api/v1/reports/sessions` | totalSessions, cancelledCount, releasedCount, noShowCount, completedCount, avgDurationMinutes, avgKwh |
| `GET /api/v1/reports/energy` | totalKwh, avgKwhPerSession, peakHourDistribution (hour-of-day buckets), chargerRanking |
| `GET /api/v1/reports/utilization` | chargerUtilizationRate per charger, locationComparison (NEX Tower vs NEXTERACOM) |
| `GET /api/v1/reports/sustainability` | totalKwh, estimatedCo2SavingsKg, emissionFactorUsed, usageByVehicleCategory (aggregated, min 3 users) |

- CO2 formula: `estimatedCo2SavingsKg = totalKwh * 0.85` (default; value read from `SystemConfig` table, key `EMISSION_FACTOR_KG_PER_KWH`).
- All report responses include `{ data: {...}, simulatedDataLabel: string | null, appliedFilters: {...} }`.

---

## 10. Deployment Approach

### Hackathon Demo Runtime

- All services run on a single developer laptop (or a shared machine visible via projector).
- PostgreSQL runs as a Docker container: `docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16`.
- Backend starts with `dotnet run` (Kestrel serves on port 5000); or `dotnet watch run` for hot reload during development.
- Apply migrations: `dotnet ef database update` runs automatically on startup via `app.ApplyMigrations()` helper or a dedicated CLI step before demo.
- Seed data is applied via a `DataSeeder.SeedAsync(dbContext)` call in `Program.cs` under an `if (app.Environment.IsDevelopment())` guard.
- Frontend starts with `npm run dev` (Vite on port 5173).
- The provided NexLevel CSMS runs on its own configured port (CSMS_BASE_URL in environment / `appsettings.Development.json`).
- For a production-style demo package: `dotnet publish -c Release -o ./publish`, then `docker build` with a `Dockerfile` exposing port 5000 and Kestrel as the HTTP server.

### Folder Structure

```
repo-root/
  .env.example
  appsettings.Development.json.example
  docker-compose.yml            # postgres + (optionally) mailhog
  CLAUDE.md
  AGENTS.md
  docs/
    architecture.md
    api-conventions.md
    solution-architecture.md    (this file)
  src/
    Api/                        # ASP.NET Core Web API project (single project — justified below)
      Controllers/
        AuthController.cs
        BookingsController.cs
        ChargersController.cs
        EligibleUsersController.cs
        NotificationsController.cs
        ReportsController.cs
        AiInsightsController.cs
        AuditLogsController.cs
        MaintenanceController.cs
        ConfigController.cs
        PrivacyController.cs
      BackgroundServices/
        StationSyncService.cs
        SessionSyncService.cs
        NoShowCheckerService.cs
        ReminderSchedulerService.cs
      Services/
        BookingService.cs           # fair-use logic, state machine
        CsmsClient.cs               # typed HttpClient CSMS REST wrapper
        NotificationService.cs      # fan-out + template dispatch
        NotificationTemplateService.cs  # 9 template methods
        ReportingService.cs         # EF Core LINQ reporting queries
        AiInsightService.cs         # Azure OpenAI integration
        AuditLogService.cs          # append-only write helper
      Data/
        AppDbContext.cs             # EF Core DbContext
        Entities/                   # POCO entity classes
        Migrations/                 # EF Core migrations (generated)
        DataSeeder.cs               # demo seed data
      DTOs/                         # Request/Response shapes per endpoint
      Middleware/
        ExceptionHandlingMiddleware.cs  # global error → standard error shape
      Validators/                   # FluentValidation validators per request DTO
      appsettings.json
      appsettings.Development.json  # gitignored; copy from .example
      Program.cs                    # DI registration, middleware pipeline
  frontend/
    src/
      main.tsx
      App.tsx
      api/                          # typed API client functions (fetch / axios wrappers)
      pages/
        Login.tsx
        Dashboard.tsx               # charger availability (polls every 5s)
        Booking.tsx                 # create/view/cancel/release
        MyBookings.tsx
        Notifications.tsx
        Reporting.tsx
        AiInsights.tsx
        Admin/
          EligibleUsers.tsx
          MaintenanceBlocks.tsx
          AuditLog.tsx
          NotificationAudit.tsx
          Configuration.tsx
        Privacy.tsx
      components/                   # shared cards, modals, loaders, error banners
      hooks/
        usePolling.ts               # 5s interval hook for dashboard
      context/
        AuthContext.tsx
    index.html
    vite.config.ts
    tailwind.config.ts
    tsconfig.json
    package.json
  tests/
    api/
    ui/
    e2e/
    test-data/
    testing-assumptions.md
```

**Single-project justification:** The classic Clean Architecture layout (`Domain`, `Application`, `Infrastructure`, `Api` projects) adds project-to-project reference wiring overhead that consumes 1-2 hours in a hackathon. A single `Api` project with internal folder separation (`Services/`, `Data/`, `Controllers/`) delivers the same logical separation with zero project-reference overhead. This is the correct trade-off for a 16-hour delivery; the folder structure can be split into proper projects in the next iteration.

---

## 11. Security Considerations

- JWT secret must be set in `appsettings.Development.json` or as an environment variable (`JWT__Secret`) and never hardcoded. Use a 256-bit random value.
- All RBAC enforcement is server-side via `[Authorize(Roles = "...")]`; frontend UI hiding is UX only.
- The `AuditLogs` table is append-only at the application layer enforced by an EF Core `SaveChangesInterceptor` that throws on UPDATE/DELETE targeting `AuditLog`. A PostgreSQL-level trigger provides belt-and-suspenders enforcement.
- User passwords (mock login) are BCrypt-hashed (`BCrypt.Net-Next`); no plaintext credentials stored.
- CSMS auth header / API key stored in `appsettings` / environment variables; never logged or returned to the frontend.
- Azure OpenAI API key stored in environment variable; never logged or returned to the frontend.
- Input validation on all POST/PUT endpoints using FluentValidation; malformed requests return HTTP 400 before any business logic runs.
- CORS configured in `Program.cs` to allow `http://localhost:5173` only; no wildcard in any environment.
- Booking StartTime and EndTime are validated in UTC; stored in UTC; displayed in UTC+4 (Mauritius) on the frontend via JavaScript `toLocaleString()`.
- Vehicle aggregation reports suppress groups with fewer than 3 distinct users (privacy rule FR-REP-017).
- Privacy acknowledgement records are immutable once created (new version creates a new row; old rows are retained for audit).
- No user personal data (email, EID, badge) is returned to non-admin roles in shared views.

---

## 12. Performance Considerations

- The dashboard polls `GET /api/v1/chargers` every 5 seconds from the browser. At hackathon scale (1 demo machine, < 10 users watching), this is sufficient.
- The backend `BackgroundService` polling loops (5s station sync, 5s session sync, 30s no-show check, 60s reminder scheduler) run with `Task.Delay(interval)` between iterations; they must complete within the interval to avoid queuing. With 8 chargers and a local CSMS, each poll cycle is expected to complete in under 500ms.
- Reporting queries run against indexed columns declared in `OnModelCreating`. EF Core will generate the correct SQL; the Npgsql provider translates LINQ to efficient PostgreSQL queries.
- Seed data should include at least 50 historical sessions to make reporting metrics non-trivial and the AI insight panel meaningful.
- The AI insights endpoint calls Azure OpenAI synchronously; expected latency is 2-8 seconds. The frontend should show a loading spinner ("Generating AI insights...") and handle timeout gracefully (HTTP 503 fallback).
- For the demo, no pagination is strictly required, but add `limit/offset` query parameters to list endpoints to avoid sending unbounded results.
- EF Core query compilation is warm after the first request; for demo purposes, send one warm-up request in the seed script to avoid cold-start latency during the jury demo.

---

## 13. Architecture Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Provided CSMS REST API unavailable or incompatible during demo | Medium | Critical | Implement `CSMS_MOCK_MODE=true` flag that returns fixture data; prepare seeded sessions as fallback (mentioned in use-case brief Section 11) |
| CSMS idTag format unknown until demo day (Q27) | Medium | High | Design `CsmsIdTag` generation as a pluggable method in `BookingService`; default to `EID + booking date suffix`; confirm format with CSMS provider on arrival |
| CSMS base URL / auth scheme not confirmed (Q25) | Medium | High | Use `CSMS_BASE_URL` and `CSMS_AUTH_HEADER` env vars; keep `CsmsClient` header injection flexible (Bearer / Basic / no-auth) |
| Azure OpenAI credits exhausted or slow (AI layer, P2) | Low | Low (P2 only) | Pre-generate one set of insight results as a static JSON fixture served if OpenAI is unavailable; clearly label as demo data |
| EF Core migration fails or is slow on demo machine | Medium | High | Run `dotnet ef migrations add` and `dotnet ef database update` during development (not demo day); snapshot the DB after successful seed and keep `pg_dump` backup ready |
| Npgsql connection string misconfiguration (especially SSL mode) | Low | High | Test the exact `ConnectionStrings__DefaultConnection` format on the target machine before demo; set `sslmode=disable` for local Docker |
| BackgroundService polling loop throws unhandled exception and stops | Low | High | Wrap entire loop body in `try/catch (Exception ex) { _logger.LogError(ex, ...); }` in every `BackgroundService`; exceptions must not propagate past the loop boundary |
| Fair-use daily cumulative race condition (concurrent bookings) | Low | Medium | Execute fair-use check and INSERT inside an EF Core `dbContext.Database.ExecuteInTransactionAsync()` block with row-level locking (`SKIP LOCKED` or serializable isolation) |
| Frontend polling (5s) causes visible flicker on demo projector | Low | Low | Add CSS transition on status badge colour change; debounce the polling interval on tab-blur using `document.visibilityState` |
| Teams Adaptive Card JSON schema invalid for demo | Medium | Medium | Validate generated JSON against the Adaptive Card schema in a unit test before demo; use a known-good template and parameterize it rather than generating JSON from scratch |
| Notification volume overwhelms demo view | Low | Low | Notification center is paginated (latest 20 first); admin audit/history supports date filter |
| .NET SDK version mismatch on demo machine | Low | Medium | Pin `global.json` to .NET 8; install required SDK as first action on demo day; verify with `dotnet --version` |
| Team unfamiliarity with EF Core Npgsql DateTimeOffset handling | Low | Medium | Store all timestamps as `timestamp with time zone`; configure EF Core `UseTimestamptz()` on all `DateTime` properties; test timezone round-trips in seed script |

---

## 14. Key Technical Decisions

| Decision | Options Considered | Chosen | Why |
|---|---|---|---|
| Frontend framework | React, Vue, Angular | React 18 + Vite + TypeScript | Fastest project setup; richest ecosystem; team likely familiar; Vite provides instant HMR; TypeScript catches API contract errors early |
| Backend language/runtime | Node.js/TS, Python/FastAPI, .NET | ASP.NET Core Web API (.NET 8, C#) | Single language team familiar with C#; strongly typed; mature DI container; excellent EF Core support; controllers provide clear route/RBAC grouping |
| ORM | Prisma (Node), SQLAlchemy, EF Core | Entity Framework Core 8 (Npgsql) | Native .NET integration; code-first migrations; strongly typed LINQ; built-in DI; Npgsql has first-class PostgreSQL 16 support including JSONB via `HasColumnType("jsonb")` |
| Database | PostgreSQL, SQLite, MongoDB | PostgreSQL 16 | Strong relational integrity for booking state machine and fair-use constraints; JSONB for notification payloads; runs in Docker in seconds; EF Core + Npgsql is the canonical pairing |
| Backend project structure | Clean Architecture (Domain/Application/Infrastructure/Api), Vertical Slices, Monolith | Single-project monolith with internal folder separation | Hackathon timeline; project-reference wiring costs 1-2 hours; logical separation via folders is sufficient; can be refactored later |
| Real-time dashboard updates | WebSocket, SignalR, SSE, HTTP polling | HTTP polling (5s) | Zero additional infra; CSMS does not expose push events; 5s polling is imperceptible to demo observers; SignalR could be added in 1h if time allows |
| Background jobs | Hangfire, Quartz.NET, IHostedService | IHostedService / BackgroundService (in-process) | No Redis or database dependency; sufficient for 8 chargers and 1 demo machine; zero setup overhead; first-class .NET primitive |
| Authentication | OAuth/OIDC, Azure AD, Simplified JWT | Simplified JWT with seeded users (JwtBearerDefaults) | Full IdP integration is out of scope; mock login with role selector is accepted per FR-AUTH-001 and backlog assumption 5; `Microsoft.AspNetCore.Authentication.JwtBearer` NuGet is trivial to set up |
| Input validation | FluentValidation, DataAnnotations, custom middleware | FluentValidation | Clean separation of validation rules from controllers; readable rule chains; easy to test in isolation; `FluentValidation.AspNetCore` NuGet integrates with model binding |
| Notification email delivery | SendGrid, AWS SES, MailKit+MailHog | MailKit + MailHog (local) | No cloud account needed; MailHog captures emails locally for demo; payload preview fallback works without it |
| Teams notification | Power Automate, Graph API, Incoming Webhook | Incoming Webhook + Adaptive Card JSON | Simplest channel requiring only a webhook URL; no Azure tenant permissions needed; payload preview fallback works without it |
| AI provider | Azure OpenAI, Claude API, Gemini | Azure OpenAI GPT-4o via `Azure.AI.OpenAI` NuGet | Authorized Accenture tool; accessible under provided credits; strong JSON-mode support for structured grounding response; official .NET SDK available on NuGet |
| CSMS integration boundary | Build custom OCPP server, consume CSMS REST API | Consume provided CSMS REST API only via typed HttpClient | Explicitly required by the brief (Section 6.1); no custom OCPP server; custom app is the business layer only |
| Monolith vs microservices | Microservices, Modular monolith | Monolithic ASP.NET Core app with internal service classes | Hackathon timeline; no deployment infrastructure; a single `dotnet run` deployable is easier to demo and debug; service classes can be extracted later |

---

*All entities, fields, states, and API surface areas in this document are the authoritative source for backend schema definition, frontend API calls, and QA test case generation. Any deviation must be flagged and this document updated before implementation proceeds.*

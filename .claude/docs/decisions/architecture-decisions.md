# Architecture Decision Records — AI-Powered EV Charging Orchestration Platform

**Date:** 2026-05-22
**Status:** Accepted
**Project:** NEXLevel Reinvented — AI-Powered EV Charging Orchestration Platform
**Event:** Hackathon 2026 | Accenture Mauritius NEXLevel Reinvented
**Sources:** `use-case-brief.md`, `solution-architecture.md`, `data-model.md`, `api-contract.md`, `CLAUDE.md`

This document captures the important technical decisions made for the hackathon MVP. Each ADR records the context, the choice, the alternatives that were considered, and the trade-offs accepted. New decisions that deviate from this record must be flagged to the team and this document must be updated before the deviating code is merged.

---

## ADR-001 — Frontend Framework and Language

**Context:** A responsive, mobile-first web UI is required for employee-facing booking flows, charger dashboards, admin screens, reporting, and an AI insights panel. The team needs fast setup, good component tooling, and type-safe API consumption within a 16-hour window.

**Chosen option:** React 18 with Vite, TypeScript, and Tailwind CSS.

**Alternatives considered:**
1. Vue 3 + Vite — comparable setup speed; smaller ecosystem; team less familiar.
2. Angular 17 — stronger typing and DI out of the box; significantly longer project scaffolding and steeper learning curve under time pressure.
3. Plain HTML + vanilla JS — zero framework overhead; unworkable for the number of role-driven interactive screens required.

**Reason for decision:** React is the most widely known framework in the team's skill set. Vite provides sub-second HMR during development. TypeScript enforces API contract field names at compile time, catching integration bugs before the demo. Tailwind CSS provides utility-first responsive layout with minimal custom CSS and strong mobile-first support.

**Trade-offs:**
- React's component mental model and hook lifecycle carry a learning overhead that Vue or Svelte partly avoid.
- Tailwind class verbosity increases JSX noise.
- TypeScript adds compilation step and type-annotation overhead.

**Risks:**
- Risk: TypeScript type errors block compilation close to demo. Mitigation: use `// @ts-ignore` sparingly on non-critical UI details; do not block P0 flow for type perfection.
- Risk: Vite config/proxy issues with CORS on the demo machine. Mitigation: confirm `vite.config.ts` proxy settings against the backend port at project start.

---

## ADR-002 — Backend Framework and Language

**Context:** The backend must expose a REST API, enforce complex booking business rules, integrate with an external CSMS REST API, run background sync jobs, issue JWTs, and interact with PostgreSQL — all within the hackathon timeline.

**Chosen option:** ASP.NET Core Web API (.NET 8, C#) using controller-based routing.

**Alternatives considered:**
1. Node.js + Express/Fastify (TypeScript) — matches the frontend language; lighter setup; smaller standard library for things like DI, auth middleware, and background jobs.
2. Python + FastAPI — rapid prototyping; async-native; weak enterprise DI and limited typed ORM support compared to EF Core.
3. ASP.NET Core Minimal APIs — less boilerplate; harder to apply attribute-based RBAC cleanly across many endpoints under time pressure.

**Reason for decision:** ASP.NET Core is the team's confirmed baseline (CLAUDE.md). Controllers provide clear route grouping and per-action `[Authorize(Roles=...)]` attributes, which are directly readable for RBAC audit. The .NET DI container, `BackgroundService`, `IHttpClientFactory`, and FluentValidation integrate without additional ceremony. C# strong typing enforces DTO/entity boundaries at compile time.

**Trade-offs:**
- .NET SDK install required on the demo machine; version mismatch can break the run. Mitigation: `global.json` pins SDK to .NET 8; verify `dotnet --version` on arrival.
- Controller-based routing is more verbose than Minimal APIs for simple endpoints.

**Risks:**
- Risk: EF Core migration fails on the demo machine due to a schema mismatch. Mitigation: run `dotnet ef database update` during development and keep a `pg_dump` backup of the seeded database ready.
- Risk: `BackgroundService` polling loop throws an unhandled exception and silently stops. Mitigation: wrap the entire loop body in `try/catch (Exception ex) { _logger.LogError(ex, ...); }` in every service — exceptions must not propagate past the loop boundary.

---

## ADR-003 — Database and ORM

**Context:** The application requires strong referential integrity for the booking state machine (no overlapping bookings, daily cap enforcement, cascade revocation), JSONB storage for notification payloads (email and Teams Adaptive Card JSON), and reliable schema migrations that can be applied on a demo machine without surprises.

**Chosen option:** PostgreSQL 16 (Docker) with Entity Framework Core 8 using the Npgsql provider. Snake-case naming convention via `EFCore.NamingConventions` NuGet.

**Alternatives considered:**
1. SQLite — zero infrastructure; but lacks JSONB, concurrent write safety, and is not representative of a production-grade platform.
2. MongoDB — flexible schema for notification payloads; but loses relational integrity for the booking/session state machine; EF Core support is weaker.
3. SQL Server — same .NET integration story as PostgreSQL + EF Core; requires a licensed install or Azure SQL; no functional advantage over PostgreSQL for this use case.

**Reason for decision:** PostgreSQL is the confirmed baseline (CLAUDE.md). Relational integrity enforces the booking overlap and daily-cap constraints at the database layer. JSONB (`HasColumnType("jsonb")`) stores email and Teams Adaptive Card payloads in a queryable form without a separate table. EF Core code-first migrations let the backend developer evolve the schema without raw SQL. Npgsql has first-class PostgreSQL 16 support, including `timestamptz` via `UseTimestamptz()`.

**Trade-offs:**
- PostgreSQL requires Docker or a local install on the demo machine; pure in-process databases (SQLite) would be simpler to distribute.
- EF Core migration generation adds a step between schema design and database state.
- Npgsql `timestamptz`/`DateTimeOffset` handling requires explicit configuration to avoid timezone bugs.

**Risks:**
- Risk: Npgsql `sslmode` misconfiguration on the demo machine causes connection failure. Mitigation: set `sslmode=disable` in the local connection string; test the exact `ConnectionStrings__DefaultConnection` format before demo day.
- Risk: EF Core migration has a pending change not reflected in the database at demo time. Mitigation: `app.ApplyMigrations()` on startup auto-applies pending migrations in the development environment.

---

## ADR-004 — Backend Project Structure (Single-Project Monolith)

**Context:** The team has 16 hours. The platform spans ~12 resource domains (auth, bookings, sessions, chargers, notifications, reporting, AI, audit, maintenance, config, privacy, eligible users). A layered architecture decision was needed.

**Chosen option:** Single ASP.NET Core project (`src/Api/`) with internal folder separation: `Controllers/`, `Services/`, `Data/`, `DTOs/`, `Validators/`, `BackgroundServices/`, `Middleware/`.

**Alternatives considered:**
1. Clean Architecture with four separate projects (`Domain`, `Application`, `Infrastructure`, `Api`) — standard enterprise pattern; correct long-term shape; project-to-project reference wiring costs 1-2 hours under time pressure.
2. Vertical slice architecture — one folder per feature; good for team parallelism; steeper initial setup; harder to reason about in a single-developer-per-domain hackathon.
3. Microservices — explicitly excluded (CLAUDE.md rule); deployment complexity is incompatible with the 16-hour demo window.

**Reason for decision:** A single project with internal folder separation delivers logical separation with zero project-reference overhead. The folder structure can be split into proper layered projects in the next iteration without changing any business logic. This is the correct trade-off for a 16-hour delivery.

**Trade-offs:**
- Business logic in `Services/` lives in the same project as the API surface, making accidental coupling easier.
- No project-boundary enforcement; a controller could import a `Data/` entity directly without a DTO.

**Risks:**
- Risk: Team member accidentally bypasses the DTO layer and returns EF Core entities from controllers, leaking password hashes or internal IDs. Mitigation: code review checklist; explicit rule in CLAUDE.md that DTOs must be separate from entities.

---

## ADR-005 — Real-Time Dashboard Update Strategy

**Context:** The charger availability dashboard must update in near-real-time so demo observers can see charger status change from `Available` to `Reserved` to `Charging` as a booking is made and a simulator session starts. The provided CSMS does not push events to the custom application.

**Chosen option:** HTTP polling from the frontend at a 5-second interval (`GET /api/v1/chargers`). The backend serves from the local `chargers` table, which is kept current by the `StationSyncService` background job that polls the CSMS every 5 seconds. No additional infrastructure is introduced.

**Alternatives considered:**
1. SignalR (WebSocket hub) — push from backend to all connected frontend clients the moment the background job detects a CSMS state change; cleanest UX; adds ~1 hour of infrastructure setup and hub coordination.
2. Server-Sent Events (SSE) — push from backend; simpler than SignalR; no first-class ASP.NET Core primitive; requires custom middleware.
3. Long-polling — compatible with any HTTP client; more complex backpressure handling; no advantage over short polling at hackathon scale.

**Reason for decision:** HTTP polling at 5-second intervals is imperceptible to demo observers and jury members. At hackathon scale (8 chargers, fewer than 10 concurrent browser sessions), the polling load is negligible. Zero additional infrastructure is required. SignalR is noted as a 1-hour optional upgrade if time allows after P1 is stable.

**Trade-offs:**
- Each polling client makes 12 requests per minute; on a demo machine with 5 browser sessions this is 60 requests/minute — acceptable, but wasteful compared to push.
- Dashboard visible state can lag up to 5 seconds behind the backend, which in turn can lag up to 5 seconds behind the CSMS. Total maximum staleness: ~10 seconds. This is acceptable for the demo.
- `document.visibilityState` pause on tab-blur reduces unnecessary background polling.

**Risks:**
- Risk: Rapid polling causes visible UI flicker when the status badge re-renders. Mitigation: CSS transition on status badge colour change; debounce state updates in the React component.

---

## ADR-006 — Background Jobs (In-Process BackgroundService)

**Context:** Four scheduled operations must run continuously without user interaction: CSMS station sync (every 5s), CSMS session sync (every 5s), no-show detection (every 30s), and reminder scheduling (every 60s).

**Chosen option:** .NET `IHostedService` / `BackgroundService` running in-process within the ASP.NET Core application.

**Alternatives considered:**
1. Hangfire — persistent job queue backed by PostgreSQL; dashboards; retries; adds a NuGet dependency and requires a separate schema; approximately 30 minutes of setup overhead.
2. Quartz.NET — cron-based scheduler; richer scheduling API; heavier dependency; overkill for four simple interval loops.
3. Separate worker process / Docker container — true isolation; increases deployment complexity from one `dotnet run` to two processes; breaks the "single command" demo launch.

**Reason for decision:** `BackgroundService` is a first-class .NET 8 primitive with zero dependency overhead. It runs inside the same process, shares the DI container, and requires no additional infrastructure. For 8 chargers on a single demo machine, each sync cycle completes in under 500ms. The "single command" demo launch (`dotnet run`) is preserved.

**Trade-offs:**
- If the main API process crashes, background jobs also stop. Acceptable for a demo; unacceptable in production.
- All background jobs share the server's thread pool. At hackathon load, contention is negligible.
- No persistent job queue means failed background operations are only logged; there is no automatic retry queue.

**Risks:**
- Risk: An unhandled exception in a background loop kills the loop silently. Mitigation: wrap the entire loop body in `try/catch` in every `BackgroundService`; log the exception and continue the loop.

---

## ADR-007 — Authentication Approach

**Context:** The platform requires authentication and RBAC for six distinct roles. The brief states authentication may be simplified for the MVP. Full IdP integration (Azure AD, OAuth/OIDC) is out of scope for the hackathon timeline.

**Chosen option:** Simplified JWT-based authentication with seeded users and BCrypt-hashed passwords. Login via `POST /api/v1/auth/login` issues a 24-hour HS256-signed JWT containing `{ sub, role, displayName }`. All protected routes use `Microsoft.AspNetCore.Authentication.JwtBearer` middleware with `[Authorize(Roles=...)]` attributes. JWT stored in browser `localStorage` on the frontend.

**Alternatives considered:**
1. Azure AD / OIDC — production-grade; integrates with Accenture tenant; requires Azure app registration, redirect URI coordination, and MSAL setup; adds 2-4 hours of configuration risk; authentication may break on demo day due to network/tenant access.
2. Session cookies + ASP.NET Core Identity — more secure than localStorage for the token; requires cookie configuration and anti-CSRF; more setup than a simple JWT for a demo.
3. No authentication (public API) — removes all setup risk; explicitly excluded because RBAC is a functional requirement (BR011) and a jury evaluation criterion.

**Reason for decision:** Simplified JWT is explicitly accepted in the functional requirements (FR-AUTH-001) and the product brief (Section 14 assumption 9: "Authentication may be simplified for the MVP"). `Microsoft.AspNetCore.Authentication.JwtBearer` is trivial to set up and is the production-ready library. Seeded users with BCrypt passwords allow a realistic role-switching demo without any external service.

**Trade-offs:**
- `localStorage` JWT storage is vulnerable to XSS; httpOnly cookies would be safer in production.
- 24-hour expiry means no token refresh is needed for the demo, but tokens cannot be invalidated server-side (no blacklist store).
- All seeded users share the same demo password (`demo1234`); no real identity integration.

**Risks:**
- Risk: `JWT_SECRET` is accidentally hardcoded or committed to the repository. Mitigation: always read from environment variable (`JWT__Secret`); provide `.env.example` with a placeholder; gitignore `appsettings.Development.json`.
- Risk: JWT token expiry during a long demo session. Mitigation: set 24-hour expiry; demo sessions are under 1 hour.

---

## ADR-008 — CSMS Integration Boundary (No Custom OCPP Server)

**Context:** The hackathon provides a NexLevel CSMS/OCPP 1.6J simulator with a REST API. The custom application must integrate with charging infrastructure. The question was: what is the custom application's responsibility at the OCPP boundary?

**Chosen option:** The custom backend consumes the provided NexLevel CSMS exclusively through its REST API via a typed `HttpClient` (`CsmsClient`). No custom OCPP server, no WebSocket OCPP protocol handlers, no raw OCPP message ingestion. The frontend never calls the CSMS directly.

**Alternatives considered:**
1. Build a custom OCPP 1.6J WebSocket server — full control over protocol; would conflict directly with the provided CSMS and is explicitly forbidden by the brief (Section 6.1).
2. Direct frontend CSMS calls — simpler data flow for dashboards; violates the single-backend-boundary principle; exposes CSMS auth credentials in the browser; prevents server-side RBAC on CSMS data.
3. Use the CSMS REST API only for some operations and bypass it for others via direct DB access — not possible; the CSMS database is not accessible to the custom application.

**Reason for decision:** The use-case brief explicitly prohibits a custom OCPP server (Section 6.1). The provided CSMS already handles OCPP 1.6J, simulator connectivity, RFID authorization, meter values, and energy calculation. The custom application's value is the business layer: booking, eligibility, fair-use rules, notifications, reporting, privacy/RBAC, and AI insights. Keeping the integration boundary at the REST API level also means the custom application is OCPP-version-agnostic and will work with any future CSMS that exposes a compatible REST API.

**Trade-offs:**
- All CSMS state updates are pull-based (polling); the application cannot receive push notifications from the CSMS.
- The application's view of charger state can be up to 5 seconds stale (bounded by polling interval).
- If the CSMS REST API is unavailable, all CSMS-dependent features degrade; mitigated by `CSMS_MOCK_MODE=true` fallback.

**Risks:**
- Risk: CSMS `idTag` format for `POST /api/auth/tags` is unknown until demo day (BQ-DM-01). Mitigation: design `CsmsIdTag` derivation as a pluggable method in `BookingService`; confirm format with CSMS provider on arrival.
- Risk: CSMS base URL and auth scheme are not confirmed before coding starts (BQ-DM-02). Mitigation: `CSMS_BASE_URL` and `CSMS_AUTH_HEADER` as environment variables; `CsmsClient` header injection via `DelegatingHandler` accepts any scheme.

---

## ADR-009 — Data Model Design Choices

**Context:** The data model must support a multi-state booking lifecycle, CSMS synchronization tracking, cross-channel notifications, append-only audit logging, privacy acknowledgement versioning, and reporting aggregations — all in one PostgreSQL schema.

**Chosen options (five notable design decisions):**

**9a. No universal soft-delete flag.** Bookings and sessions use explicit terminal states (`Cancelled`, `Released`, `NoShow`, `Completed`, `Overridden`); eligible EV users use `eligibility_status = 'Inactive'`; maintenance blocks use `is_active = false`. Hard deletes are not used on tables that have reporting or audit obligations.

**9b. Denormalized `version` in `privacy_acknowledgements` and `privacy_acknowledgement_status` in `eligible_ev_users`.** The canonical acknowledgement source is the `privacy_acknowledgements` table; the denormalized flag avoids a sub-query join on every booking creation gate check.

**9c. `audit_logs` has no EF Core navigation properties.** Entity IDs are stored as `varchar` strings to prevent cascade-delete complications. Immutability is enforced at two layers: an EF Core `SaveChangesInterceptor` that throws on UPDATE/DELETE of `AuditLog` entities, and a PostgreSQL-level `BEFORE UPDATE OR DELETE` trigger.

**9d. Enums stored as `varchar` strings.** PostgreSQL native enum types are not used, because adding a new enum value to a native PostgreSQL enum requires a migration DDL step that is risky on demo day. `varchar` with a CHECK constraint is migration-safe.

**9e. `notifications` fan-out model.** One trigger event inserts three rows (InApp + Email + Teams) sharing a `correlation_id` ULID. This is simpler than a join table and keeps the admin audit cross-channel grouping query to a single `GROUP BY correlation_id`.

**Alternatives considered:**
- Universal `is_deleted` flag — adds complexity to every query; hides data rather than expressing lifecycle state; rejected for simplicity and demo-query clarity.
- Native PostgreSQL enums — safer constraint; rejected because ALTER TYPE requires a migration DDL step that could fail on demo day.
- Single notification row with multiple delivery-status columns — less flexible for adding channels; harder to query per-channel delivery metrics.

**Reason for decision:** The chosen patterns minimize query complexity for the demo's critical paths (booking validation, fair-use daily cap, notification fan-out) while preserving full audit traceability.

**Trade-offs:**
- Denormalized `privacy_acknowledgement_status` can drift from the `privacy_acknowledgements` table if a bug prevents the update on acknowledgement insert. The canonical source (`privacy_acknowledgements` row) should always be used for audit; the denormalized flag is a performance cache only.
- Three notification rows per event increases the `notifications` table size; at demo scale (a few hundred notifications) this is negligible.

**Risks:**
- Risk: Booking `vehicle_make` / `vehicle_model` are required (NOT NULL) but the eligible EV user's vehicle fields are nullable. If the EV user has no vehicle on record, the booking form cannot pre-fill and must prompt the user. Flag to product owner (BQ-DM-03).
- Risk: `csms_id_tag` derivation format may not match what the CSMS expects (BQ-DM-01). Mitigated by keeping the derivation logic in a single method in `BookingService`.

---

## ADR-010 — API Style and Conventions

**Context:** The API must be consumed by a React frontend, be testable by a QA engineer, and be self-describing enough for the backend and frontend developers to work in parallel from a single source-of-truth contract document.

**Chosen option:** REST over HTTP with JSON bodies. All routes under `/api/v1/`. Resource-oriented plural-noun URLs. State transitions as `PUT /resource/{id}/{action}` (e.g. `PUT /bookings/{id}/cancel`). camelCase JSON field names. ISO 8601 UTC timestamps. UUIDs as strings. Enums as PascalCase strings. Single error response shape across all error codes. Offset-based pagination (`page` + `limit`). 36 endpoints total across 12 resources.

**Alternatives considered:**
1. GraphQL — single endpoint; flexible field selection; eliminates over-fetching; significantly higher setup complexity; requires schema SDL, resolvers, and N+1 protection; incompatible with the hackathon timeline.
2. REST with numeric enums — marginally more compact on the wire; opaque to humans reading logs or test output; rejected in favour of PascalCase string enums.
3. Cursor-based pagination — production-correct for large datasets; unnecessary complexity for datasets capped at a few hundred bookings; deferred post-hackathon.

**Reason for decision:** REST is the simplest, most widely understood API style for a team working in parallel. The `api-conventions.md` document defines every field name, status code, and error shape, making the contract a single source of truth that eliminates integration surprises. The 36-endpoint budget prevents over-building.

**Trade-offs:**
- `PUT /bookings/{id}/cancel` includes a verb in the path (a REST purist would use `PATCH` with a state field); this is a pragmatic choice — the intent is unambiguous and the implementation is simpler.
- Offset pagination degrades for very large datasets; acceptable at hackathon scale.
- No rate limiting for the MVP; could allow a demo machine to be overwhelmed by polling clients if more than intended (mitigated by 5-second polling interval and max 10 demo observers).

**Risks:**
- Risk: Frontend developer renames API fields for UI convenience, causing integration failures. Mitigation: CLAUDE.md rule ("use exact field names from `docs/api-conventions.md`") and code review.
- Risk: Backend developer returns EF Core entities directly instead of DTOs, leaking internal fields. Mitigation: explicit DTO layer under `src/Api/DTOs/`; code review.

---

## ADR-011 — Notification Delivery Strategy

**Context:** The platform must deliver booking lifecycle reminders across three channels: in-app, email, and Microsoft Teams Adaptive Cards. The MVP must be demoable even if live email or Teams delivery is not fully configured.

**Chosen option:**
- **In-app (P0 — required):** Every trigger event inserts a `notifications` row with `channel=InApp`; the frontend polls `GET /api/v1/notifications` on load and tab focus.
- **Email (P1 — payload preview fallback):** `NotificationService` builds an email payload `{ to, subject, htmlBody, textBody }`; if `SMTP_HOST` is configured, MailKit + MailHog sends live; if not, the payload JSON is stored in `notifications.payload` and displayed as a readable preview in the admin notification audit view.
- **Teams Adaptive Card (P1 — payload preview fallback):** `NotificationService` builds a valid Adaptive Card JSON; if `TEAMS_WEBHOOK_URL` is configured, it is posted via Incoming Webhook; if not, the JSON is stored in `notifications.payload` and rendered as a visual preview in the admin view.
- Nine template methods in `NotificationTemplateService.cs` cover the full reminder lifecycle.

**Alternatives considered:**
1. SendGrid / AWS SES for email — production-grade; requires account credentials; no fallback if credentials unavailable; rejected in favour of MailKit + MailHog (zero cloud dependency).
2. Microsoft Graph API for Teams — full programmatic control; requires Azure tenant permissions and app registration; too much setup risk for P1; Incoming Webhook is sufficient.
3. In-app only — simplest; fails the `BR008`/`BR009` email and Teams requirements; jury would not see multi-channel notification demo.

**Reason for decision:** The payload preview fallback is the key design choice: it keeps the demo credible even if the live SMTP or Teams webhook is unavailable. The admin notification audit view can render the email and Adaptive Card payloads as realistic previews, satisfying the jury evaluation criterion without a live delivery dependency.

**Trade-offs:**
- Three rows per notification event increases notification table size; negligible at demo scale.
- `DeliveryStatus = Previewed` distinguishes simulated delivery from real delivery; the admin view must make this distinction visible.
- MailHog is a development tool only; production would require a transactional email provider.

**Risks:**
- Risk: Adaptive Card JSON schema is invalid for the demo (Teams rejects or renders incorrectly). Mitigation: validate generated JSON against the Adaptive Card schema in a unit test before demo; use a known-good parameterized template.

---

## ADR-012 — AI Integration Approach

**Context:** The platform's P2 requirement is a responsible AI insights panel: natural-language summaries, demand forecasting, pattern detection, anomaly flagging, and operational recommendations — all grounded in actual system data.

**Chosen option:** Azure OpenAI GPT-4o via the `Azure.AI.OpenAI` NuGet SDK. The `GET /api/v1/ai/insights` endpoint queries `ReportingService` internally to assemble a grounding context (session count, total kWh, peak hour, no-show rate, average duration), constructs a structured prompt injecting metric values as JSON, and instructs the LLM to return a structured JSON response with `nlSummary`, `demandForecast`, `patterns`, `anomalies`, `recommendations`, `grounding`, `confidence`, and `simulatedDataLabel` fields. Server-side validation rejects any LLM output that contains a numeric not present in the `grounding` block. A static fallback summary is returned if Azure OpenAI is unreachable or fails grounding validation.

**Alternatives considered:**
1. Claude API (Anthropic) — strong reasoning; not listed as an authorized Accenture tool for automated API use in this context; Azure OpenAI is explicitly authorized.
2. Gemini API — authorized; strong multimodal; no first-class .NET NuGet SDK; more setup overhead.
3. No AI integration — eliminates P2 risk; fails the jury evaluation criterion for responsible AI; weakens the hackathon story.
4. Pre-canned static insights — zero latency, zero dependency; fails the "grounded in system data" requirement (FR-AI-010); would be visible as fabricated during jury Q&A.

**Reason for decision:** Azure OpenAI is the authorized Accenture tool with the strongest .NET SDK support (`Azure.AI.OpenAI` NuGet). Grounding the prompt in `ReportingService` metrics and validating the output server-side satisfies the responsible AI rules: no fabricated metrics, confidence levels disclosed, simulated data labelled.

**Trade-offs:**
- Azure OpenAI API latency (2-8 seconds); the frontend must show a loading spinner and handle `503` gracefully.
- Credits can be exhausted; the static fallback summary must be prepared before the demo.
- AI layer is P2 — it is only built after P0 and P1 are stable (starting hour 14); any AI failure cannot break the P0/P1 demo flow.

**Risks:**
- Risk: Azure OpenAI credits exhausted or endpoint unavailable during demo. Mitigation: pre-generate one set of insight results as a static JSON fixture; `AiInsightService` returns it when the API call fails.
- Risk: LLM generates a fabricated numeric not in `grounding`. Mitigation: server-side grounding validation rejects the response and returns the static fallback with an `AiUnavailable` 503.

---

## ADR-013 — Deployment and Demo Runtime

**Context:** The demo must run on a single developer laptop visible via projector. The team does not have cloud infrastructure provisioned for the hackathon. The demo must be startable with minimal commands and must not depend on external services beyond the provided CSMS.

**Chosen option:**
- PostgreSQL 16 in Docker: `docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16`
- Backend: `dotnet run` (Kestrel on port 5000); or `dotnet watch run` during development
- Frontend: `npm run dev` (Vite on port 5173)
- EF Core migrations applied on startup via `app.ApplyMigrations()` or `dotnet ef database update`
- Seed data applied via `DataSeeder.SeedAsync()` under `if (app.Environment.IsDevelopment())`
- Provided CSMS on its own port via `CSMS_BASE_URL` environment variable
- Fallback: `CSMS_MOCK_MODE=true` environment flag bypasses live CSMS calls and returns fixture data if the simulator is unavailable

**Alternatives considered:**
1. Azure App Service / Azure Container Apps — production-grade hosting; requires provisioning time, credentials, and network access during the hackathon; adds demo failure risk from cloud dependency.
2. Docker Compose for all services — portable; adds a `docker-compose.yml` for the backend and frontend; reasonable choice but `dotnet run` hot-reload is easier during rapid development.
3. Single-binary self-contained .NET publish — `dotnet publish -c Release`; useful for the final demo package; noted as an option in `solution-architecture.md` but not the primary development flow.

**Reason for decision:** Local `dotnet run` + `npm run dev` is the fastest development cycle and the most resilient demo setup. A Docker container for PostgreSQL avoids any local PostgreSQL version conflict. Keeping the CSMS integration optional via `CSMS_MOCK_MODE` gives the team a safety net if the CSMS is not ready on demo day.

**Trade-offs:**
- Demo depends on Docker being installed and running on the demo machine. Mitigation: verify Docker and .NET SDK before the demo window; document in the demo-prep checklist.
- Two terminal windows (backend + frontend) must remain open during the demo. Mitigation: `docker-compose.yml` can wrap both if needed; demo presenter rehearses the startup sequence.

**Risks:**
- Risk: .NET SDK version mismatch on the demo machine. Mitigation: `global.json` pins to .NET 8; verify `dotnet --version` on arrival; install SDK as first action on demo day.
- Risk: PostgreSQL Docker container not started before the backend. Mitigation: `docker-compose.yml` includes a health-check dependency; document the startup order in `README`.

---

## ADR-014 — MVP Scope Prioritisation (P0/P1/P2 and Code Freeze)

**Context:** 16 hours is not enough to build everything. The team needed a clear, shared understanding of what must work for the demo, what is valuable but deferrable, and what is a stretch goal.

**Chosen option:**
- **P0 (Must — complete by hour 8):** Login + JWT auth, privacy acknowledgement, eligible EV user management (read-only gate), charger availability dashboard with polling, booking creation with fair-use validation (1h daily cap, overlap check, eligibility gate, privacy gate), booking cancel/release, CSMS authorization + revocation flow, in-app notifications, seed data for all entities.
- **P1 (Should — complete by hour 13):** Notifications (email payload preview + Teams Adaptive Card preview), admin screens (eligible user CRUD, maintenance blocks, system config, audit log viewer), reporting and sustainability dashboard (5 endpoints), background services (no-show checker, reminder scheduler).
- **P2 (Could — hour 14+):** AI insights panel (Azure OpenAI integration, grounding validation, static fallback).
- **Code freeze at hour 15.** No new features after hour 15; bug fixes and demo polish only, authorized by the scrum master.

**Alternatives considered:**
1. Feature-first (build every screen before any backend works) — commonly attempted; demo fails because no real data flows.
2. Backend-first (complete all APIs before any UI) — reduces integration risk; no demo-able UI if time runs out.
3. No prioritisation (build everything in parallel) — increases integration bug risk; harder to triage when something breaks.

**Reason for decision:** The P0/P1/P2 model ensures the core demo spine (booking a charger, seeing it change status, receiving a notification) works by the halfway point. P1 adds the operational and management value that differentiates the platform from a simple booking app. P2 adds the AI layer that completes the jury positioning. The hour-15 code freeze prevents last-minute instability from ruining the demo.

**Trade-offs:**
- P1 features (email/Teams, admin CRUD, full reporting) could be the most impressive for the jury; they are deliberately de-risked to after hour 8.
- Code freeze means a discovered bug after hour 15 requires scrum master approval to fix, which may not happen.

**Risks:**
- Risk: P0 is not complete by hour 8, leaving no time for P1 or P2. Mitigation: scrum master tracks progress against the P0 story list at hour 6; if behind, cut notification fan-out from P0 (in-app only) and defer email/Teams to P2.
- Risk: CSMS integration blocks P0 completion if the CSMS is unavailable during development. Mitigation: `CSMS_MOCK_MODE=true` allows P0 booking flow to be built and tested without a live CSMS.

---

*All decisions recorded here are accepted and binding for the hackathon MVP. Any team member proposing a deviation must raise it explicitly, update this document with the rationale, and notify the backend developer, frontend developer, and scrum master before deviating code is written.*

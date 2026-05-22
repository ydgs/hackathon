# API Contract — AI-Powered EV Charging Orchestration Platform

**Status:** Authoritative for hackathon MVP
**Date:** 2026-05-22
**Author:** Solution Architect Agent
**Sources:** [functional-requirements.md](./functional-requirements.md), [user-journeys.md](./user-journeys.md), [solution-architecture.md](./solution-architecture.md), [data-model.md](./data-model.md), [skills/api-contract-generator/SKILL.md](../skills/api-contract-generator/SKILL.md)
**Scope:** Every endpoint exposed by the custom ASP.NET Core Web API consumed by the React frontend. The frontend never calls the provided NexLevel CSMS directly — all CSMS interactions are encapsulated in the backend.

---

## 1. API Design Principles

1. **REST over HTTPS with JSON bodies.** All endpoints accept and return `application/json` unless noted (no multipart, no XML).
2. **Single backend boundary.** The React app calls only `http://<host>:5000/api/v1/...`. The CSMS REST API is consumed exclusively by the backend through `CsmsClient`. Frontend developers MUST NOT call CSMS endpoints directly.
3. **Versioned base path.** Every route is prefixed with `/api/v1/`. A future v2 will live under `/api/v2/` without breaking v1.
4. **Resource-oriented URLs.** Plural nouns for collections (`/bookings`, not `/booking`, not `/createBooking`). Verbs in HTTP methods, not in paths. State transitions for a resource are modelled as `PUT /resource/{id}/{action}` (e.g. `PUT /bookings/{id}/cancel`) — this is permitted because the action operates on a single state field cleanly. Maximum nesting depth: one level.
5. **camelCase JSON.** All request and response field names are camelCase (`startTime`, `csmsSyncStatus`, `vehicleMake`). The backend uses EF Core PascalCase entities internally but ASP.NET Core's default JSON serializer (`System.Text.Json` with `JsonNamingPolicy.CamelCase`) handles the boundary.
6. **ISO 8601 timestamps in UTC.** All `dateTime` fields are emitted as `"2026-05-22T08:15:00Z"`. The frontend converts to UTC+4 (Mauritius) for display via `toLocaleString()`.
7. **UUIDs as strings.** All `id` fields are UUID v4 serialized as strings (`"3fa85f64-5717-4562-b3fc-2c963f66afa6"`). The own identifier is always `id`; foreign references use `{resourceName}Id` (`userId`, `chargerId`, `bookingId`).
8. **Enums as PascalCase strings.** Booking states, session states, charger statuses, roles, channels — all transmitted as strings matching the C# enum member names (`"Confirmed"`, `"BlockedForMaintenance"`, `"StandardUser"`). Numeric enums are forbidden across the wire.
9. **Single response shape per kind.**
   - Single-item responses: return the object directly (no envelope).
   - List responses: always `{ "data": [...], "pagination": {...} }` — never a bare array.
   - Mutation actions returning the updated resource use the single-item shape.
10. **Predictable status codes.** Only `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `500`, `503` are emitted by this API. See §7 for the full mapping.
11. **Server-side validation is authoritative.** The frontend SHOULD validate for UX, but the backend MUST re-validate every request. RBAC, fair-use, eligibility, privacy, and CSMS sync rules are enforced server-side only.
12. **Idempotency where it matters.** `PUT` actions for state transitions (cancel, release, override) are idempotent: repeating the same action on a terminal state returns `409 Conflict` rather than mutating again.
13. **Hackathon discipline.** No endpoint exists unless a P0/P1/P2 story needs it. No over-fetching: each list endpoint accepts the smallest useful filter set. Total endpoint count is held under 40 across 11 resources.

---

## 2. Base URL, Versioning, and Conventions

| Item | Value |
|---|---|
| Base URL (local demo) | `http://localhost:5000/api/v1` |
| Frontend dev origin | `http://localhost:5173` (CORS-allowed exactly) |
| Content type | `application/json; charset=utf-8` |
| Auth header | `Authorization: Bearer <jwt>` |
| Timezone | All `dateTime` values UTC, ISO 8601 with `Z` suffix |
| ID format | UUID v4 string |
| Boolean filters | `?active=true` / `?active=false` (never `1`/`0`) |
| Field casing | camelCase in JSON, snake_case in DB, PascalCase in C# entities |
| Max page size | 100 (default 20) |
| Max request body | 1 MB |
| Rate limit | None for MVP (see Open Question Q18 in functional-requirements.md) |

---

## 3. Authentication Assumptions

- **Auth scheme:** Bearer JWT signed with HS256, issued by `POST /auth/login`, validated by `Microsoft.AspNetCore.Authentication.JwtBearer` middleware.
- **Token payload:** `{ sub: <userId>, role: <UserRole>, displayName: <string>, exp: <unixSec> }`. Expiry is 24 hours from issue.
- **Token storage (frontend):** `localStorage` for the hackathon (acceptable per FR-AUTH-001 simplified flow); production would use an httpOnly cookie.
- **Required header for protected routes:** `Authorization: Bearer <token>`. Missing or malformed token → `401 Unauthorized`. Expired or signature-invalid token → `401 Unauthorized`.
- **Public endpoints (no auth required):** `POST /auth/login`, `GET /privacy-notice` (the current notice text must be readable on the login screen).
- **All other endpoints require authentication.** Role-based authorization is layered on top of authentication — an authenticated user lacking the required role gets `403 Forbidden`, never `401`.
- **Eligibility & privacy gates** (FR-AUTH-006) apply specifically to booking creation and any endpoint that triggers a CSMS authorization. They are evaluated AFTER role check passes and return `403 Forbidden` with a machine-readable reason code (`NotEligible` or `PrivacyNotAcknowledged`).
- **Logout** is a client-side token discard with a server-side audit log entry; no token-blacklist store is implemented for the MVP.

### Role enum

`"StandardUser" | "Security" | "Workplace" | "Admin" | "ReportingESGViewer" | "Management"`

---

## 4. Pagination Rules

### Where pagination applies
All list endpoints that can return more than 50 rows in normal operation:
- `GET /bookings`
- `GET /sessions`
- `GET /notifications`
- `GET /notifications/audit`
- `GET /audit-logs`
- `GET /eligible-users`

### Where pagination does NOT apply
Small enumerable collections (returned all-at-once, with a documented max count):
- `GET /chargers` — max 50 chargers system-wide (hackathon: 8). No pagination.
- `GET /reports/*` — aggregates, not lists.
- `GET /ai/insights` — single composite object.
- `GET /config` — key/value map, ~10 keys.

### Pagination contract
```json
{
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 137,
    "totalPages": 7
  }
}
```

| Query param | Type | Default | Constraints |
|---|---|---|---|
| `page` | integer | `1` | `>= 1`. Out-of-range → empty `data`, correct `total`. |
| `limit` | integer | `20` | `1..100`. Above 100 → clamped to 100. |

Page/limit are validated server-side. Invalid values (non-numeric, negative) → `400 Validation Error`.

### Why offset, not cursor
Hackathon scope. Offset pagination is sufficient for a dataset capped at a few hundred bookings and a few thousand notifications. Cursor pagination is deferred.

---

## 5. Filtering Rules

### Convention
- Query parameters in camelCase: `?status=Confirmed&locationId=...`
- Unknown query parameters are ignored (not errors), to keep the contract forward-compatible.
- Boolean filters use explicit `true`/`false` strings.
- Multi-value filters: comma-separated (`?state=Confirmed,Active`). No repeated keys (no `?state=A&state=B`).
- Date-range filters: always two params named `dateFrom` and `dateTo`, ISO 8601 UTC. Inclusive of `dateFrom`, exclusive of `dateTo` (closed-open interval — matches BR-002 booking interval semantics).
- ID filters use the foreign-key name (`?chargerId=...`, `?userId=...`).
- Free-text search uses `?search=` (case-insensitive substring match on the resource's primary display field).

### Validated filters per list endpoint
See each endpoint spec below for its allowed filter set. Anything not listed is ignored.

---

## 6. Sorting Rules

### Convention
- Two query params: `sortBy` (camelCase field name) and `sortOrder` (`asc` or `desc`).
- One sort field at a time. Multi-field sort is out of scope for the MVP.
- Each list endpoint declares its allowed `sortBy` values and the default sort.
- Invalid `sortBy` → `400 Validation Error` with `{ field: "sortBy", message: "Allowed values: ..." }`.
- `sortOrder` defaults to `desc` for time-based fields (most-recent-first), `asc` for name-based fields.

### Defaults
| Endpoint | Default sortBy | Default sortOrder |
|---|---|---|
| `GET /bookings` | `startTime` | `desc` |
| `GET /sessions` | `startTime` | `desc` |
| `GET /notifications` | `timestamp` | `desc` |
| `GET /notifications/audit` | `timestamp` | `desc` |
| `GET /audit-logs` | `timestamp` | `desc` |
| `GET /eligible-users` | `displayName` | `asc` |

---

## 7. Error Response Shape

All errors share the same JSON envelope. The frontend handles errors by status code first, then by `errors[].code` for machine-decisioned UI behaviour.

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "endTime",
      "code": "DurationExceeded",
      "message": "Maximum booking duration is 1 hour per day."
    }
  ],
  "traceId": "00-aa11bb22cc33dd44-ee55ff6677889900-01"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `message` | string | yes | Human-readable summary suitable for a banner |
| `errors[]` | array | yes (may be empty for 5xx) | Field- or rule-level errors |
| `errors[].field` | string | no | camelCase field name; omitted for non-field errors |
| `errors[].code` | string | yes | Machine-readable code (PascalCase) |
| `errors[].message` | string | yes | Human-readable detail |
| `traceId` | string | yes | W3C trace ID for correlation with backend logs |

### Status code mapping

| Status | When |
|---|---|
| `200 OK` | Successful GET, PUT, PATCH returning a body |
| `201 Created` | Successful POST that created a resource — `Location` header set |
| `204 No Content` | Successful DELETE or mutation that returns no body |
| `400 Bad Request` | Malformed JSON, type mismatch, missing required field, invalid enum value, invalid `sortBy` |
| `401 Unauthorized` | Missing / invalid / expired JWT |
| `403 Forbidden` | Role lacks permission; eligibility gate failed; privacy gate failed; override without reason |
| `404 Not Found` | Resource ID does not exist or is not visible to the caller |
| `409 Conflict` | Booking overlap, user already has active booking, state transition not allowed on current state, daily-cap exceeded, maintenance block conflict |
| `422 Unprocessable Entity` | Reserved for future use — semantically valid input that fails a downstream business rule too complex for 409. Not used in the MVP. |
| `500 Internal Server Error` | Uncaught exception. The middleware logs it and returns a generic message — no stack traces. |
| `503 Service Unavailable` | CSMS unreachable on a critical path; Azure OpenAI unreachable for `GET /ai/insights` |

### Common error codes (PascalCase)

`Unauthenticated`, `Forbidden`, `NotEligible`, `PrivacyNotAcknowledged`, `ValidationFailed`, `RequiredFieldMissing`, `InvalidEnumValue`, `InvalidDateFormat`, `DurationExceeded`, `DailyCapExceeded`, `OverlappingBooking`, `AlreadyHasActiveBooking`, `ChargerUnavailable`, `MaintenanceBlockConflict`, `InvalidStateTransition`, `ReasonRequired`, `CsmsUnavailable`, `CsmsAuthorizationFailed`, `NotFound`, `Conflict`, `ServerError`, `AiUnavailable`.

---

## 8. Endpoint List

All routes are prefixed with `/api/v1`. The table is the single source of truth for the implementation backlog.

| # | Method | Path | Auth | Role(s) | Story |
|---|---|---|---|---|---|
| 1 | POST | `/auth/login` | No | — | US-AUTH-001 |
| 2 | POST | `/auth/logout` | Yes | Any | US-AUTH-001 |
| 3 | GET | `/auth/me` | Yes | Any | US-AUTH-001 |
| 4 | GET | `/privacy-notice` | No | — | US-PRIV-001 |
| 5 | POST | `/privacy-notice/acknowledge` | Yes | Any | US-PRIV-002 |
| 6 | GET | `/eligible-users` | Yes | Admin, Security, Workplace | US-USER-001 |
| 7 | GET | `/eligible-users/{id}` | Yes | Admin, Security, Workplace, Self | US-USER-001 |
| 8 | POST | `/eligible-users` | Yes | Admin | US-USER-002 |
| 9 | PUT | `/eligible-users/{id}` | Yes | Admin (full); StandardUser (own vehicle only) | US-USER-002, US-USER-003 |
| 10 | DELETE | `/eligible-users/{id}` | Yes | Admin | US-USER-002 |
| 11 | GET | `/chargers` | Yes | Any | US-DASH-001 |
| 12 | GET | `/chargers/{id}` | Yes | Any | US-DASH-001 |
| 13 | PUT | `/chargers/{id}/status` | Yes | Admin, Security, Workplace | US-DASH-002 |
| 14 | GET | `/bookings` | Yes | Any (filtered by role) | US-BOOK-001, US-BOOK-005 |
| 15 | POST | `/bookings` | Yes | StandardUser, Workplace (on behalf), Admin (override) | US-BOOK-002 |
| 16 | GET | `/bookings/{id}` | Yes | Any with access | US-BOOK-001 |
| 17 | PUT | `/bookings/{id}/cancel` | Yes | Owner, Admin | US-BOOK-003 |
| 18 | PUT | `/bookings/{id}/release` | Yes | Owner, Security, Workplace, Admin | US-BOOK-004 |
| 19 | PUT | `/bookings/{id}/override` | Yes | Security, Workplace, Admin | US-BOOK-006 |
| 20 | GET | `/sessions` | Yes | Admin, Workplace, Security, ReportingESGViewer | US-SESS-001 |
| 21 | GET | `/sessions/{id}` | Yes | Admin, Workplace, Security, Owner | US-SESS-001 |
| 22 | GET | `/notifications` | Yes | Any (own) | US-REM-001 |
| 23 | GET | `/notifications/unread-count` | Yes | Any (own) | US-REM-001 |
| 24 | PUT | `/notifications/{id}/read` | Yes | Owner | US-REM-002 |
| 25 | GET | `/notifications/audit` | Yes | Admin, Security, Workplace | US-REM-003 |
| 26 | GET | `/reports/summary` | Yes | Admin, Workplace, ReportingESGViewer, Management | US-REP-001 |
| 27 | GET | `/reports/sessions` | Yes | Admin, Workplace, ReportingESGViewer | US-REP-002 |
| 28 | GET | `/reports/energy` | Yes | Admin, Workplace, ReportingESGViewer | US-REP-003 |
| 29 | GET | `/reports/utilization` | Yes | Admin, Workplace | US-REP-004 |
| 30 | GET | `/reports/sustainability` | Yes | Admin, ReportingESGViewer, Management | US-REP-005 |
| 31 | GET | `/ai/insights` | Yes | Admin, ReportingESGViewer, Management | US-AI-001 |
| 32 | GET | `/audit-logs` | Yes | Admin (all), Security/Workplace (operational scope) | US-AUDIT-001 |
| 33 | POST | `/maintenance-blocks` | Yes | Admin | US-ADMIN-001 |
| 34 | DELETE | `/maintenance-blocks/{id}` | Yes | Admin | US-ADMIN-002 |
| 35 | GET | `/config` | Yes | Admin | US-CONFIG-001 |
| 36 | PUT | `/config` | Yes | Admin | US-CONFIG-002 |

---

## 9. Endpoint Specifications

### 9.1 Auth

#### 9.1.1 `POST /auth/login`

**Purpose:** Authenticate a seeded user and issue a JWT.
**Auth:** Not required.

**Request body**
```json
{
  "email": "alice.standard@nexlevel.local",
  "password": "demo-password"
}
```
- `email` — string, required, RFC-5322 format.
- `password` — string, required, 8..100 chars.

**Success — `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-05-23T08:00:00Z",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "alice.standard@nexlevel.local",
    "displayName": "Alice Standard",
    "role": "StandardUser"
  }
}
```

**Errors**
- `400` invalid email format or missing field.
- `401` `{ code: "Unauthenticated", message: "Invalid email or password." }` — never reveal which one was wrong.

**Frontend behaviour:** On success, persist `token` and `user` to `localStorage`/context, route to dashboard. On 401, show inline error on the password field.

---

#### 9.1.2 `POST /auth/logout`

**Purpose:** Audit-log a logout event. Token discard is client-side.
**Auth:** Required.

**Request body:** None.

**Success — `204 No Content`**

**Errors:** `401` only.

---

#### 9.1.3 `GET /auth/me`

**Purpose:** Resolve the current user from the JWT — used by the frontend on app boot to repopulate context.
**Auth:** Required.

**Success — `200 OK`**
```json
{
  "id": "3fa85f64-...",
  "email": "alice.standard@nexlevel.local",
  "displayName": "Alice Standard",
  "role": "StandardUser",
  "eligibility": {
    "isEligible": true,
    "eligibilityStatus": "Active",
    "workplaceRegistryEid": "EID-00123",
    "badgeId": "BDG-00123",
    "vehicleMake": "Tesla",
    "vehicleModel": "Model 3",
    "siteContext": "Both"
  },
  "privacy": {
    "hasAcknowledgedCurrentVersion": true,
    "acknowledgedVersion": "v1",
    "acknowledgedAt": "2026-05-22T07:55:00Z"
  }
}
```
- `eligibility` is `null` if the user is not on the registry.
- `privacy.hasAcknowledgedCurrentVersion` drives the booking-flow gate in the UI.

**Errors:** `401`.

---

### 9.2 Privacy

#### 9.2.1 `GET /privacy-notice`

**Purpose:** Return the current published privacy notice text.
**Auth:** Not required (so it can be rendered on the login screen if needed).

**Success — `200 OK`**
```json
{
  "id": "...",
  "version": "v1",
  "effectiveDate": "2026-05-01",
  "content": "## Privacy Notice\n\nWe store ..."
}
```

**Errors:** `500` only.

---

#### 9.2.2 `POST /privacy-notice/acknowledge`

**Purpose:** Record the current user's acknowledgement of the current privacy notice version.
**Auth:** Required (any role).

**Request body**
```json
{
  "version": "v1"
}
```
- `version` — string, required. Must match `IsCurrentVersion=true` row in `privacy_notices`. Sent so the client commits to the version it actually displayed.

**Success — `201 Created`**
```json
{
  "id": "...",
  "userId": "...",
  "version": "v1",
  "acknowledgedAt": "2026-05-22T08:01:33Z"
}
```

**Errors**
- `400` `VersionMismatch` — submitted version is not the current published version.
- `409` `AlreadyAcknowledged` — user already has a row for this `(userId, privacyNoticeId)`.

---

### 9.3 Eligible EV Users

#### 9.3.1 `GET /eligible-users`

**Purpose:** List eligible EV users for admin/operational triage.
**Auth:** Admin, Security, Workplace. Security and Workplace receive read-only data.

**Query params**
| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Substring on `displayName` or `workplaceRegistryEid` |
| `eligibilityStatus` | string | — | `Active`, `Inactive`, `Suspended`. Comma-separated allowed. |
| `siteContext` | string | — | `NexTower`, `Nexteracom`, `Both` |
| `sortBy` | string | `displayName` | Allowed: `displayName`, `workplaceRegistryEid`, `lastUpdatedAt` |
| `sortOrder` | string | `asc` | `asc` or `desc` |
| `page` | integer | `1` | |
| `limit` | integer | `20` | max 100 |

**Success — `200 OK`** (list shape)
```json
{
  "data": [
    {
      "id": "...",
      "userId": "...",
      "displayName": "Alice Standard",
      "email": "alice.standard@nexlevel.local",
      "workplaceRegistryEid": "EID-00123",
      "badgeId": "BDG-00123",
      "eligibilityStatus": "Active",
      "vehicleMake": "Tesla",
      "vehicleModel": "Model 3",
      "siteContext": "Both",
      "privacyAcknowledgementStatus": "Acknowledged",
      "lastUpdatedAt": "2026-05-22T08:01:33Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

**Errors:** `401`, `403`.

---

#### 9.3.2 `GET /eligible-users/{id}`

**Purpose:** Read a single eligible EV user record.
**Auth:** Admin, Security, Workplace, or the user themselves (`Self`).

**Success — `200 OK`** (same shape as item in list)

**Errors:** `401`, `403`, `404`.

---

#### 9.3.3 `POST /eligible-users`

**Purpose:** Create a new eligible EV user record (and the underlying user account if needed).
**Auth:** Admin only.

**Request body**
```json
{
  "email": "newbie@nexlevel.local",
  "displayName": "Newbie Driver",
  "role": "StandardUser",
  "workplaceRegistryEid": "EID-00456",
  "badgeId": "BDG-00456",
  "eligibilityStatus": "Active",
  "vehicleMake": "Renault",
  "vehicleModel": "Zoe",
  "siteContext": "NexTower",
  "password": "demo-password"
}
```
- `email`, `displayName`, `role`, `workplaceRegistryEid`, `badgeId`, `eligibilityStatus`, `siteContext`, `password` — required.
- `vehicleMake`, `vehicleModel` — optional but recommended (booking flow pre-fills from here).

**Success — `201 Created`** — returns full eligible user object.

**Errors**
- `400` validation (missing required, bad enum).
- `403` not Admin.
- `409` `DuplicateEid` / `DuplicateBadge` / `DuplicateEmail`.

---

#### 9.3.4 `PUT /eligible-users/{id}`

**Purpose:** Update an eligible EV user record. Admin can update any field; a `StandardUser` updating their own record may only change `vehicleMake` and `vehicleModel` (FR-USER-006).
**Auth:** Admin (full), or `StandardUser` for their own `id` (vehicle fields only).

**Request body (Admin — any subset of):**
```json
{
  "displayName": "Newbie Driver",
  "eligibilityStatus": "Suspended",
  "vehicleMake": "Renault",
  "vehicleModel": "Zoe",
  "siteContext": "Both"
}
```

**Request body (Self):**
```json
{
  "vehicleMake": "Renault",
  "vehicleModel": "Zoe"
}
```
A non-admin sending any other field → `403 Forbidden` `{ code: "Forbidden", message: "Standard users may only update vehicle fields." }`.

**Success — `200 OK`** — returns updated eligible user object.

**Errors:** `400`, `401`, `403`, `404`, `409` (duplicate EID/badge).

---

#### 9.3.5 `DELETE /eligible-users/{id}`

**Purpose:** Remove an eligible EV user. Soft-delete preferred (sets `eligibilityStatus=Inactive`) per data-model conventions.
**Auth:** Admin only.

**Behaviour:** If the user has any historical bookings, the record is set to `eligibilityStatus=Inactive` instead of being hard-deleted, to preserve referential integrity for reporting and audit.

**Success — `204 No Content`**

**Errors:** `401`, `403`, `404`, `409` `Conflict` (active booking exists — block delete until cancelled).

---

### 9.4 Chargers

#### 9.4.1 `GET /chargers`

**Purpose:** List all chargers with current status — drives the real-time dashboard. No pagination (max 50 chargers system-wide; hackathon: 8).
**Auth:** Any authenticated role.

**Query params**
| Param | Type | Notes |
|---|---|---|
| `locationCode` | string | `NEX-TOWER` or `NEXTERACOM` |
| `status` | string | One of the charger statuses; comma-separated allowed |

**Success — `200 OK`** (list, no pagination)
```json
{
  "data": [
    {
      "id": "...",
      "externalStationId": "NEX-TOWER-CH-01",
      "displayName": "NEX Tower Charger 1",
      "connectorId": 1,
      "status": "Charging",
      "location": {
        "id": "...",
        "name": "NEX Tower",
        "code": "NEX-TOWER"
      },
      "lastCsmsSyncAt": "2026-05-22T08:14:55Z",
      "activeSession": {
        "id": "...",
        "userDisplayName": "***",
        "vehicleMake": "***",
        "vehicleModel": "***",
        "startTime": "2026-05-22T08:00:00Z",
        "energyKwh": 4.21,
        "elapsedMinutes": 14
      }
    }
  ]
}
```
- `activeSession` is `null` when the charger is not in `Charging`.
- `activeSession.userDisplayName`, `vehicleMake`, `vehicleModel` are masked (`"***"`) for non-admin roles (FR-DASH-005, AC-DASH-05). Admin/Security/Workplace receive the real values.

**Polling:** Frontend polls this endpoint every 5 seconds (FR-DASH-004). The backend serves from the local `chargers` table populated by `StationSyncService` — no live CSMS call per request.

**Errors:** `401`.

---

#### 9.4.2 `GET /chargers/{id}`

**Purpose:** Read a single charger with status detail.
**Auth:** Any authenticated role.
**Success — `200 OK`** — same item shape as above.
**Errors:** `401`, `404`.

---

#### 9.4.3 `PUT /chargers/{id}/status`

**Purpose:** Operationally override a charger's status (mark Unavailable, Faulted, Blocked for Maintenance) — FR-DASH-006.
**Auth:** Admin, Security, Workplace.

**Request body**
```json
{
  "status": "Unavailable",
  "reason": "Cable damaged"
}
```
- `status` — required. Allowed: `Available`, `Unavailable`, `Faulted`, `BlockedForMaintenance`. `Reserved` and `Charging` are CSMS-driven and NOT settable here.
- `reason` — required, non-empty.

**Success — `200 OK`** — returns updated charger object.

**Effects:**
- Writes audit log entry (`Action=ChargerStatusChanged`).
- Setting to `BlockedForMaintenance` here does NOT call the CSMS connector-block API — that is the responsibility of `POST /maintenance-blocks`. This endpoint is for ad-hoc operational status only.

**Errors**
- `400` `InvalidEnumValue` or `ReasonRequired`.
- `403` role not permitted.
- `404` charger not found.

---

### 9.5 Bookings

#### 9.5.1 `GET /bookings`

**Purpose:** List bookings filtered by role. Standard Users see only their own; Security/Workplace/Admin see all; ReportingESGViewer is blocked.
**Auth:** Any authenticated role except ReportingESGViewer.

**Query params**
| Param | Type | Notes |
|---|---|---|
| `state` | string | Comma-separated booking states |
| `chargerId` | uuid | |
| `userId` | uuid | Admin/Security/Workplace only; ignored for StandardUser (always own) |
| `locationCode` | string | `NEX-TOWER` or `NEXTERACOM` |
| `dateFrom` | dateTime | UTC ISO 8601, inclusive |
| `dateTo` | dateTime | UTC ISO 8601, exclusive |
| `csmsSyncStatus` | string | Comma-separated |
| `sortBy` | string | Allowed: `startTime`, `createdAt`, `state` |
| `sortOrder` | string | `asc` or `desc` (default `desc`) |
| `page`, `limit` | integer | standard |

**Success — `200 OK`** (list shape with pagination)
```json
{
  "data": [
    {
      "id": "...",
      "userId": "...",
      "userDisplayName": "Alice Standard",
      "chargerId": "...",
      "chargerDisplayName": "NEX Tower Charger 1",
      "locationCode": "NEX-TOWER",
      "startTime": "2026-05-22T09:00:00Z",
      "endTime": "2026-05-22T10:00:00Z",
      "state": "Confirmed",
      "vehicleMake": "Tesla",
      "vehicleModel": "Model 3",
      "csmsIdTag": "EID-00123-20260522",
      "csmsSyncStatus": "Authorized",
      "reasonForOverride": null,
      "actorUserId": null,
      "createdAt": "2026-05-22T08:01:33Z",
      "updatedAt": "2026-05-22T08:01:36Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Errors:** `401`, `403`.

---

#### 9.5.2 `POST /bookings`

**Purpose:** Create a booking.
**Auth:** `StandardUser` (own); `Workplace` (on behalf of another user with reason); `Admin` (on behalf + can override 1h cap with reason).

**Request body**
```json
{
  "chargerId": "...",
  "startTime": "2026-05-22T09:00:00Z",
  "endTime": "2026-05-22T10:00:00Z",
  "vehicleMake": "Tesla",
  "vehicleModel": "Model 3",
  "onBehalfOfUserId": null,
  "reasonForOverride": null
}
```
- `chargerId` — required, must exist, must be in a bookable state for the window.
- `startTime`, `endTime` — required ISO 8601 UTC; `endTime > startTime`.
- `vehicleMake`, `vehicleModel` — required; the UI pre-fills from `eligible_ev_users`.
- `onBehalfOfUserId` — only valid for Workplace/Admin; sets `actorUserId = current` and `userId = onBehalfOfUserId`.
- `reasonForOverride` — required when the booking violates a fair-use rule and the caller is Admin/Security/Workplace exercising override authority.

**Validation rules (server-side, in order)**
1. `RequiredFieldMissing` for any of the required fields → `400`.
2. `InvalidDateFormat` if `startTime`/`endTime` are not parseable → `400`.
3. `startTime` >= `now - 1 min` (BR-013) → else `400 InvalidStartTime`.
4. Same calendar day as now (BR-016) → else `400 SameDayOnly`.
5. `endTime > startTime` → else `400`.
6. Caller eligibility: `EligibilityStatus = Active` for `userId` (effective owner) → else `403 NotEligible`.
7. Caller privacy: current notice acknowledged by `userId` → else `403 PrivacyNotAcknowledged`.
8. `endTime - startTime <= 60 minutes` (BR-001) for non-admin OR `reasonForOverride` present (BR-007) → else `400 DurationExceeded`.
9. Daily cumulative for `userId` <= 60 minutes (BR-003) or override reason present → else `409 DailyCapExceeded`.
10. No existing Pending/Confirmed/Active booking by `userId` (BR-003) or override → else `409 AlreadyHasActiveBooking`.
11. Charger status `Available` for the requested window (BR-004); no overlap with another Pending/Confirmed/Active booking on this charger (BR-002) → else `409 OverlappingBooking` or `409 ChargerUnavailable`.
12. Charger not under an active `maintenance_block` for the window → else `409 MaintenanceBlockConflict`.

Once validation passes:
1. Insert `bookings` row with `state=Confirmed`, `csmsSyncStatus=AuthorizationPending`.
2. Update charger `status` to `Reserved` (if not already `Charging` for another non-overlapping slot).
3. Call `CsmsClient.AuthorizeTagAsync(...)`. On 2xx → `csmsSyncStatus=Authorized`. On non-2xx/timeout → `csmsSyncStatus=AuthorizationFailed` + intervention alert + audit log entry. The HTTP response to the caller still returns `201 Created` with the booking, with `csmsSyncStatus` showing the actual state, so the frontend can warn the user.
4. Fire `BookingConfirmation` notification trigger (fan out to InApp + Email + Teams).
5. Audit-log the create.

**Success — `201 Created`** — returns the booking object (same shape as in the list).

**Errors:** as enumerated above + `401`, `403`, `500`.

---

#### 9.5.3 `GET /bookings/{id}`

**Purpose:** Single booking detail with linked charging session.
**Auth:** Owner; Admin/Security/Workplace; ReportingESGViewer denied.

**Success — `200 OK`**
```json
{
  "id": "...",
  "userId": "...",
  "userDisplayName": "Alice Standard",
  "chargerId": "...",
  "chargerDisplayName": "NEX Tower Charger 1",
  "locationCode": "NEX-TOWER",
  "startTime": "2026-05-22T09:00:00Z",
  "endTime": "2026-05-22T10:00:00Z",
  "state": "Active",
  "vehicleMake": "Tesla",
  "vehicleModel": "Model 3",
  "csmsIdTag": "EID-00123-20260522",
  "csmsSyncStatus": "Authorized",
  "reasonForOverride": null,
  "actorUserId": null,
  "createdAt": "2026-05-22T08:01:33Z",
  "updatedAt": "2026-05-22T09:02:00Z",
  "chargingSession": {
    "id": "...",
    "state": "Charging",
    "startTime": "2026-05-22T09:02:00Z",
    "stopTime": null,
    "energyKwh": 1.34,
    "source": "CSMS-Simulator"
  }
}
```

**Errors:** `401`, `403`, `404`.

---

#### 9.5.4 `PUT /bookings/{id}/cancel`

**Purpose:** Cancel a not-yet-Active booking (FR-BOOK-007).
**Auth:** Owner or Admin.

**Request body**
```json
{ "reason": "Plans changed" }
```
- `reason` — optional for owner; required when an admin cancels someone else's booking.

**Allowed source states:** `Pending`, `Confirmed`. Otherwise → `409 InvalidStateTransition`.

**Effects:**
- `state = Cancelled`, charger returns to `Available`.
- `DELETE /api/auth/tags/:idTag` on CSMS; sets `csmsSyncStatus = Revoked`.
- Audit log entry.
- If admin cancelled someone else's booking, send notification to affected user.

**Success — `200 OK`** returns updated booking.
**Errors:** `400` (missing reason when required), `401`, `403`, `404`, `409`.

---

#### 9.5.5 `PUT /bookings/{id}/release`

**Purpose:** End an Active booking early (FR-BOOK-008, FR-BOOK-009).
**Auth:** Owner, Security, Workplace, Admin.

**Request body**
```json
{ "reason": "Done charging" }
```
- `reason` — optional for owner; required when an operator releases another user's booking.

**Allowed source states:** `Active`. (`Confirmed` releases are deferred per Open Question Q8.)

**Effects:**
- Owner release → `state = Released`. Operator release → `state = Released` and `reasonForOverride = reason` recorded.
- Linked session moves to `StoppedByUser` or `StoppedByAdmin`.
- Charger returns to `Available`.
- `DELETE /api/auth/tags/:idTag` on CSMS; `csmsSyncStatus = Revoked`.
- Optional `POST /api/stations/:id/remote-stop` to CSMS if `CSMS_REMOTE_STOP_ENABLED=true` (FR-OCPP-013).
- Audit log entry; if operator-driven, send notification to affected user.

**Success — `200 OK`** returns updated booking.
**Errors:** `400`, `401`, `403`, `404`, `409`.

---

#### 9.5.6 `PUT /bookings/{id}/override`

**Purpose:** Apply an admin/security/workplace override that extends a booking beyond 1h or modifies its time window (FR-BOOK-010).
**Auth:** Security, Workplace, Admin.

**Request body**
```json
{
  "newEndTime": "2026-05-22T10:30:00Z",
  "reason": "VIP visit — extension authorised"
}
```
- `newEndTime` — required, ISO 8601 UTC, `> existingEndTime`.
- `reason` — required, non-empty.

**Allowed source states:** `Confirmed`, `Active`. Otherwise `409`.

**Effects:** Update `endTime`; `state = Overridden`; record `reasonForOverride`, `actorUserId`. Audit log entry. Notify booking owner.

**Success — `200 OK`** returns updated booking.
**Errors:** `400` `ReasonRequired`, `401`, `403`, `404`, `409` overlap with another booking.

---

### 9.6 Sessions

#### 9.6.1 `GET /sessions`

**Purpose:** Historical and active charging sessions for reporting and operational views.
**Auth:** Admin, Workplace, Security, ReportingESGViewer.

**Query params**
| Param | Type | Notes |
|---|---|---|
| `state` | string | Comma-separated session states |
| `chargerId` | uuid | |
| `userId` | uuid | |
| `locationCode` | string | |
| `dateFrom` / `dateTo` | dateTime | |
| `source` | string | `CSMS`, `CSMS-Simulator` |
| `sortBy` | string | Allowed: `startTime`, `energyKwh` |
| `sortOrder` | string | |
| `page`, `limit` | integer | |

**Success — `200 OK`** (list shape with pagination)
```json
{
  "data": [
    {
      "id": "...",
      "bookingId": "...",
      "chargerId": "...",
      "chargerDisplayName": "NEX Tower Charger 1",
      "userId": "...",
      "userDisplayName": "Alice Standard",
      "vehicleMake": "Tesla",
      "vehicleModel": "Model 3",
      "state": "Completed",
      "startTime": "2026-05-22T09:02:00Z",
      "stopTime": "2026-05-22T09:55:00Z",
      "energyKwh": 18.42,
      "source": "CSMS-Simulator",
      "csmsSessionId": "csms-sess-001"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

#### 9.6.2 `GET /sessions/{id}`

**Purpose:** Single session detail.
**Auth:** Admin/Workplace/Security, or booking owner.
**Success — `200 OK`** — item shape above.
**Errors:** `401`, `403`, `404`.

---

### 9.7 Notifications

#### 9.7.1 `GET /notifications`

**Purpose:** Current user's in-app notification feed.
**Auth:** Any authenticated role (always scoped to `audienceUserId = currentUser`).

**Query params**
| Param | Type | Notes |
|---|---|---|
| `unreadOnly` | boolean | default `false` |
| `severity` | string | `Info`, `Warning`, `Critical` |
| `triggerEvent` | string | one of the 9 templates |
| `sortBy` | string | Allowed: `timestamp` |
| `sortOrder` | string | default `desc` |
| `page`, `limit` | integer | |

By default, returns only `channel=InApp` rows. Email/Teams payloads are not exposed here — they live in `/notifications/audit`.

**Success — `200 OK`** (list shape with pagination)
```json
{
  "data": [
    {
      "id": "...",
      "triggerEvent": "BookingConfirmation",
      "channel": "InApp",
      "severity": "Info",
      "title": "Booking confirmed",
      "body": "Your booking on NEX Tower Charger 1 is confirmed for 09:00-10:00 (Tesla Model 3).",
      "readState": false,
      "linkedBookingId": "...",
      "linkedSessionId": null,
      "linkedChargerId": "...",
      "timestamp": "2026-05-22T08:01:36Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

#### 9.7.2 `GET /notifications/unread-count`

**Purpose:** Drives the unread badge in the nav bar.
**Auth:** Any authenticated role.

**Success — `200 OK`**
```json
{ "unreadCount": 3 }
```

---

#### 9.7.3 `PUT /notifications/{id}/read`

**Purpose:** Mark a single in-app notification as read.
**Auth:** Owner of the notification only (`audienceUserId == currentUserId`).

**Request body:** None.

**Effects:** Sets `readState = true`. Idempotent — repeated calls return `200 OK` with the same state.

**Success — `200 OK`** — returns the updated notification item.
**Errors:** `401`, `403` (notification belongs to another user), `404`.

---

#### 9.7.4 `GET /notifications/audit`

**Purpose:** Admin / operational view across all users and channels (FR-REM-016). Includes `Email` and `Teams` payload previews.
**Auth:** Admin (all), Security/Workplace (operational scope — bookings, sessions, charger faults).

**Query params**
| Param | Type | Notes |
|---|---|---|
| `audienceUserId` | uuid | filter by recipient |
| `channel` | string | `InApp`, `Email`, `Teams` (comma-separated) |
| `deliveryStatus` | string | `Sent`, `Previewed`, `Failed` |
| `triggerEvent` | string | comma-separated |
| `correlationId` | string | groups the 3 channel rows for one event |
| `dateFrom` / `dateTo` | dateTime | |
| `sortBy`, `sortOrder` | string | |
| `page`, `limit` | integer | |

**Success — `200 OK`** (list shape with pagination)
```json
{
  "data": [
    {
      "id": "...",
      "audienceUserId": "...",
      "audienceUserDisplayName": "Alice Standard",
      "triggerEvent": "BookingConfirmation",
      "channel": "Teams",
      "severity": "Info",
      "title": "Booking confirmed",
      "body": "Your booking on NEX Tower Charger 1 ...",
      "payload": { /* Adaptive Card JSON */ },
      "deliveryStatus": "Previewed",
      "readState": false,
      "correlationId": "01HX2YQM...ULID",
      "linkedBookingId": "...",
      "linkedSessionId": null,
      "linkedChargerId": "...",
      "timestamp": "2026-05-22T08:01:36Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

### 9.8 Reporting

All reporting endpoints share the same query-param surface and response envelope:

**Common query params**
| Param | Type | Notes |
|---|---|---|
| `dateFrom` | dateTime | UTC ISO 8601, inclusive |
| `dateTo` | dateTime | UTC ISO 8601, exclusive |
| `locationCode` | string | `NEX-TOWER`, `NEXTERACOM`. Omit for both. |
| `chargerId` | uuid | optional |

**Common response envelope**
```json
{
  "data": { /* metric-specific */ },
  "simulatedDataLabel": "Based on simulated demo data",
  "appliedFilters": {
    "dateFrom": "2026-05-15T00:00:00Z",
    "dateTo": "2026-05-22T23:59:59Z",
    "locationCode": null,
    "chargerId": null
  }
}
```
- `simulatedDataLabel` is `null` when no simulator-sourced session is in the window; otherwise the exact string `"Based on simulated demo data"` (FR-REP-012, BR-009).

---

#### 9.8.1 `GET /reports/summary`

**Auth:** Admin, Workplace, ReportingESGViewer, Management.

**`data` shape**
```json
{
  "totalSessions": 57,
  "totalKwh": 412.6,
  "estimatedCo2SavingsKg": 350.71,
  "emissionFactorUsed": 0.85
}
```

---

#### 9.8.2 `GET /reports/sessions`

**Auth:** Admin, Workplace, ReportingESGViewer.

**`data` shape**
```json
{
  "totalSessions": 57,
  "completedCount": 49,
  "cancelledCount": 4,
  "releasedCount": 2,
  "noShowCount": 2,
  "avgDurationMinutes": 48.2,
  "avgKwh": 7.23
}
```

---

#### 9.8.3 `GET /reports/energy`

**Auth:** Admin, Workplace, ReportingESGViewer.

**`data` shape**
```json
{
  "totalKwh": 412.6,
  "avgKwhPerSession": 7.23,
  "peakHourDistribution": [
    { "hour": 8, "sessionCount": 12 },
    { "hour": 9, "sessionCount": 18 }
  ],
  "chargerRanking": [
    { "chargerId": "...", "displayName": "NEX-TOWER-CH-01", "sessionCount": 21, "totalKwh": 162.4 }
  ]
}
```

---

#### 9.8.4 `GET /reports/utilization`

**Auth:** Admin, Workplace.

**`data` shape**
```json
{
  "chargers": [
    {
      "chargerId": "...",
      "displayName": "NEX-TOWER-CH-01",
      "utilizationPercent": 62.4,
      "blockedForMaintenanceMinutes": 30,
      "faultedEventCount": 1
    }
  ],
  "locationComparison": {
    "NEX-TOWER": { "totalSessions": 34, "totalKwh": 245.1, "avgUtilizationPercent": 58.2 },
    "NEXTERACOM": { "totalSessions": 23, "totalKwh": 167.5, "avgUtilizationPercent": 49.1 }
  }
}
```

---

#### 9.8.5 `GET /reports/sustainability`

**Auth:** Admin, ReportingESGViewer, Management.

**`data` shape**
```json
{
  "totalKwh": 412.6,
  "estimatedCo2SavingsKg": 350.71,
  "emissionFactorUsed": 0.85,
  "usageByVehicleCategory": [
    { "vehicleMake": "Tesla", "userCount": 4, "sessionCount": 18, "totalKwh": 142.6 },
    { "vehicleMake": "Other", "userCount": 8, "sessionCount": 39, "totalKwh": 270.0 }
  ]
}
```
- Vehicle groups with fewer than 3 distinct users are rolled into `"Other"` (FR-REP-017).

---

### 9.9 AI Insights

#### 9.9.1 `GET /ai/insights`

**Purpose:** Grounded NL summary, demand forecast, patterns, anomalies, recommendations (P2 — FR-AI-001..011).
**Auth:** Admin, ReportingESGViewer, Management.

**Query params:** Same as reporting (`dateFrom`, `dateTo`, `locationCode`).

**Success — `200 OK`**
```json
{
  "nlSummary": "In the last 24 hours, 7 charging sessions delivered 41.3 kWh ...",
  "demandForecast": [
    { "hourBucket": 9, "demandScore": 0.82 },
    { "hourBucket": 14, "demandScore": 0.66 }
  ],
  "patterns": [
    { "patternType": "UnderusedCharger", "entityId": "...", "supportingCount": 2, "severity": "Low" }
  ],
  "anomalies": [
    { "entityId": "...", "anomalyType": "EnergySpike", "observedValue": 28.4, "expectedRange": "5-15 kWh", "reason": "3x session average" }
  ],
  "recommendations": [
    { "text": "Encourage off-peak booking between 11:00-13:00; maintain the 1-hour-per-user-per-day BR002 baseline.", "metric": "PeakHourSessions", "thresholdReason": "Peak 09:00 utilization 92%" }
  ],
  "grounding": {
    "sessionCount": 7,
    "totalKwh": 41.3,
    "topChargerId": "...",
    "peakHourBucket": 9,
    "noShowRate": 0.14,
    "avgDurationMinutes": 47.1
  },
  "confidence": "Medium",
  "simulatedDataLabel": "Based on simulated demo data"
}
```

**Rules enforced server-side after the LLM responds:**
- Every numeric in `nlSummary` must appear in `grounding` (FR-AI-010, AC-AI-04). If a fabrication is detected → return `503 AiUnavailable` with the static fallback summary.
- `confidence`: `Low` (<10 sessions, no point forecasts emitted), `Medium` (10..49), `High` (>=50).
- `simulatedDataLabel` is set when any input session has `source = "CSMS-Simulator"`.

**Errors:** `401`, `403`, `503` `AiUnavailable` (Azure OpenAI down or grounding validation failed — frontend renders a static fallback notice).

---

### 9.10 Audit Log

#### 9.10.1 `GET /audit-logs`

**Purpose:** Read-only audit trail (FR-AUDIT-001..005).
**Auth:** Admin (all). Security/Workplace receive a server-filtered subset (operational entity types: `Booking`, `Charger`, `MaintenanceBlock`, `Csms*`).

**Query params**
| Param | Type | Notes |
|---|---|---|
| `actorUserId` | string | UUID or `system` |
| `action` | string | comma-separated |
| `entityType` | string | comma-separated |
| `entityId` | string | |
| `source` | string | `User`, `Admin`, `System`, `Csms` |
| `dateFrom` / `dateTo` | dateTime | |
| `sortBy`, `sortOrder` | string | |
| `page`, `limit` | integer | |

**Success — `200 OK`** (list shape with pagination)
```json
{
  "data": [
    {
      "id": "...",
      "timestamp": "2026-05-22T08:01:36Z",
      "actorUserId": "system",
      "actorRole": "System",
      "action": "CsmsAuthorizationFailed",
      "entityType": "Booking",
      "entityId": "...",
      "beforeState": "{\"csmsSyncStatus\":\"AuthorizationPending\"}",
      "afterState": "{\"csmsSyncStatus\":\"AuthorizationFailed\"}",
      "reason": "CSMS responded 503",
      "source": "Csms"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Note:** No `POST`, `PUT`, or `DELETE` on `/audit-logs`. Audit entries are written exclusively by backend services. FR-AUDIT-004 requires immutability and is enforced by an EF Core `SaveChangesInterceptor` + a PostgreSQL trigger.

**Errors:** `401`, `403`.

---

### 9.11 Maintenance Blocks

#### 9.11.1 `POST /maintenance-blocks`

**Purpose:** Block a charger for maintenance (FR-ADMIN-001, FR-OCPP-011).
**Auth:** Admin only.

**Request body**
```json
{
  "chargerId": "...",
  "startTime": "2026-05-22T11:00:00Z",
  "endTime": "2026-05-22T12:00:00Z",
  "reason": "Firmware update"
}
```
- `chargerId`, `startTime`, `reason` — required.
- `endTime` — optional. `null` means open-ended.
- `reason` — non-empty.

**Effects:**
1. Insert `maintenance_blocks` row with `isActive=true`.
2. Set charger `status = BlockedForMaintenance`.
3. Call `CsmsClient.BlockConnectorAsync(externalStationId, connectorId)`.
4. If the block window overlaps existing Confirmed/Active bookings → reject with `409 MaintenanceBlockConflict` UNLESS the request includes `"forceReleaseExistingBookings": true` (FR-ADMIN-003) — in which case those bookings are released with `reasonForOverride = "Maintenance block: <reason>"` and their owners notified.
5. Audit-log the create (`Action=MaintenanceBlockCreated`) and any forced releases.

**Success — `201 Created`**
```json
{
  "id": "...",
  "chargerId": "...",
  "actorUserId": "...",
  "startTime": "2026-05-22T11:00:00Z",
  "endTime": "2026-05-22T12:00:00Z",
  "reason": "Firmware update",
  "isActive": true,
  "createdAt": "2026-05-22T10:55:00Z"
}
```

**Errors:** `400`, `401`, `403`, `404` (charger), `409`.

---

#### 9.11.2 `DELETE /maintenance-blocks/{id}`

**Purpose:** Remove an active maintenance block (FR-ADMIN-002).
**Auth:** Admin only.

**Effects:**
1. Set `isActive = false`, `endTime = now`.
2. Call `CsmsClient.UnblockConnectorAsync(...)`.
3. Charger returns to `Available` (subject to other concurrent state events).
4. Audit-log (`Action=MaintenanceBlockRemoved`).

**Success — `204 No Content`**
**Errors:** `401`, `403`, `404`, `409` if block is already inactive.

---

### 9.12 System Config

#### 9.12.1 `GET /config`

**Purpose:** Read all runtime config values.
**Auth:** Admin only.

**Success — `200 OK`**
```json
{
  "data": [
    { "key": "GRACE_PERIOD_MINUTES", "value": "15", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "EMISSION_FACTOR_KG_PER_KWH", "value": "0.85", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "PRE_SESSION_REMINDER_MINUTES", "value": "10", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "SESSION_ENDING_REMINDER_MINUTES", "value": "10", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "DAILY_CAP_MINUTES", "value": "60", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "NO_SHOW_THRESHOLD_COUNT", "value": "2", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "NO_SHOW_THRESHOLD_DAYS", "value": "7", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null },
    { "key": "CSMS_POLLING_INTERVAL_SECONDS", "value": "5", "updatedAt": "2026-05-22T07:00:00Z", "updatedBy": null }
  ]
}
```
List shape but no pagination (max ~10 rows).

---

#### 9.12.2 `PUT /config`

**Purpose:** Update one or more config values.
**Auth:** Admin only.

**Request body**
```json
{
  "updates": [
    { "key": "GRACE_PERIOD_MINUTES", "value": "20" },
    { "key": "EMISSION_FACTOR_KG_PER_KWH", "value": "0.80" }
  ]
}
```
- Each `key` must be a known config key (whitelist enforced server-side). Unknown keys → `400`.
- Each `value` is parsed and validated against its expected type (integer / decimal / boolean / etc.).

**Effects:** Update rows; audit-log each change (`Action=SystemConfigUpdated`, `entityId=<key>`).

**Success — `200 OK`** — returns the full config list (same shape as `GET /config`).
**Errors:** `400`, `401`, `403`.

---

## 10. Validation Errors — Examples

### Booking creation — daily cap exceeded
`POST /bookings` with a 30-minute booking when the user already has 40 minutes today:

`HTTP 409 Conflict`
```json
{
  "message": "Daily charging limit exceeded.",
  "errors": [
    {
      "code": "DailyCapExceeded",
      "message": "Daily charging limit (1 hour) exceeded. You have used 40 minutes today; this booking would add 30 minutes."
    }
  ],
  "traceId": "00-aa11..."
}
```

### Booking creation — privacy not acknowledged
`HTTP 403 Forbidden`
```json
{
  "message": "Privacy notice not acknowledged.",
  "errors": [
    {
      "code": "PrivacyNotAcknowledged",
      "message": "You must acknowledge the current privacy notice before booking a charger."
    }
  ],
  "traceId": "00-bb22..."
}
```

### Booking creation — multiple field errors
`HTTP 400 Bad Request`
```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "chargerId", "code": "RequiredFieldMissing", "message": "Charger is required." },
    { "field": "endTime", "code": "DurationExceeded", "message": "Maximum booking duration is 1 hour per day." },
    { "field": "vehicleModel", "code": "RequiredFieldMissing", "message": "Vehicle model is required." }
  ],
  "traceId": "00-cc33..."
}
```

### Charger status update — invalid enum
`HTTP 400 Bad Request`
```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "status", "code": "InvalidEnumValue", "message": "Status must be one of: Available, Unavailable, Faulted, BlockedForMaintenance." }
  ]
}
```

### CSMS authorization failure (post-booking)
The booking is still created (`201 Created`), but the response shows the degraded state. The frontend renders a warning banner on the booking confirmation screen.
```json
{
  "id": "...",
  "state": "Confirmed",
  "csmsSyncStatus": "AuthorizationFailed",
  /* ... */
}
```

---

## 11. API Ownership

| Resource | Backend owner | Frontend owner | QA owner |
|---|---|---|---|
| Auth | Backend Dev | Frontend Dev | QA |
| Privacy | Backend Dev | Frontend Dev | QA |
| Eligible EV Users | Backend Dev | Frontend Dev (Admin screens) | QA |
| Chargers | Backend Dev (incl. CsmsClient) | Frontend Dev (Dashboard) | QA |
| Bookings | Backend Dev (booking engine, fair-use rules) | Frontend Dev (booking form, my bookings) | QA |
| Sessions | Backend Dev (SessionSyncService) | Frontend Dev (read-only views) | QA |
| Notifications | Backend Dev (NotificationService + templates) | Frontend Dev (Notification Center) | QA |
| Reporting | Backend Dev (ReportingService) | Frontend Dev (Reporting dashboard) | QA |
| AI Insights | Backend Dev (AiInsightService) | Frontend Dev (AI panel) | QA |
| Audit Log | Backend Dev (AuditLogService) | Frontend Dev (Admin audit viewer) | QA |
| Maintenance Blocks | Backend Dev | Frontend Dev (Admin maintenance screen) | QA |
| Config | Backend Dev | Frontend Dev (Admin config screen) | QA |

- **Contract changes require an explicit `CHANGED:` annotation in this document AND notification to both the Backend Dev and Frontend Dev before the change is implemented.**
- The Solution Architect owns the structure and conventions of this document.
- The Backend Dev owns the implementation correctness — request/response shape must match exactly.
- The Frontend Dev owns the consumption correctness — field names must not be renamed for UI convenience.

---

## 12. Frontend / Backend Contract Notes

1. **Field name discipline.** The frontend MUST use the exact camelCase field names defined here. Re-shaping API responses inside React components is forbidden — adapt the UI, not the contract. If a UI need can't be met, raise a contract change.
2. **Loading / empty / success / error states.** Every component that calls an endpoint MUST implement all four states (CLAUDE.md frontend rule). Empty lists are a success state with `data: []`, not an error.
3. **Polling.** Only `GET /chargers` is polled (every 5 seconds). `GET /notifications/unread-count` is fetched on app load and on tab focus, NOT on a timer. Everything else is event-driven.
4. **Optimistic UI is forbidden for state transitions.** Booking creation, cancel, release, override — these must wait for the server response. The booking state machine is server-authoritative, and an optimistic UI that shows `Confirmed` before the CSMS responds will mislead the user when `csmsSyncStatus = AuthorizationFailed`.
5. **CSMS sync status display.** The frontend MUST surface `csmsSyncStatus` on every booking detail and list row. The visual treatment is:
   - `Authorized` → green check, "Ready to charge"
   - `AuthorizationPending` → yellow spinner, "Authorising at charger..."
   - `AuthorizationFailed` → red warning, "Authorisation failed — contact operations"
   - `Revoked` → grey, "Cancelled"
6. **Simulated data labelling.** Every reporting and AI view MUST render the `simulatedDataLabel` string verbatim when present. Hiding it is a violation of FR-REP-012 and BR-009.
7. **Masked fields for non-admin roles.** `userDisplayName`, `vehicleMake`, `vehicleModel` on `GET /chargers` returns `"***"` for non-admin roles. The frontend renders `"***"` directly — it MUST NOT attempt to look up real values from elsewhere.
8. **Trace IDs.** Every error response includes `traceId`. The frontend SHOULD log this to the browser console and include it in any user-facing "report a problem" link — it correlates one click with one set of backend log lines.
9. **CORS.** Backend allows exactly `http://localhost:5173` for the demo. No wildcard. Frontend devs running on another port must update `Program.cs` AND this document.
10. **Times always UTC on the wire.** The frontend converts to UTC+4 on display ONLY. Do not send local-time strings. Do not strip the trailing `Z`.
11. **Reason fields.** Whenever an action requires a `reason` (cancel by admin, release by operator, override, maintenance block) the frontend MUST validate non-empty before submit. The backend re-validates.
12. **Booking creation always returns 201 even when CSMS authorization fails** — the booking row exists; the failure is communicated via `csmsSyncStatus`. The frontend MUST inspect `csmsSyncStatus` after a `201` response and warn the user if it is not `Authorized`.
13. **Idempotency on state transitions.** Repeating `PUT /bookings/{id}/cancel` on an already-cancelled booking returns `409 InvalidStateTransition`, not `200`. The frontend should treat this as a benign "already done" state and refresh the booking view.
14. **No client-side fair-use math.** The frontend MAY display the user's remaining daily allowance as a hint (computed locally) but MUST NOT decide whether to allow submission based on that — submit and trust the server response. This avoids drift between client and server clocks.
15. **Pagination loop.** When loading "all my bookings" for a small dataset, the frontend SHOULD fetch with `limit=100`. It MUST NOT loop pages without a hard cap (3 pages = 300 rows max for the MVP).
16. **Notification fan-out.** A single booking trigger event produces three rows in `notifications` (InApp + Email + Teams) sharing a `correlationId`. The user-facing `GET /notifications` returns only the InApp row. The admin `GET /notifications/audit` returns all three.

---

## 13. Change Log

| Date | Section | Change | Reason |
|---|---|---|---|
| 2026-05-22 | All | Initial version | Created from functional-requirements v1.4, solution-architecture, data-model |

---

*All endpoints, fields, status codes, and error shapes in this document are the authoritative source for backend implementation, frontend consumption, and QA test generation. Any deviation must be flagged via a `CHANGED:` annotation here BEFORE the deviating code is merged.*

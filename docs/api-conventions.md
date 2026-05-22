# API Conventions — EV Charging Orchestration Platform

## Base URL

All API routes are prefixed with `/api/v1/`.

Example: `POST /api/v1/auth/login`, `GET /api/v1/chargers`

## Endpoint Naming

Use plural nouns and resource-action conventions:

```
GET    /api/v1/chargers
GET    /api/v1/chargers/{id}
POST   /api/v1/chargers
PUT    /api/v1/chargers/{id}/status
DELETE /api/v1/chargers/{id}
```

## Authentication

All protected endpoints require a Bearer JWT:

```
Authorization: Bearer <token>
```

JWT is issued by `POST /api/v1/auth/login`. Expiry: 24 hours (configurable).

Missing/invalid token returns HTTP 401 with standard error body.

## Response Shape — Success

Paginated list:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

Single entity — return the entity directly (no wrapper).

Report responses include:
```json
{
  "data": { ... },
  "simulatedDataLabel": "Based on simulated demo data",
  "appliedFilters": { "locationCode": "NEX-TOWER", "dateFrom": "...", "dateTo": "..." }
}
```

## Error Shape

All error responses use this envelope:

```json
{
  "message": "Short human-readable description.",
  "errors": [
    {
      "field": "startTime",
      "code": "InvalidStartTime",
      "message": "Start time must be in the future."
    }
  ],
  "traceId": "optional-correlation-id"
}
```

- `message` — top-level summary (always present).
- `errors` — array; each item has `field` (nullable), `code` (machine-readable), `message` (human-readable).
- `traceId` — optional correlation ID for log lookup.

## HTTP Status Codes

| Code | When |
|------|------|
| 200  | Successful GET, PUT, PATCH |
| 201  | Successful POST (resource created) |
| 204  | Successful DELETE or state-change POST with no body |
| 400  | Validation error, bad request body |
| 401  | Missing or invalid JWT |
| 403  | Authenticated but not authorised (RBAC / eligibility / privacy gate) |
| 404  | Resource not found |
| 409  | Conflict (overlap, double booking, invalid state transition) |
| 503  | Upstream dependency unavailable (CSMS, AI) |
| 500  | Unexpected server error |

## Field Naming

All JSON field names use **camelCase** in request and response bodies.

Database columns use **snake_case** (enforced by EFCore.NamingConventions).

## Enum Values

Enums are serialised as **string PascalCase** values (not integers).

Examples: `"state": "Confirmed"`, `"role": "StandardUser"`, `"channel": "InApp"`

## Pagination

List endpoints accept `?page=1&limit=20` query parameters.
Default: `page=1`, `limit=20`. Max `limit`: 100.

## Timestamp Format

All timestamps are ISO 8601 UTC: `"2026-05-22T10:00:00Z"`

## CORS

Allowed origin in development: `http://localhost:5173`

## CSMS Integration

See full contract in `.claude/docs/api-conventions.md` (CSMS section).

## Endpoints Summary

| Resource | Endpoint |
|----------|----------|
| Auth | `POST /api/v1/auth/login` |
| Auth | `POST /api/v1/auth/logout` |
| Auth | `GET /api/v1/auth/me` |
| Privacy | `GET /api/v1/privacy-notice` |
| Privacy | `POST /api/v1/privacy-notice/acknowledge` |
| Chargers | `GET /api/v1/chargers` |
| Chargers | `GET /api/v1/chargers/{id}` |
| Chargers | `PUT /api/v1/chargers/{id}/status` |
| Bookings | `POST /api/v1/bookings` |
| Bookings | `GET /api/v1/bookings` |
| Bookings | `GET /api/v1/bookings/{id}` |
| Bookings | `DELETE /api/v1/bookings/{id}` |
| Bookings | `POST /api/v1/bookings/{id}/release` |
| Bookings | `PUT /api/v1/bookings/{id}/override` |
| Eligible Users | `GET /api/v1/eligible-users` |
| Eligible Users | `POST /api/v1/eligible-users` |
| Eligible Users | `GET /api/v1/eligible-users/{id}` |
| Eligible Users | `PUT /api/v1/eligible-users/{id}` |
| Eligible Users | `DELETE /api/v1/eligible-users/{id}` |
| Sessions | `GET /api/v1/sessions` |
| Sessions | `GET /api/v1/sessions/{id}` |
| Notifications | `GET /api/v1/notifications` |
| Notifications | `GET /api/v1/notifications/unread-count` |
| Notifications | `PUT /api/v1/notifications/{id}/read` |
| Notifications | `GET /api/v1/notifications/audit` |
| Reports | `GET /api/v1/reports/summary` |
| Reports | `GET /api/v1/reports/sessions` |
| Reports | `GET /api/v1/reports/energy` |
| Reports | `GET /api/v1/reports/utilization` |
| Reports | `GET /api/v1/reports/sustainability` |
| Audit Logs | `GET /api/v1/audit-logs` |
| Maintenance | `POST /api/v1/maintenance-blocks` |
| Maintenance | `DELETE /api/v1/maintenance-blocks/{id}` |
| Config | `GET /api/v1/config` |
| Config | `PUT /api/v1/config` |
| AI Insights | `GET /api/v1/ai/insights` |
| Health | `GET /health` |

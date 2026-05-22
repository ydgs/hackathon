# API Conventions

## Endpoint Naming
Use plural nouns:

```http
GET /api/requests
GET /api/requests/{id}
POST /api/requests
PUT /api/requests/{id}
PATCH /api/requests/{id}/status
DELETE /api/requests/{id}
```

## Response Shape
Prefer predictable response shapes:

```json
{
  "id": "string",
  "title": "string",
  "status": "Submitted",
  "createdAt": "2026-05-17T10:00:00Z"
}
```

## Error Shape
Use consistent errors:

```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"]
  }
}
```

## Frontend Integration Rules
- Frontend must use field names from the API contract.
- Backend must not change response fields without updating the story/task.
- Add loading, success, and failure handling for every API call used in the demo.

## Provided CSMS / OCPP Integration Conventions

The product must not expose or implement a custom OCPP protocol layer. The provided NexLevel CSMS/OCPP simulator is the charging infrastructure system of record for station status, sessions, meter values, and energy consumption.

### CSMS Base URL

Configure the CSMS REST API base URL through environment configuration:

```env
CSMS_BASE_URL=http://localhost:3000
```

Do not hardcode the CSMS URL inside services, controllers, components, or business logic.

### Provided CSMS Endpoints

The backend integration client may call these provided endpoints:

```http
GET /api/stations
GET /api/stations/{identity}
GET /api/sessions
GET /api/sessions/active
GET /api/sessions/{id}
POST /api/auth/tags
DELETE /api/auth/tags/{idTag}
GET /api/auth/tags?active=true
POST /api/stations/{id}/remote-start
POST /api/stations/{id}/remote-stop
PUT /api/stations/{id}/connectors/{n}/block
DELETE /api/stations/{id}/connectors/{n}/block
```

### Frontend-Facing Wrapper Rule

Frontend screens should normally call the custom backend, not the CSMS directly. The backend should normalize CSMS responses into stable DTOs that match the app UI and acceptance criteria.

Recommended wrapper endpoints, if needed:

```http
GET /api/charging/stations
GET /api/charging/stations/{identity}
GET /api/charging/sessions/active
GET /api/charging/sessions
GET /api/charging/sessions/{id}
POST /api/bookings
DELETE /api/bookings/{id}
POST /api/charging/stations/{identity}/remote-start
POST /api/charging/stations/{identity}/remote-stop
```

### Booking to CSMS Authorization Rule

When a booking is created, the backend must authorize the RFID/tag window against the CSMS:

```http
POST /api/auth/tags
```

Suggested request body sent to CSMS:

```json
{
  "idTag": "RFID001",
  "validFrom": "2026-05-22T10:00:00Z",
  "validTo": "2026-05-22T11:00:00Z"
}
```

The local booking response should expose CSMS sync state clearly:

```json
{
  "id": "booking-001",
  "stationIdentity": "CP-NEX-001",
  "idTag": "RFID001",
  "startTime": "2026-05-22T10:00:00Z",
  "endTime": "2026-05-22T11:00:00Z",
  "status": "Confirmed",
  "csmsAuthorizationStatus": "Authorized"
}
```

Recommended CSMS authorization statuses:

```txt
Pending | Authorized | AuthorizationFailed | Revoked
```

### Cancellation / Release Rule

When a booking is cancelled or released, the backend must revoke the RFID/tag authorization through:

```http
DELETE /api/auth/tags/{idTag}
```

Do not mark the booking as fully released from a charging perspective if CSMS revocation fails. Return a clear error or a state requiring attention.

### Energy and Consumption Rule

Energy and meter values must come from CSMS session endpoints. If energy is returned in Wh, convert to kWh as:

```txt
energyKwh = energyWh / 1000
```

Do not create fake production consumption values if simulator-backed session data is available.

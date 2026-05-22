# API Test Cases — EV Charging Orchestration Platform

Base URL: `http://localhost:5219/api/v1` (port may vary — check app startup logs)

All authenticated requests require header: `Authorization: Bearer <jwt_token>`

---

## TC-001 — Health Check

**Endpoint:** `GET /health`
**Auth:** None

**Expected response (200):**
```json
{ "status": "healthy", "timestamp": "2026-05-23T10:00:00Z" }
```

---

## TC-002 — Login (Happy Path)

**Endpoint:** `POST /auth/login`
**Auth:** None
**Body:**
```json
{ "email": "emma@nexlevel.mu", "password": "demo1234" }
```

**Expected response (200):**
```json
{
  "token": "<jwt string>",
  "expiresAt": "<datetime>",
  "user": {
    "id": "<uuid>",
    "email": "emma@nexlevel.mu",
    "displayName": "Emma Green",
    "role": "Admin"
  }
}
```

---

## TC-003 — Login (Invalid Password)

**Endpoint:** `POST /auth/login`
**Body:**
```json
{ "email": "emma@nexlevel.mu", "password": "wrongpassword" }
```

**Expected response (401):**
```json
{
  "message": "Invalid email or password.",
  "errors": [{ "code": "Unauthenticated", "message": "Invalid email or password." }]
}
```

---

## TC-004 — Login (Missing Email)

**Endpoint:** `POST /auth/login`
**Body:**
```json
{ "email": "", "password": "demo1234" }
```

**Expected response (400):**
```json
{
  "message": "Validation failed.",
  "errors": [{ "field": "email", "code": "RequiredFieldMissing", "message": "Email is required." }]
}
```

---

## TC-005 — GET /auth/me (Admin)

**Endpoint:** `GET /auth/me`
**Auth:** Emma (Admin)

**Expected response (200):** Includes `role: "Admin"`, `eligibility: null`, `privacy.hasAcknowledgedCurrentVersion: false`

---

## TC-006 — GET /auth/me (StandardUser with Acknowledged Privacy)

**Endpoint:** `GET /auth/me`
**Auth:** Alice (StandardUser)

**Expected response (200):** Includes `eligibility.isEligible: true`, `privacy.hasAcknowledgedCurrentVersion: true`

---

## TC-007 — GET Privacy Notice (Anonymous)

**Endpoint:** `GET /privacy-notice`
**Auth:** None

**Expected response (200):**
```json
{
  "data": {
    "id": "<uuid>",
    "version": "1.0",
    "isCurrentVersion": true,
    "content": "...",
    "effectiveDate": "2026-01-01"
  }
}
```

---

## TC-008 — Acknowledge Privacy Notice

**Endpoint:** `POST /privacy-notice/acknowledge`
**Auth:** Bob (StandardUser — has NOT acknowledged)
**Body:** `{}`

**Expected response (200):**
```json
{ "message": "Privacy notice acknowledged." }
```

---

## TC-009 — List Chargers (No Filters)

**Endpoint:** `GET /chargers`
**Auth:** Alice (StandardUser)

**Expected response (200):** Array of 8 chargers (2 locations, 4 each). Active session info masked with `"***"` for StandardUser.

---

## TC-010 — List Chargers (Filter by Location)

**Endpoint:** `GET /chargers?locationCode=HQ`
**Auth:** Emma (Admin)

**Expected response (200):** 4 chargers for HQ location with full session info visible.

---

## TC-011 — Get Charger by ID

**Endpoint:** `GET /chargers/{chargerId}`
**Auth:** Emma (Admin)

**Expected response (200):** Single charger with `activeSession` populated if a session is running.

---

## TC-012 — Update Charger Status (Admin)

**Endpoint:** `PUT /chargers/{chargerId}/status`
**Auth:** Emma (Admin)
**Body:**
```json
{ "status": "BlockedForMaintenance", "reason": "Scheduled service" }
```

**Expected response (200):** Updated charger with new status.

---

## TC-013 — Update Charger Status (Forbidden for StandardUser)

**Endpoint:** `PUT /chargers/{chargerId}/status`
**Auth:** Alice (StandardUser)
**Body:** `{ "status": "Available" }`

**Expected response (403)**

---

## TC-014 — Create Booking (Happy Path)

**Endpoint:** `POST /bookings`
**Auth:** Alice (StandardUser, Active + Acknowledged)
**Body:**
```json
{
  "chargerId": "<available-charger-uuid>",
  "startTime": "<tomorrow T09:00:00Z>",
  "endTime": "<tomorrow T09:45:00Z>",
  "vehicleMake": "Tesla",
  "vehicleModel": "Model 3"
}
```

**Expected response (201):**
```json
{
  "data": {
    "id": "<uuid>",
    "state": "Confirmed",
    "csmsSyncStatus": "Synced",
    ...
  }
}
```

---

## TC-015 — Create Booking (Missing Required Field)

**Endpoint:** `POST /bookings`
**Auth:** Alice
**Body:**
```json
{
  "chargerId": "<uuid>",
  "startTime": "<tomorrow T09:00:00Z>",
  "endTime": "<tomorrow T09:45:00Z>"
}
```
(vehicleMake and vehicleModel missing)

**Expected response (400):**
```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "vehicleMake", "code": "RequiredFieldMissing", "message": "Vehicle make is required." },
    { "field": "vehicleModel", "code": "RequiredFieldMissing", "message": "Vehicle model is required." }
  ]
}
```

---

## TC-016 — Create Booking (Duration > 60 Minutes, Non-Admin)

**Endpoint:** `POST /bookings`
**Auth:** Alice
**Body:**
```json
{
  "chargerId": "<uuid>",
  "startTime": "<tomorrow T09:00:00Z>",
  "endTime": "<tomorrow T10:30:00Z>",
  "vehicleMake": "Tesla",
  "vehicleModel": "Model 3"
}
```

**Expected response (400):**
```json
{
  "message": "Validation failed.",
  "errors": [{ "field": "duration", "code": "DurationExceeded", "message": "Booking duration cannot exceed 60 minutes." }]
}
```

---

## TC-017 — Create Booking (User Not Eligible)

**Endpoint:** `POST /bookings`
**Auth:** Bob (StandardUser, Active but NOT acknowledged)

**Expected response (400):** Error with code `PrivacyNotAcknowledged`

---

## TC-018 — Create Booking (Daily Cap Exceeded)

**Precondition:** Alice has an existing booking today totalling 60 minutes
**Endpoint:** `POST /bookings`
**Auth:** Alice

**Expected response (400):**
```json
{
  "errors": [{ "field": "startTime", "code": "DailyCapExceeded", "message": "..." }]
}
```

---

## TC-019 — Cancel Booking

**Endpoint:** `DELETE /bookings/{bookingId}`
**Auth:** Alice (owner of booking)

**Expected response (200):**
```json
{ "data": { "state": "Cancelled", ... } }
```

---

## TC-020 — Cancel Another User's Booking (Forbidden)

**Endpoint:** `DELETE /bookings/{alicesBookingId}`
**Auth:** Bob (different StandardUser)

**Expected response (403)**

---

## TC-021 — Override Booking (Admin)

**Endpoint:** `PUT /bookings/{bookingId}/override`
**Auth:** Emma (Admin)
**Body:**
```json
{ "state": "Completed", "reason": "Manual completion by admin for demo" }
```

**Expected response (200):** Booking with updated state.

---

## TC-022 — Override Booking (Missing Reason)

**Endpoint:** `PUT /bookings/{bookingId}/override`
**Auth:** Emma (Admin)
**Body:**
```json
{ "state": "Completed" }
```

**Expected response (400):**
```json
{
  "errors": [{ "field": "reason", "code": "RequiredFieldMissing", "message": "Reason is required for overrides." }]
}
```

---

## TC-023 — List Bookings (StandardUser Scoped)

**Endpoint:** `GET /bookings`
**Auth:** Alice (StandardUser)

**Expected response (200):** Only Alice's bookings — no other users' bookings visible.

---

## TC-024 — List Bookings (Admin Sees All)

**Endpoint:** `GET /bookings`
**Auth:** Emma (Admin)

**Expected response (200):** All bookings across all users with pagination.

---

## TC-025 — Get Eligible Users (Admin)

**Endpoint:** `GET /eligible-users`
**Auth:** Emma (Admin)

**Expected response (200):** All 4 eligible EV user records.

---

## TC-026 — Get Eligible Users (StandardUser Sees Only Own)

**Endpoint:** `GET /eligible-users`
**Auth:** Alice (StandardUser)

**Expected response (200):** Only Alice's eligible user record.

---

## TC-027 — Get Sessions (Paginated)

**Endpoint:** `GET /sessions?page=1&limit=10`
**Auth:** Emma (Admin)

**Expected response (200):**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

---

## TC-028 — Get Notifications (InApp)

**Endpoint:** `GET /notifications`
**Auth:** Alice

**Expected response (200):** InApp notifications for Alice only.

---

## TC-029 — Get Unread Count

**Endpoint:** `GET /notifications/unread-count`
**Auth:** Alice

**Expected response (200):** `{ "count": <number> }`

---

## TC-030 — Mark Notification Read

**Endpoint:** `PUT /notifications/{notificationId}/read`
**Auth:** Alice (owner of notification)

**Expected response (200):** Notification with `readAt` set.

---

## TC-031 — Get Summary Report

**Endpoint:** `GET /reports/summary`
**Auth:** Emma (Admin)

**Expected response (200):**
```json
{
  "data": {
    "totalSessions": 50,
    "totalEnergyKwh": <number>,
    "totalCo2SavedKg": <number>,
    "uniqueUsers": <number>,
    "noShowRate": <decimal>
  },
  "simulatedDataLabel": "Based on simulated demo data"
}
```

---

## TC-032 — Get AI Insights (High Confidence)

**Endpoint:** `GET /ai/insights`
**Auth:** Emma (Admin)

**Expected response (200):**
```json
{
  "nlSummary": "In the selected period (based on simulated demo data), 50 charging sessions...",
  "confidence": "High",
  "demandForecast": [...],
  "patterns": [...],
  "recommendations": [...],
  "grounding": { "sessionCount": 50, ... }
}
```

---

## TC-033 — Get Audit Logs (Admin)

**Endpoint:** `GET /audit-logs`
**Auth:** Emma (Admin)

**Expected response (200):** All audit log entries with pagination.

---

## TC-034 — Get Audit Logs (Security — Filtered)

**Endpoint:** `GET /audit-logs`
**Auth:** Carol (Security)

**Expected response (200):** Only Booking/Charger/MaintenanceBlock/Csms entity type entries.

---

## TC-035 — Create Maintenance Block

**Endpoint:** `POST /maintenance-blocks`
**Auth:** Dave (Workplace)
**Body:**
```json
{
  "chargerId": "<uuid>",
  "startTime": "<tomorrow T06:00:00Z>",
  "reason": "Scheduled power maintenance"
}
```

**Expected response (201):** Created block with charger status updated to BlockedForMaintenance.

---

## TC-036 — Remove Maintenance Block

**Endpoint:** `DELETE /maintenance-blocks/{blockId}`
**Auth:** Dave (Workplace)

**Expected response (200):** Block removed, charger status reverted to Available.

---

## TC-037 — Get System Config (Admin)

**Endpoint:** `GET /config`
**Auth:** Emma (Admin)

**Expected response (200):** All 9 config key-value pairs.

---

## TC-038 — Update System Config

**Endpoint:** `PUT /config`
**Auth:** Emma (Admin)
**Body:**
```json
{
  "updates": [
    { "key": "GRACE_PERIOD_MINUTES", "value": "10" }
  ]
}
```

**Expected response (200):** Updated config list.

---

## TC-039 — Update System Config (Invalid Key)

**Endpoint:** `PUT /config`
**Auth:** Emma (Admin)
**Body:**
```json
{
  "updates": [{ "key": "UNKNOWN_KEY", "value": "99" }]
}
```

**Expected response (400):**
```json
{
  "errors": [{ "field": "key", "code": "ValidationFailed", "message": "Unknown config key: UNKNOWN_KEY." }]
}
```

---

## TC-040 — Unauthenticated Request to Protected Endpoint

**Endpoint:** `GET /bookings`
**Auth:** None

**Expected response (401)**

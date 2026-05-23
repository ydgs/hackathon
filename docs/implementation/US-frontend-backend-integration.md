# Frontend-Backend Integration — Implementation Notes

## Status
Implemented

## Summary

Wired all frontend service files from mock data to the real ASP.NET Core API.
Previously every service had `USE_MOCKS = true` and returned hardcoded data.
After this change every service calls the real backend through the Vite dev proxy.

## Changes Made

### Backend
- `backend/hackathon.API/Properties/launchSettings.json` — changed dev port from 5293 to 5000 to match the address documented in `docs/architecture.md` and the frontend `apiClient.ts`.

### Frontend
- `frontend/vite.config.ts` — added Vite dev proxy: `/api/*` and `/health` proxied to `http://localhost:5000`. Eliminates CORS issues in development.
- `frontend/src/services/apiClient.ts` — changed `BASE_URL` from `http://localhost:5000/api/v1` to relative path `/api/v1`. Reads optional `VITE_API_BASE_URL` env var for staging/production. Added `patch` method.
- `frontend/src/hooks/useAuth.ts` — updated `DEMO_ACCOUNTS` to use real backend seed credentials (`alice@nexlevel.mu`, password `demo1234`) matching `DataSeeder.cs`. Removed mock `user` objects (full user is now fetched from `GET /auth/me` after login).
- `frontend/src/pages/LoginPage.tsx` — login flow now: (1) `POST /auth/login` → store JWT, (2) `GET /auth/me` → get full `CurrentUser` with eligibility + privacy, (3) persist to auth context. Updated demo account labels and password hint text.
- `frontend/src/pages/PrivacyPage.tsx` — `handleAcknowledge` now calls real `POST /api/v1/privacy-notice/acknowledge`. Handles `AlreadyAcknowledged` (409) gracefully — treated as success. Renamed `MOCK_PRIVACY_CONTENT` to `PRIVACY_CONTENT_V1`.
- `frontend/src/pages/admin/MaintenancePage.tsx` — loads charger list from `GET /chargers`. Creates/removes blocks via `POST/DELETE /maintenance-blocks`. Uses correct backend field name `forceReleaseExistingBookings`.
- `frontend/src/services/auth.service.ts` — removed mock mode; `login()` stores JWT, `logout()` calls API then clears localStorage, `getMe()` calls real endpoint.
- `frontend/src/services/booking.service.ts` — removed mock mode; all booking operations call real API. `operatorReleaseBooking` maps to `PUT /bookings/{id}/release` (same endpoint, operator role context).
- `frontend/src/services/charger.service.ts` — removed mock mode; real API calls.
- `frontend/src/services/notification.service.ts` — removed mock mode; real API calls.
- `frontend/src/services/report.service.ts` — removed mock mode; all 5 report endpoints + AI insights use real API.
- `frontend/src/services/user.service.ts` — removed mock mode; eligible user CRUD uses real API.
- `frontend/src/services/audit.service.ts` — removed mock mode; uses real `GET /audit-logs` endpoint.

## APIs Consumed

| Service | Endpoint |
|---------|----------|
| login | `POST /api/v1/auth/login` |
| getMe | `GET /api/v1/auth/me` |
| logout | `POST /api/v1/auth/logout` |
| getChargers | `GET /api/v1/chargers` |
| getCharger | `GET /api/v1/chargers/{id}` |
| updateChargerStatus | `PUT /api/v1/chargers/{id}/status` |
| getBookings | `GET /api/v1/bookings` |
| getBooking | `GET /api/v1/bookings/{id}` |
| createBooking | `POST /api/v1/bookings` |
| cancelBooking | `PUT /api/v1/bookings/{id}/cancel` |
| releaseBooking | `PUT /api/v1/bookings/{id}/release` |
| operatorReleaseBooking | `PUT /api/v1/bookings/{id}/release` (same endpoint) |
| overrideBooking | `PUT /api/v1/bookings/{id}/override` |
| getNotifications | `GET /api/v1/notifications` |
| getUnreadCount | `GET /api/v1/notifications/unread-count` |
| markNotificationRead | `PUT /api/v1/notifications/{id}/read` |
| getNotificationAudit | `GET /api/v1/notifications/audit` |
| getReportSummary | `GET /api/v1/reports/summary` |
| getReportSessions | `GET /api/v1/reports/sessions` |
| getReportEnergy | `GET /api/v1/reports/energy` |
| getReportUtilization | `GET /api/v1/reports/utilization` |
| getReportSustainability | `GET /api/v1/reports/sustainability` |
| getAiInsights | `GET /api/v1/ai/insights` |
| getEligibleUsers | `GET /api/v1/eligible-users` |
| getEligibleUser | `GET /api/v1/eligible-users/{id}` |
| createEligibleUser | `POST /api/v1/eligible-users` |
| updateEligibleUser | `PUT /api/v1/eligible-users/{id}` |
| deleteEligibleUser | `DELETE /api/v1/eligible-users/{id}` |
| getAuditLogs | `GET /api/v1/audit-logs` |
| acknowledgePrivacy | `POST /api/v1/privacy-notice/acknowledge` |
| createMaintenanceBlock | `POST /api/v1/maintenance-blocks` |
| removeMaintenanceBlock | `DELETE /api/v1/maintenance-blocks/{id}` |

## Demo Credentials (real backend accounts)

All passwords: `demo1234`

| Account | Email | Role |
|---------|-------|------|
| Alice | alice@nexlevel.mu | StandardUser (eligible, privacy acked) |
| Bob | bob@nexlevel.mu | StandardUser (eligible, privacy NOT acked) |
| Emma | emma@nexlevel.mu | Admin |
| Carol | carol@nexlevel.mu | Security |
| Dave | dave@nexlevel.mu | Workplace |
| Frank | frank@nexlevel.mu | ReportingESGViewer |
| Grace | grace@nexlevel.mu | Management |

## How to Start

```bash
# Terminal 1 — Backend
cd backend/hackathon.API
dotnet run
# API available at http://localhost:5000
# Swagger at http://localhost:5000/swagger

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# Frontend at http://localhost:5173
# All /api/* requests proxied to http://localhost:5000
```

## How to Test

1. Start both backend and frontend (see above)
2. Open http://localhost:5173
3. Click "Alice (User)" quick-select chip
4. Click "Sign In" — should redirect to dashboard
5. Verify charger status cards show real data (8 chargers, NEX Tower + NEXTERACOM)
6. Navigate to My Bookings — should show Alice's seeded bookings
7. Create a new booking as Alice — pick a future date, select an available charger, submit
8. Navigate to Reports — should show aggregated session data (50+ sessions)
9. Log in as Emma (Admin) — verify full admin menu accessible
10. Navigate to Audit Logs — should show backend audit trail

## Assumptions

1. The Vite proxy (`/api` → `http://localhost:5000`) is used in development only. In production, the frontend and backend must be served from the same origin or CORS configured for the deployment domain.
2. `operatorReleaseBooking` maps to the same `PUT /bookings/{id}/release` endpoint as `releaseBooking` — the backend already handles both owner and operator release through role checks.
3. Privacy page shows static content matching DB v1. A future enhancement would fetch content from `GET /privacy-notice` dynamically.

## Known Limitations / Technical Debt

- The booking Gantt chart's `getBookings` calls may be slow on large datasets — consider adding a `limit=200` parameter for the operations view.
- Mock files in `frontend/src/mocks/` are still present for reference but no longer imported by service files. They can be removed after QA validates the real API integration.
- The `VITE_API_BASE_URL` env var allows pointing to a different backend URL (e.g., staging). Document this in `.env.example` if deploying to staging.

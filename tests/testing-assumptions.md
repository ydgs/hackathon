# Testing Assumptions — NEXLevel Charge Platform

**Updated:** 2026-05-23

---

## Mock Data Assumptions

All frontend services use `USE_MOCKS = true`. This means:

1. **auth.service.ts** — Login is validated against `DEMO_ACCOUNTS` in `useAuth.ts`. Password must be `demo-password` for all accounts.
2. **booking.service.ts** — Bookings served from `MOCK_BOOKINGS` in `src/mocks/bookings.mock.ts`. Create/cancel/release mutates in-memory array only (resets on page reload).
3. **charger.service.ts** — Chargers served from `MOCK_CHARGERS`. Status changes are in-memory only.
4. **notification.service.ts** — Notifications from `MOCK_NOTIFICATIONS`. Mark-read is in-memory only.
5. **report.service.ts** — All report data is from mock constants. AI insights from `MOCK_AI_INSIGHTS`.
6. **user.service.ts** — Eligible users from `MOCK_ELIGIBLE_USERS`. CRUD is in-memory only.

**Implication:** All data resets on page reload. Multi-tab testing will not share state.

---

## Demo Account Assumptions

| Account | Role | Privacy Ack | Eligibility | Purpose |
|---|---|---|---|---|
| Alice Standard | StandardUser | YES | Active (Tesla Model 3) | Main user journey |
| Bob Driver | StandardUser | YES | Active (Renault Zoe, NexTower only) | Secondary user |
| Carol Admin | Admin | YES | None | Operations, reports, admin |
| Dan Security | Security | YES | None | Operator release, charger status |
| Eve NewUser | StandardUser | NO | Active (Nissan Leaf) | Privacy gate demonstration |

---

## API Contract Assumptions

- All field names match `api-contract.md` exactly (camelCase)
- `csmsSyncStatus` values: `AuthorizationPending | Authorized | AuthorizationFailed | Revoked`
- Booking `state` values: `Pending | Confirmed | Active | Completed | Cancelled | Released | NoShow | Overridden`
- Charger `status` values: `Available | Reserved | Charging | BlockedForMaintenance | Unavailable | Faulted`
- `UserPrivacy.acknowledgedVersion` and `acknowledgedAt` can be `null` for never-acknowledged users (frontend type updated to reflect this)

---

## Backend Dependency Assumptions

- Backend is NOT yet implemented beyond placeholder WeatherForecastController
- All test cases in `ui-test-cases.md` run in mock mode
- When backend endpoints are available, `USE_MOCKS` must be flipped to `false` in each service file
- CSMS simulator at `http://localhost:3000` is not required for frontend mock-mode testing

---

## Privacy Flow Assumptions

- `PrivacyPage.handleAcknowledge()` calls `acknowledgePrivacy('v1', timestamp)` from auth context after mock delay
- Privacy version `'v1'` is hardcoded on the client — must be fetched from backend `GET /privacy-notice` when available
- `RequirePrivacyAck` guard at route level handles both `privacy === null` and `privacy.hasAcknowledgedCurrentVersion === false` cases

---

## Routing Assumptions

- `/privacy` is accessible both pre- and post-auth (in `AuthLayout` without `RequireAuth` wrapper)
- Role-based routes (`/admin/*`, `/operations/*`, `/reports`) redirect to `/dashboard` on unauthorized access (not to 403 page)
- `RequireEligibility` redirects to `/dashboard` — no specific "not eligible" error page

---

## Multi-Date Booking Assumptions

- `BOOKING_WINDOW_DAYS = 14` hardcoded on both `BookingNewPage` and `OperationsBookingsPage` — should match backend `SystemConfig.bookingWindowDays` when backend is ready
- `daysFromToday(n)` in `bookings.mock.ts` uses the runtime machine clock — future-date mock bookings (bk-007 to bk-010) stay relative to current date
- Past-hour cutoff on `BookingNewPage` only applies for "today" bookings — all hours are selectable for future dates
- `booking.service.ts` mock now correctly filters by `dateFrom`/`dateTo` parameters (was previously unfiltered)

---

## Known Gaps / Technical Debt to Track

- [ ] `GET /privacy-notice` endpoint not implemented — PrivacyPage uses hardcoded mock content
- [ ] `POST /privacy-notice/acknowledge` not implemented — mock delay only
- [ ] `GET /chargers` 5s polling interval defined in UI but charger service polling is not implemented (manual refresh only via page reload)
- [ ] Booking conflict detection on `BookingNewPage` is client-side only — backend must re-validate
- [ ] `AuditPage` reads directly from `MOCK_AUDIT_LOGS` array — not using `audit.service.ts` pattern
- [ ] Admin `ConfigPage` saves to component state only — no persistence
- [ ] `MaintenancePage` blocks saved in component state only — no persistence
- [ ] `BookingNewPage` fair-use hint "60 minutes available today" is static — does not check selected-date bookings from mock/API

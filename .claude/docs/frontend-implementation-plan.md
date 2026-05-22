# Frontend Implementation Plan — AI-Powered EV Charging Orchestration Platform

**Date:** 2026-05-22
**Author:** Frontend Developer Agent
**Sources:** `functional-requirements.md` v1.4, `user-journeys.md`, `api-contract.md`, `ui-ux-spec.md`
**Stack:** React (TypeScript), plain CSS with CSS modules, Vite, `fetch`-based API client

---

## 1. Overview

This plan covers the React (TypeScript) frontend for the AI-Powered EV Charging Orchestration Platform hackathon MVP. The P0 flow — login, privacy acknowledgement, charger availability dashboard, booking creation, and booking confirmation — must be complete and demo-ready by hour 8. P1 features (notifications, full reporting, admin operations: eligible-user management, maintenance blocks, audit log, charger status control) must be layered by hour 13. The P2 responsible AI insights panel is implemented from hour 14 if P1 is stable, with a hard code freeze at hour 15. All screens, field names, error codes, and response shapes are taken exactly from `api-contract.md`; no field is renamed for UI convenience.

---

## 2. Frontend Project Structure

```
frontend/
├── public/
│   └── favicon.ico                  (EV/charging bolt theme)
├── src/
│   ├── main.tsx                     (Vite entry point)
│   ├── App.tsx                      (router root, AuthProvider wrap)
│   │
│   ├── api/                         (API client layer — one file per resource)
│   │   ├── apiClient.ts             (fetch wrapper: base URL, auth header, error shape)
│   │   ├── auth.ts                  (POST /auth/login, POST /auth/logout, GET /auth/me)
│   │   ├── privacy.ts               (GET /privacy-notice, POST /privacy-notice/acknowledge)
│   │   ├── chargers.ts              (GET /chargers, GET /chargers/:id, PUT /chargers/:id/status)
│   │   ├── bookings.ts              (GET /bookings, POST /bookings, GET /bookings/:id,
│   │   │                             PUT /bookings/:id/cancel, PUT /bookings/:id/release,
│   │   │                             PUT /bookings/:id/override)
│   │   ├── sessions.ts              (GET /sessions, GET /sessions/:id)
│   │   ├── notifications.ts         (GET /notifications, GET /notifications/unread-count,
│   │   │                             PUT /notifications/:id/read, GET /notifications/audit)
│   │   ├── reports.ts               (GET /reports/summary, /sessions, /energy,
│   │   │                             /utilization, /sustainability)
│   │   ├── aiInsights.ts            (GET /ai/insights)
│   │   ├── auditLogs.ts             (GET /audit-logs)
│   │   ├── eligibleUsers.ts         (GET /eligible-users, GET /eligible-users/:id,
│   │   │                             POST /eligible-users, PUT /eligible-users/:id,
│   │   │                             DELETE /eligible-users/:id)
│   │   ├── maintenanceBlocks.ts     (POST /maintenance-blocks, DELETE /maintenance-blocks/:id)
│   │   ├── config.ts                (GET /config, PUT /config)
│   │   └── __mocks__/              (mock fixtures matching api-contract.md shapes exactly)
│   │       ├── chargers.mock.ts
│   │       ├── bookings.mock.ts
│   │       ├── notifications.mock.ts
│   │       ├── reports.mock.ts
│   │       ├── eligibleUsers.mock.ts
│   │       └── aiInsights.mock.ts
│   │
│   ├── types/                       (TypeScript interfaces matching api-contract.md)
│   │   ├── auth.ts                  (LoginRequest, LoginResponse, MeResponse, UserRole)
│   │   ├── charger.ts               (Charger, ChargerStatus, ActiveSession)
│   │   ├── booking.ts               (Booking, BookingState, CsmsSyncStatus, CreateBookingRequest)
│   │   ├── session.ts               (ChargingSession, SessionState)
│   │   ├── notification.ts          (Notification, NotificationAuditItem, TriggerEvent, Channel,
│   │   │                             DeliveryStatus, Severity)
│   │   ├── report.ts                (SummaryReport, SessionsReport, EnergyReport,
│   │   │                             UtilizationReport, SustainabilityReport)
│   │   ├── aiInsights.ts            (AiInsightsResponse, DemandForecastBucket, Pattern,
│   │   │                             Anomaly, Recommendation, Grounding)
│   │   ├── auditLog.ts              (AuditLogEntry)
│   │   ├── eligibleUser.ts          (EligibleUser, EligibilityStatus, SiteContext)
│   │   ├── maintenanceBlock.ts      (MaintenanceBlock, CreateMaintenanceBlockRequest)
│   │   ├── config.ts                (ConfigItem, UpdateConfigRequest)
│   │   ├── privacy.ts               (PrivacyNotice, AcknowledgeRequest)
│   │   ├── pagination.ts            (PaginatedResponse, Pagination)
│   │   └── error.ts                 (ApiError, ApiErrorItem)
│   │
│   ├── context/                     (shared React context)
│   │   ├── AuthContext.tsx          (currentUser, token, login(), logout(), refresh())
│   │   └── NotificationContext.tsx  (unreadCount, refreshUnreadCount())
│   │
│   ├── hooks/                       (custom hooks, one per domain concern)
│   │   ├── useAuth.ts               (reads AuthContext)
│   │   ├── useChargers.ts           (fetches + polls GET /chargers every 5s)
│   │   ├── useBookings.ts           (fetches GET /bookings with filters)
│   │   ├── useNotifications.ts      (fetches GET /notifications)
│   │   ├── useUnreadCount.ts        (fetches GET /notifications/unread-count)
│   │   ├── useReports.ts            (fetches report endpoints)
│   │   ├── useAiInsights.ts         (fetches GET /ai/insights)
│   │   ├── useEligibleUsers.ts      (fetches GET /eligible-users)
│   │   ├── useAuditLogs.ts          (fetches GET /audit-logs)
│   │   └── useConfig.ts             (fetches GET /config)
│   │
│   ├── pages/                       (one file per route)
│   │   ├── LoginPage.tsx            (/login)
│   │   ├── PrivacyPage.tsx          (/privacy)
│   │   ├── DashboardPage.tsx        (/dashboard)
│   │   ├── BookingFormPage.tsx      (/bookings/new)
│   │   ├── BookingDetailPage.tsx    (/bookings/:id)
│   │   ├── MyBookingsPage.tsx       (/my-bookings)
│   │   ├── OperationsBookingsPage.tsx (/operations/bookings)
│   │   ├── NotificationsPage.tsx    (/notifications)
│   │   ├── ReportsPage.tsx          (/reports)
│   │   ├── AiInsightsPage.tsx       (/reports/ai)
│   │   ├── admin/
│   │   │   ├── NotificationAuditPage.tsx  (/admin/notifications)
│   │   │   ├── EligibleUsersPage.tsx      (/admin/users)
│   │   │   ├── EligibleUserFormPage.tsx   (/admin/users/new and /admin/users/:id/edit)
│   │   │   ├── MaintenancePage.tsx        (/admin/maintenance)
│   │   │   ├── AuditLogPage.tsx           (/admin/audit)
│   │   │   └── ConfigPage.tsx             (/admin/config)
│   │   ├── ProfilePage.tsx          (/profile)
│   │   └── NotFoundPage.tsx         (/404 and catch-all)
│   │
│   ├── components/                  (reusable components)
│   │   ├── layout/
│   │   │   ├── NavBar.tsx
│   │   │   └── RoleGate.tsx
│   │   ├── charger/
│   │   │   └── ChargerCard.tsx
│   │   ├── booking/
│   │   │   ├── BookingStateBadge.tsx
│   │   │   ├── CsmsSyncBadge.tsx
│   │   │   └── DailyCapIndicator.tsx
│   │   ├── notification/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationItem.tsx
│   │   ├── reporting/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── PeakHoursChart.tsx
│   │   │   ├── ChargerRankingList.tsx
│   │   │   ├── LocationComparisonTable.tsx
│   │   │   └── SimulatedDataBanner.tsx
│   │   ├── ai/
│   │   │   └── AiInsightCard.tsx
│   │   └── shared/
│   │       ├── StatusBadge.tsx
│   │       ├── Toast.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── ReasonModal.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBanner.tsx
│   │       ├── FilterBar.tsx
│   │       ├── PaginationControls.tsx
│   │       ├── Breadcrumb.tsx
│   │       └── PrivacyNoticeModal.tsx
│   │
│   ├── styles/
│   │   ├── tokens.css               (design tokens: colours, spacing, typography)
│   │   ├── global.css               (reset, body, base element styles)
│   │   └── *.module.css             (colocated CSS modules per component/page)
│   │
│   ├── guards/                      (route guard components)
│   │   ├── RequireAuth.tsx
│   │   ├── RequireRole.tsx
│   │   ├── RequirePrivacyAck.tsx
│   │   └── RequireEligibility.tsx
│   │
│   └── utils/
│       ├── dateTime.ts              (UTC → UTC+4 conversion, ISO 8601 helpers)
│       ├── errorHelpers.ts          (map errors[] to field-level messages)
│       └── constants.ts             (API_BASE_URL, POLL_INTERVAL_MS = 5000)
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── .env.example                     (VITE_API_BASE_URL, VITE_USE_MOCKS)
```

---

## 3. Page / Component Breakdown

### Pages

| # | Screen | Route | Purpose | Key Child Components | API Endpoints Consumed | FR IDs |
|---|---|---|---|---|---|---|
| 1 | LoginPage | `/login` | Authenticate via seeded accounts | — | `POST /auth/login` | FR-AUTH-001, FR-AUTH-002 |
| 2 | PrivacyPage | `/privacy` | Read and acknowledge privacy notice | `PrivacyNoticeModal`, `ErrorBanner`, `LoadingSkeleton` | `GET /privacy-notice`, `POST /privacy-notice/acknowledge` | FR-PRIV-001..004 |
| 3 | DashboardPage | `/dashboard` | Real-time charger availability grid | `NavBar`, `FilterBar`, `ChargerCard`, `LoadingSkeleton`, `EmptyState`, `ErrorBanner` | `GET /chargers` (polled every 5s) | FR-DASH-001..007, FR-BOOK-001 |
| 4 | BookingFormPage | `/bookings/new` | Create a booking | `DailyCapIndicator`, `ErrorBanner`, `Toast`, `RoleGate` | `POST /bookings`, `GET /auth/me` | FR-BOOK-002..006, FR-BOOK-013 |
| 5 | BookingDetailPage | `/bookings/:id` | Full booking detail + linked session | `BookingStateBadge`, `CsmsSyncBadge`, `ConfirmDialog`, `ReasonModal`, `ErrorBanner`, `LoadingSkeleton` | `GET /bookings/:id`, `PUT /bookings/:id/cancel`, `PUT /bookings/:id/release`, `PUT /bookings/:id/override` | FR-BOOK-007..010, FR-OCPP-007 |
| 6 | MyBookingsPage | `/my-bookings` | List and manage own bookings | `BookingStateBadge`, `CsmsSyncBadge`, `PaginationControls`, `FilterBar`, `EmptyState`, `LoadingSkeleton`, `ConfirmDialog`, `ReasonModal` | `GET /bookings` | FR-BOOK-007..008, FR-BOOK-011 |
| 7 | OperationsBookingsPage | `/operations/bookings` | Today's bookings for operators | `BookingStateBadge`, `CsmsSyncBadge`, `FilterBar`, `ReasonModal`, `EmptyState`, `LoadingSkeleton` | `GET /bookings` (with date filter = today), `PUT /bookings/:id/release`, `PUT /bookings/:id/override`, `PUT /chargers/:id/status` | FR-BOOK-009..010, FR-BOOK-012, FR-DASH-006 |
| 8 | NotificationsPage | `/notifications` | In-app notification feed | `NotificationItem`, `PaginationControls`, `EmptyState`, `LoadingSkeleton` | `GET /notifications`, `PUT /notifications/:id/read` | FR-REM-007, FR-REM-014..015 |
| 9 | ReportsPage | `/reports` | Reporting & sustainability dashboard | `KpiCard`, `FilterBar`, `PeakHoursChart`, `ChargerRankingList`, `LocationComparisonTable`, `SimulatedDataBanner`, `LoadingSkeleton`, `EmptyState` | `GET /reports/summary`, `GET /reports/sessions`, `GET /reports/energy`, `GET /reports/utilization`, `GET /reports/sustainability` | FR-REP-001..014 |
| 10 | AiInsightsPage | `/reports/ai` | Grounded AI insights panel | `AiInsightCard`, `SimulatedDataBanner`, `LoadingSkeleton`, `EmptyState`, `ErrorBanner` | `GET /ai/insights` | FR-AI-001..011 |
| 11 | NotificationAuditPage | `/admin/notifications` | Cross-user, cross-channel notification history | `FilterBar`, `PaginationControls`, `EmptyState`, `LoadingSkeleton`, `StatusBadge` | `GET /notifications/audit` | FR-REM-016, FR-REM-019 |
| 12 | EligibleUsersPage | `/admin/users` | Admin CRUD; Security/Workplace read-only | `FilterBar`, `PaginationControls`, `EmptyState`, `LoadingSkeleton`, `ConfirmDialog`, `StatusBadge` | `GET /eligible-users`, `DELETE /eligible-users/:id`, `PUT /eligible-users/:id` (suspend/activate) | FR-USER-001..006 |
| 13 | EligibleUserFormPage | `/admin/users/new`, `/admin/users/:id/edit` | Create or edit an eligible EV user | `ErrorBanner`, `Toast` | `POST /eligible-users`, `PUT /eligible-users/:id`, `GET /eligible-users/:id` | FR-USER-003, FR-USER-006 |
| 14 | MaintenancePage | `/admin/maintenance` | Create and remove maintenance blocks | `EmptyState`, `LoadingSkeleton`, `ConfirmDialog`, `ReasonModal`, `Toast`, `ErrorBanner` | `POST /maintenance-blocks`, `DELETE /maintenance-blocks/:id` | FR-ADMIN-001..003, FR-OCPP-011 |
| 15 | AuditLogPage | `/admin/audit` | Read-only audit trail | `FilterBar`, `PaginationControls`, `EmptyState`, `LoadingSkeleton` | `GET /audit-logs` | FR-AUDIT-001..005 |
| 16 | ConfigPage | `/admin/config` | Edit runtime config values | `ErrorBanner`, `Toast` | `GET /config`, `PUT /config` | §9.12 |
| 17 | ProfilePage | `/profile` | Standard User self-view and vehicle update | `Toast`, `ErrorBanner` | `GET /auth/me`, `PUT /eligible-users/:id` (vehicle fields only) | FR-USER-005..006 |
| 18 | NotFoundPage | `/404` (catch-all) | Friendly not-found screen | — | — | — |

### Shared / Reusable Components

| Component | Location | Purpose |
|---|---|---|
| `NavBar` | `components/layout/NavBar.tsx` | Responsive top nav; role-conditional items; notification bell with badge; hamburger on mobile |
| `RoleGate` | `components/layout/RoleGate.tsx` | Renders children only when `currentUser.role` is in `allowedRoles[]` |
| `ChargerCard` | `components/charger/ChargerCard.tsx` | Grid card per charger on dashboard; masking for non-admin roles |
| `StatusBadge` | `components/shared/StatusBadge.tsx` | Colour-coded pill for `ChargerStatus`, `BookingState`, `SessionState`, `csmsSyncStatus`, `deliveryStatus` — uses accessible palette from ui-ux-spec.md |
| `BookingStateBadge` | `components/booking/BookingStateBadge.tsx` | Specialised StatusBadge for booking states |
| `CsmsSyncBadge` | `components/booking/CsmsSyncBadge.tsx` | `Authorized` green check / `AuthorizationPending` yellow spinner / `AuthorizationFailed` red warning / `Revoked` grey |
| `DailyCapIndicator` | `components/booking/DailyCapIndicator.tsx` | Shows remaining daily minutes as informational text |
| `Toast` | `components/shared/Toast.tsx` | Auto-dismissing; 3s Info, 5s Warning, manual close for Critical; max 3 simultaneous |
| `ConfirmDialog` | `components/shared/ConfirmDialog.tsx` | Modal for destructive action confirmation |
| `ReasonModal` | `components/shared/ReasonModal.tsx` | Variant of ConfirmDialog with mandatory reason textarea |
| `NotificationBell` | `components/notification/NotificationBell.tsx` | Nav icon with unread badge; fetches `GET /notifications/unread-count` on mount and tab focus |
| `NotificationItem` | `components/notification/NotificationItem.tsx` | Single row in notification list with severity left border |
| `SimulatedDataBanner` | `components/reporting/SimulatedDataBanner.tsx` | Amber banner rendering `simulatedDataLabel` verbatim when non-null |
| `KpiCard` | `components/reporting/KpiCard.tsx` | Single metric tile |
| `PeakHoursChart` | `components/reporting/PeakHoursChart.tsx` | Bar chart from `data.peakHourDistribution` array of `{ hour, sessionCount }` |
| `ChargerRankingList` | `components/reporting/ChargerRankingList.tsx` | Horizontal bar list from `data.chargerRanking` |
| `LocationComparisonTable` | `components/reporting/LocationComparisonTable.tsx` | Side-by-side from `data.locationComparison` with `NEX-TOWER` and `NEXTERACOM` keys |
| `AiInsightCard` | `components/ai/AiInsightCard.tsx` | NL summary / pattern / anomaly / recommendation card with grounding block |
| `PrivacyNoticeModal` | `components/shared/PrivacyNoticeModal.tsx` | Full-screen modal rendering `content` (Markdown) with "I Acknowledge" button |
| `LoadingSkeleton` | `components/shared/LoadingSkeleton.tsx` | Shimmer in `card`, `row`, `kpi` variants; static fill under `prefers-reduced-motion` |
| `EmptyState` | `components/shared/EmptyState.tsx` | Centred icon + title + description + optional CTA |
| `ErrorBanner` | `components/shared/ErrorBanner.tsx` | Full-width inline banner; `role="alert"`; shows `message` and `traceId`; retry button |
| `FilterBar` | `components/shared/FilterBar.tsx` | Location radio + date range; `dashboard`, `reports`, `bookings` variants |
| `PaginationControls` | `components/shared/PaginationControls.tsx` | Prev/next + "Page N of M" from `pagination` object |
| `Breadcrumb` | `components/shared/Breadcrumb.tsx` | Back chevron pattern for detail pages |

---

## 4. State Management Approach

**Approach: React Context + local component state + custom hooks. No external state library.**

Justification: The dataset is small (≤50 chargers, ≤300 bookings, ≤10 config keys). Global state needs are limited to auth context and notification unread count. Adding Redux or Zustand would be over-engineering for a 16-hour hackathon and risks wasting time on boilerplate.

### What lives where

| Concern | Mechanism | Location |
|---|---|---|
| Auth token, current user, role | `AuthContext` + `localStorage` | `context/AuthContext.tsx` |
| Notification unread count | `NotificationContext` | `context/NotificationContext.tsx` |
| Charger list (polled) | `useChargers` hook — local state per page | `hooks/useChargers.ts` |
| Booking list / detail | `useBookings` hook — local state per page | `hooks/useBookings.ts` |
| Report data | `useReports` hook — local state on ReportsPage | `hooks/useReports.ts` |
| Form field state | `useState` inside each form component | Individual page files |
| Dialog/modal open state | `useState` inside parent component | Individual page files |
| Loading / error / success per API call | `useState` (`isLoading`, `error`, `data`) inside each hook | Individual hook files |

**Server state:** All list and detail data is fetched on mount (or on relevant filter change). There is no global cache or optimistic update (forbidden for booking state transitions per api-contract.md §12.4). The one exception is `PUT /notifications/:id/read` which may optimistically flip `readState` in the local list.

**Polling:** Only `GET /chargers` is polled (5-second interval via `setInterval` in `useChargers`). `GET /notifications/unread-count` is fetched on app load and on `visibilitychange` (tab focus). No other polling.

---

## 5. API Client Approach

### Structure

- `src/api/apiClient.ts` — single `fetch` wrapper handling: base URL from `VITE_API_BASE_URL`, `Authorization: Bearer <token>` header from `localStorage`, `Content-Type: application/json`, and uniform error handling against the `{ message, errors[], traceId }` shape from api-contract.md §7.
- One module per resource (`chargers.ts`, `bookings.ts`, etc.) exporting typed async functions.
- All field names match api-contract.md exactly — no renaming.

### Illustrative snippet (not full implementation)

```typescript
// src/api/apiClient.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export interface ApiError {
  message: string;
  errors: { field?: string; code: string; message: string }[];
  traceId: string;
}

export class ApiRequestError extends Error {
  constructor(public status: number, public apiError: ApiError) {
    super(apiError.message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Unknown error', errors: [], traceId: '' }));
    throw new ApiRequestError(res.status, body as ApiError);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });
```

Resource modules then import these primitives:

```typescript
// src/api/chargers.ts
import { get, put } from './apiClient';
import type { Charger } from '../types/charger';

export const getChargers = (locationCode?: string) =>
  get<{ data: Charger[] }>(`/chargers${locationCode ? `?locationCode=${locationCode}` : ''}`);

export const updateChargerStatus = (id: string, status: string, reason: string) =>
  put<Charger>(`/chargers/${id}/status`, { status, reason });
```

---

## 6. Mock API Approach (Backend Not Ready)

### Strategy

An environment flag `VITE_USE_MOCKS=true` (set in `.env.local`) swaps each resource module's API call for an in-memory mock that returns fixture data matching the exact response shapes from api-contract.md.

- Mock fixtures live in `src/api/__mocks__/` with filenames like `chargers.mock.ts`, `bookings.mock.ts`, etc.
- Each mock function returns a resolved `Promise` with fixture data so the real hook and component code path is exercised unchanged.
- Every mock-driven code path is labelled `// MOCK: replace with GET /chargers` (or the appropriate endpoint).
- The mock swap is done at the module level in `apiClient.ts` or per-resource module using a conditional import — whichever is simplest to remove cleanly when the backend is ready.
- Fixture data satisfies the seeded-data requirements from ui-ux-spec.md (8 chargers, 6 users, 10 completed sessions, 1 active booking, privacy notice v1, config defaults).

### File example

```typescript
// src/api/__mocks__/chargers.mock.ts
// MOCK: replace with GET /chargers
export const MOCK_CHARGERS = {
  data: [
    {
      id: 'chr-001',
      externalStationId: 'NEX-TOWER-CH-01',
      displayName: 'NEX Tower Charger 1',
      connectorId: 1,
      status: 'Available',
      location: { id: 'loc-001', name: 'NEX Tower', code: 'NEX-TOWER' },
      lastCsmsSyncAt: '2026-05-22T08:14:55Z',
      activeSession: null,
    },
    // ... 7 more chargers
  ],
};
```

The frontend never blocks on the backend. If `VITE_USE_MOCKS=true`, every screen is operable from day 1 of development.

---

## 7. Styling Approach

### Strategy

- **Plain CSS with CSS Modules** — each component or page has a colocated `.module.css` file. No styled-components, no Tailwind, no heavyweight UI library. The ui-ux-spec.md does not mandate a specific library, and plain CSS is demo-safe and zero-install.
- **Design tokens** centralized in `src/styles/tokens.css` (CSS custom properties). All components consume tokens — no hardcoded hex values in component stylesheets.
- **Global reset** in `src/styles/global.css` — box-sizing, body font, remove default margins.
- **Accessible status colour palette** from ui-ux-spec.md Accessibility section is encoded directly in tokens.

### `src/styles/tokens.css` (partial — key tokens)

```css
:root {
  /* Status colours (ui-ux-spec.md §Accessibility) */
  --color-available-bg: #D1FAE5;
  --color-available-fg: #065F46;
  --color-reserved-bg: #DBEAFE;
  --color-reserved-fg: #1E40AF;
  --color-charging-bg: #FEF3C7;
  --color-charging-fg: #92400E;
  --color-maintenance-bg: #F3F4F6;
  --color-maintenance-fg: #374151;
  --color-unavailable-bg: #FEE2E2;
  --color-unavailable-fg: #991B1B;
  --color-faulted-bg: #FEE2E2;
  --color-faulted-fg: #991B1B;
  --color-info-bg: #EFF6FF;
  --color-info-fg: #1E3A8A;
  --color-warning-bg: #FFFBEB;
  --color-warning-fg: #78350F;
  --color-critical-bg: #FFF1F2;
  --color-critical-fg: #9F1239;
  --color-csms-authorized-bg: #D1FAE5;
  --color-csms-authorized-fg: #065F46;
  --color-csms-pending-bg: #FFFBEB;
  --color-csms-pending-fg: #78350F;
  --color-csms-failed-bg: #FEE2E2;
  --color-csms-failed-fg: #991B1B;
  --color-csms-revoked-bg: #F3F4F6;
  --color-csms-revoked-fg: #6B7280;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-size-body: 16px;       /* minimum for projector readability */
  --font-size-kpi: 32px;        /* KPI tile hero numbers */
  --font-weight-bold: 700;
  --line-height-body: 1.5;

  /* Border radius */
  --radius-card: 8px;
  --radius-badge: 4px;

  /* Transition */
  --transition-card: box-shadow 0.15s ease;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-card: none;
  }
}
```

---

## 8. Responsive Design Approach

### Decision: Mobile-first

The primary user (Standard EV User) accesses the app from a phone to check availability and book. Admin/operational roles use tablets or desktops. Charts are used on reporting screens only, which are typically desktop/projector views.

### Breakpoints (from ui-ux-spec.md)

| Label | Width | Layout |
|---|---|---|
| Mobile | 320px – 767px | Single column; hamburger nav; card lists (not tables); stacked forms; 1-col charger grid |
| Tablet | 768px – 1023px | Two-column layouts; simplified tables; side nav optional |
| Laptop | 1024px – 1439px | Full nav bar; 3–4 col charger grid; full tables with all columns |
| Projector | 1440px+ | Wide padding; font comfortable at 3 m distance |

### Key responsive rules

- Charger grid: `grid-template-columns: 1fr` on mobile; `repeat(2, 1fr)` on tablet; `repeat(3, 1fr)` on laptop; `repeat(4, 1fr)` on projector.
- All tables transform to stacked card lists at `< 768px`. Each card shows primary identifier, status badge, timestamp, expandable details, and full-width action buttons.
- KPI tiles: scrollable horizontal strip on mobile (2 visible); `repeat(4, 1fr)` grid on laptop+.
- Modal dialogs: full-screen on `< 768px`; centered card on tablet/desktop.
- Booking form: all inputs stack vertically on mobile; touch targets minimum 44×44 px (WCAG 2.5.5).
- `NavBar`: hamburger (`aria-expanded`) at `< 768px`; notification bell and avatar always visible.
- `SimulatedDataBanner`: always visible; compact strip on mobile.
- Form labels: above input on mobile (not inline).

### Accessibility baseline

- Semantic HTML throughout (`<nav>`, `<main>`, `<section>`, `<h1>` per page, `<button>` not `<div>`).
- Every input has a `<label>` with `htmlFor`. Required fields marked with `*` and `aria-required="true"`.
- Inline error messages wired via `aria-describedby`.
- `ErrorBanner` uses `role="alert"`. Toast uses `role="status"` (Info/success) or `role="alert"` (Warning/Critical).
- Modal dialogs trap focus; focus returns to trigger element on close.
- Charger card grid: `role="grid"` with arrow-key navigation.
- Icon-only buttons have `aria-label` per the inventory in ui-ux-spec.md §Accessibility.
- All text/interactive elements target WCAG AA (4.5:1 normal text, 3:1 large/UI).
- Status communicated by colour + label/icon (never colour alone).

---

## 9. Feature Implementation Order

### P0 — By Hour 8 (Must Have)

**Goal: End-to-end demo spine working. No blank screens. All P0 acceptance criteria pass.**

1. **Hour 0–1: Project scaffolding + shared infrastructure**
   - Vite + React + TypeScript scaffold
   - `src/styles/tokens.css` and `global.css` with the full design-token set
   - `src/api/apiClient.ts` with `get/post/put/del` + `ApiRequestError`
   - `src/types/` — all TypeScript interfaces for auth, charger, booking, pagination, error
   - `src/utils/dateTime.ts` (UTC → UTC+4), `errorHelpers.ts`, `constants.ts`
   - `.env.example` with `VITE_API_BASE_URL` and `VITE_USE_MOCKS`
   - Mock fixtures: `chargers.mock.ts`, `bookings.mock.ts`, `auth.mock.ts`
   - Dependencies: None beyond Vite + React — no external component libraries

2. **Hour 1–2: Auth flow (FR-AUTH-001..004 / US-AUTH-001)**
   - `src/api/auth.ts` — `login()`, `logout()`, `getMe()`
   - `AuthContext.tsx` + `useAuth` hook
   - `LoginPage.tsx` with Form 1 (email, password, field-level validation, 401 inline error)
   - `RequireAuth.tsx` guard
   - `RequireRole.tsx` guard
   - Shared: `Toast`, `ErrorBanner`, `LoadingSkeleton` (needed immediately by login)
   - On success: token + user stored in `localStorage` + context; redirect logic to `/privacy` or `/dashboard`

3. **Hour 2–3: Privacy acknowledgement (FR-PRIV-001..004 / US-PRIV-001..002)**
   - `src/api/privacy.ts`
   - `PrivacyPage.tsx` with `PrivacyNoticeModal` rendering markdown `content` from `GET /privacy-notice`
   - `POST /privacy-notice/acknowledge` with `{ version }` — exact field name
   - `RequirePrivacyAck.tsx` guard (reads `privacy.hasAcknowledgedCurrentVersion` from `AuthContext`)
   - Error handling: `VersionMismatch` → reload; `AlreadyAcknowledged` → silently redirect

4. **Hour 3–5: Charger availability dashboard (FR-DASH-001..007 / US-DASH-001..002)**
   - `src/api/chargers.ts`
   - `useChargers` hook with 5-second polling via `setInterval`; single failed poll suppressed; `ErrorBanner` after 3 consecutive failures
   - `DashboardPage.tsx` with responsive charger grid
   - `ChargerCard.tsx` — all status colours from tokens; `activeSession` masked as `"***"` for non-admin (renders `"***"` directly, no lookup)
   - `FilterBar.tsx` — location radio (`All` / `NEX-TOWER` / `NEXTERACOM`)
   - `StatusBadge.tsx` — covers `ChargerStatus` enum
   - `NavBar.tsx` — role-conditional items, hamburger on mobile, `NotificationBell` placeholder
   - `LoadingSkeleton` card variant (8 cards matching grid)
   - `EmptyState` with "No chargers match your filter" + Clear Filter CTA

5. **Hour 5–7: Booking creation flow (FR-BOOK-002..007, FR-BOOK-013 / US-BOOK-001..003)**
   - `src/api/bookings.ts`
   - `BookingFormPage.tsx` with Form 3: `chargerId` (from query param), `startTime`, `endTime`, `vehicleMake`, `vehicleModel`, `onBehalfOfUserId` (Workplace/Admin only), `reasonForOverride` (conditional)
   - Client-side validation: start ≥ now−1min, end > start, duration ≤ 60min for non-admin, non-empty vehicle fields
   - `DailyCapIndicator.tsx` — informational text only; no client-side booking-allow decision
   - Fair-use rule display: highlighted note "Maximum 1 hour of charging per user per day (BR002)"
   - Live "Duration: X min" label
   - Submit: spinner-on-button, disable re-submit; `POST /bookings` with exact field names
   - Booking confirmation: inspect `csmsSyncStatus` — if `AuthorizationFailed`, amber persistent warning banner with `traceId`
   - `CsmsSyncBadge.tsx`
   - `RequirePrivacyAck` + `RequireEligibility` guards on this route
   - All 409/403/400 error codes mapped to UI treatment per ui-ux-spec.md Form 3 table
   - `MyBookingsPage.tsx` stub (enough to link to from confirmation)

6. **Hour 7–8: My Bookings + Booking Detail (FR-BOOK-011, FR-BOOK-007..008 / US-BOOK-004..005)**
   - `MyBookingsPage.tsx` — `GET /bookings` with `limit=100`, table → card list on mobile, `BookingStateBadge`, `CsmsSyncBadge`, Cancel/Release/View row actions
   - `ConfirmDialog.tsx` for cancel; `ReasonModal.tsx` for release
   - `BookingDetailPage.tsx` — `GET /bookings/:id` with `chargingSession` embedded; all fields displayed
   - `PaginationControls.tsx`
   - `EmptyState` — "You have no bookings. Book a Charger" CTA
   - Demo seed data visible: at least 1 `Confirmed` booking with `csmsSyncStatus=Authorized`

**P0 Definition of Done (Hour 8 checkpoint):**
- Login with seeded Standard User (alice) → privacy ack → dashboard (8 chargers, real status) → book NEX-TOWER-CH-01 (60 min) → confirmation with green CsmsSyncBadge → My Bookings shows the booking → Cancel it → charger returns to Available
- All four states (loading, empty, success, error) present on every screen above
- Mobile layout verified at 375px width (no horizontal scroll)

---

### P1 — By Hour 13 (Should Have)

7. **Hour 8–9: Notification Center + unread badge (FR-REM-007, FR-REM-014..016 / US-REM-001..003)**
   - `src/api/notifications.ts`
   - `NotificationContext.tsx` + `useUnreadCount` hook (mount + `visibilitychange`)
   - `NotificationBell.tsx` wired to context — badge count visible at all breakpoints
   - `NotificationsPage.tsx` — in-app feed, `NotificationItem.tsx` with severity left border, relative timestamps, `readState` dot
   - `PUT /notifications/:id/read` — optimistic `readState` flip + badge decrement
   - "Mark all read" button (client-side loop)
   - `EmptyState`, `PaginationControls`, `LoadingSkeleton` row variant

8. **Hour 9–10: Reporting Dashboard (FR-REP-001..014 / US-REP-001..005)**
   - `src/api/reports.ts`
   - `ReportsPage.tsx` with internal tab bar: Overview, Sessions, Energy, Utilisation, Sustainability
   - `KpiCard.tsx` — `totalSessions` (`data.totalSessions`), `totalKwh` (`data.totalKwh`), `estimatedCo2SavingsKg` (`data.estimatedCo2SavingsKg`), `emissionFactorUsed` (`data.emissionFactorUsed`), `avgDurationMinutes` (`data.avgDurationMinutes`), `avgKwh` (`data.avgKwh`), `cancelledCount`, `noShowCount` — exact field names
   - `SimulatedDataBanner.tsx` — rendered verbatim when `simulatedDataLabel` is non-null
   - `FilterBar` variant `reports` — date range + location
   - `PeakHoursChart.tsx` — `data.peakHourDistribution` as `{ hour, sessionCount }[]`, X labels in UTC+4
   - `ChargerRankingList.tsx` — `data.chargerRanking` as `{ chargerId, displayName, sessionCount, totalKwh }[]`
   - `LocationComparisonTable.tsx` — `data.locationComparison.NEX-TOWER` and `data.locationComparison.NEXTERACOM` keys
   - `LoadingSkeleton` kpi and chart variants
   - `EmptyState` — "No charging activity in the selected period"

9. **Hour 10–11: Operational Bookings + Charger Status Control (FR-BOOK-009..012, FR-DASH-006 / US-BOOK-006, US-DASH-002)**
   - `OperationsBookingsPage.tsx` — today's bookings across all locations for Security/Workplace/Admin
   - Release (`PUT /bookings/:id/release`) and Override (`PUT /bookings/:id/override`) with `ReasonModal` — `reason` required for operator actions
   - `PUT /chargers/:id/status` with Form 7 (status select + reason) on dashboard card for Admin/Security/Workplace
   - `RequireRole` guards on `/operations/bookings`

10. **Hour 11–12: Admin — Eligible EV User Management (FR-USER-001..006 / US-USER-001..003)**
    - `EligibleUsersPage.tsx` — table with `displayName`, `workplaceRegistryEid`, `badgeId`, `eligibilityStatus`, `vehicleMake`, `vehicleModel`, `siteContext`, `privacyAcknowledgementStatus`, `lastUpdatedAt`
    - `EligibleUserFormPage.tsx` — Form 9 (create `POST /eligible-users`; edit `PUT /eligible-users/:id`)
    - Inline Suspend/Activate toggle → `PUT /eligible-users/:id` with `{ eligibilityStatus }`
    - Delete → `ConfirmDialog` → `DELETE /eligible-users/:id`
    - `ProfilePage.tsx` — Form 10 (Standard User self-view + vehicle update)
    - Field-level errors for `DuplicateEid`, `DuplicateBadge`, `DuplicateEmail`

11. **Hour 12–13: Admin — Maintenance Blocks + Audit Log + Config + Notification Audit (FR-ADMIN-001..003, FR-AUDIT-001..005 / US-ADMIN-001..002, US-AUDIT-001)**
    - `MaintenancePage.tsx` — Form 8 (`POST /maintenance-blocks`); maintenance block list with Remove action (`DELETE /maintenance-blocks/:id`); `forceReleaseExistingBookings` checkbox shown on 409 conflict
    - `AuditLogPage.tsx` — read-only table with filter bar; collapsed JSON for `beforeState`/`afterState`; no row actions
    - `ConfigPage.tsx` — Form 11 inline edit table; `PUT /config` with `{ updates: [{ key, value }] }`
    - `NotificationAuditPage.tsx` — cross-user, cross-channel feed; "Preview" button for Email/Teams payload modal; `deliveryStatus` badge
    - `RequireRole` guard on all `/admin/**` routes (Admin only, except Notification Audit and Audit Log which allow Security/Workplace with server-filtered scope)

**P1 Definition of Done (Hour 13 checkpoint):**
- All P0 screens still work
- Notification bell shows correct unread count; clicking shows notification list; mark-read works
- Reporting dashboard shows 8 KPI tiles with seeded data; simulated data banner present
- Operations can release a booking with a reason; audit log captures it
- Admin can create/edit/suspend eligible user; maintenance block create/remove works

---

### P2 — Hour 14 (Could Have, if P1 stable)

12. **Hour 14–15: AI Insights Panel (FR-AI-001..011 / US-AI-001)**
    - `src/api/aiInsights.ts`
    - `AiInsightsPage.tsx` at `/reports/ai` (tab inside Reports)
    - `AiInsightCard.tsx` — NL summary, demand forecast, patterns, anomalies, recommendations; expandable `grounding` block; `confidence` indicator; `simulatedDataLabel` banner
    - `PeakHoursChart` reused for `demandForecast` — `{ hourBucket, demandScore }[]`
    - `503 AiUnavailable` handled: render static fallback "AI insights are temporarily unavailable." — no spinner loop
    - Same filter params as reporting (`dateFrom`, `dateTo`, `locationCode`)
    - `RequireRole` guard: Admin, ReportingESGViewer, Management only

**Code freeze: Hour 15** — no new features after this point.

---

## 10. Open Questions

The following items are not fully specified in the input documents and need resolution before or during implementation:

1. **Time-series energy trend chart** — `ui-ux-spec.md` §Charts flags that `GET /reports/energy` provides hour-of-day distribution only, not date-over-date trend. A daily kWh line chart would be useful for the demo but requires a `?groupBy=day` parameter to be added to `GET /reports/energy` in the API contract. Flagged as a `> Gap:` in ui-ux-spec.md. Resolution needed before building the Energy tab chart beyond the peak-hour bar chart.

2. **Markdown rendering for privacy notice** — `GET /privacy-notice` returns `content` in Markdown. A lightweight renderer is needed (e.g., a small `marked` import or a custom Markdown-to-HTML function under 20 lines). No external renderer is pre-approved; confirm whether `marked` or `react-markdown` can be added, or if a manual renderer is preferred.

3. **Teams Adaptive Card preview renderer** — `ui-ux-spec.md` describes a "formatted preview" for Teams payload — either JSON syntax-highlighted or rendered card. No lightweight Adaptive Card renderer is specified. For MVP, JSON syntax-highlighting (a `<pre>` block with CSS) is the safe fallback. Confirm if a card renderer (e.g., `adaptivecards` npm package) is acceptable.

4. **CSMS polling on `AuthorizationPending`** — api-contract.md §12.3 states `GET /notifications/unread-count` is fetched on tab focus, not a timer. It also states `GET /chargers` is the only polled endpoint. However, if a booking is created with `csmsSyncStatus=AuthorizationPending`, the UI has no mechanism to detect when it transitions to `Authorized` or `AuthorizationFailed` without polling. Clarify whether the booking detail page should poll `GET /bookings/:id` until `csmsSyncStatus` is no longer `AuthorizationPending`, or whether the user should manually refresh.

5. **Charger polling failure threshold** — ui-ux-spec.md says show `ErrorBanner` after "3 consecutive failures" of charger polling. This is a client-side decision; no API contract clause covers it. Confirm the threshold is 3 or adjust as needed.

6. **`forceReleaseExistingBookings` field on maintenance block form** — ui-ux-spec.md Form 8 states the checkbox is "visible only if overlap detected." This implies a two-step flow: submit once, receive `409 MaintenanceBlockConflict`, then display the checkbox and re-submit with `forceReleaseExistingBookings: true`. Confirm this two-step UX is correct.

7. **`siteContext` enum casing** — api-contract.md `GET /eligible-users` lists `siteContext` filter values as `NexTower`, `Nexteracom`, `Both` (camelCase), while ui-ux-spec.md Form 9 lists `NexTower`, `Nexteracom`, `Both`. The charger endpoint uses `NEX-TOWER` and `NEXTERACOM` for `locationCode`. These are different fields. Confirm the exact string values for `siteContext` in the eligible-user resource (`NexTower` / `Nexteracom` / `Both` as per api-contract.md §9.3.1).

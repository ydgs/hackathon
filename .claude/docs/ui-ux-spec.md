# UI/UX Specification — AI-Powered EV Charging Orchestration Platform

**Status:** Authoritative hackathon spec  
**Date:** 2026-05-22  
**Sources:** `use-case-brief.md`, `functional-requirements.md`, `user-journeys.md`, `api-contract.md`  
**Audience:** Frontend Developer, QA, Demo Coach, Solution Architect

---

## Overview

The AI-Powered EV Charging Orchestration Platform is a mobile-first responsive web application that replaces manual EV charger coordination at NEX Tower and NEXTERACOM with self-service booking, real-time charger availability, CSMS-driven session tracking, sustainability reporting, and a responsible AI insights layer.

The primary employee-facing user is an eligible EV user who needs to check charger availability, reserve a one-hour slot, and receive reminders — all from a mobile device. Secondary users (Security, Workplace, Admin, Reporting/ESG Viewer) have operational and reporting needs that are best served on tablet or desktop layouts.

Hackathon UI goals: deliver a polished, demo-safe P0 flow (privacy acknowledgement → availability dashboard → booking → CSMS-driven session → reporting) by hour 8; layer P1 (notifications, full reporting, admin operations) by hour 13; add P2 AI insights by hour 14. Design principles are mobile-first, minimal click paths, zero blank screens in the demo, clear status for every charger and booking, and explicit labelling of any simulated data.

---

## Pages / Screens

| # | Screen Name | Route | Purpose | Primary User | Key Data Shown | Primary Actions | FR/Journey refs |
|---|---|---|---|---|---|---|---|
| 1 | Login | `/login` | Authenticate via seeded accounts | All | Role selector, email/password fields | Sign in | FR-AUTH-001, AC-AUTH-01 |
| 2 | Privacy Notice | `/privacy` | Read and acknowledge the current privacy notice before first booking | Standard User | Notice text (version, effective date, content) | Acknowledge | FR-PRIV-001..004, AC-PRIV-01..02 |
| 3 | Charger Availability Dashboard | `/dashboard` | Real-time view of all chargers at both sites | All | Charger cards (status, location, active session), filter bar | Book a charger, filter by location | FR-DASH-001..007, FR-BOOK-001, Happy Path 1 steps 3–4 |
| 4 | Booking Form | `/bookings/new` | Create a booking for a selected charger | Standard User, Workplace, Admin | Selected charger, time-slot picker, vehicle fields, 1h fair-use rule reminder | Submit booking, go back | FR-BOOK-002..006, FR-BOOK-013, Happy Path 1 steps 5–8 |
| 5 | Booking Confirmation | `/bookings/new/confirm` (or inline post-submit state) | Show booking result including CSMS sync status | Standard User | Booking summary, `csmsSyncStatus` badge, notification preview | View my bookings, go to dashboard | FR-OCPP-007, AC-OCPP-01..02 |
| 6 | My Bookings | `/my-bookings` | List and manage own bookings | Standard User | Booking state, charger, time window, vehicle, `csmsSyncStatus`, linked session | Cancel, Release, View detail | FR-BOOK-007..008, FR-BOOK-011 |
| 7 | Booking Detail | `/bookings/:id` | Full detail of a single booking with linked session | Standard User, Security, Workplace, Admin | All booking fields, `csmsSyncStatus`, linked charging session (state, `energyKwh`, `source`) | Cancel / Release / Override (by role), go back | FR-BOOK-007..010, section 9.5.3 |
| 8 | Operational Bookings (Today) | `/operations/bookings` | Security / Workplace / Admin view of today's bookings across both sites | Security, Workplace, Admin | All bookings for today, charger, user, state, `csmsSyncStatus` | Release / Override, filter | FR-BOOK-012, FR-BOOK-009..010 |
| 9 | Notification Center | `/notifications` | User's in-app notification feed | All | Title, body, severity badge, timestamp, channel indicator, linked booking/session/charger, read/unread | Mark read, click through to linked entity | FR-REM-007, FR-REM-014..015, AC-REM-06 |
| 10 | Notification Audit (Admin) | `/admin/notifications` | Admin / operational cross-user, cross-channel notification history with payload previews | Admin, Security, Workplace | All notification records, `channel`, `deliveryStatus`, `payload`, `correlationId` | Filter, view payload, expand Adaptive Card / email preview | FR-REM-016, FR-REM-019, AC-REM-11..12, AC-REM-16 |
| 11 | Reporting Dashboard | `/reports` | Operational and sustainability metrics | Admin, Workplace, Reporting/ESG Viewer, Management | Summary KPIs, energy, sessions, utilisation, CO₂, location comparison, `simulatedDataLabel` | Apply date-range / location filter, drill into chart | FR-REP-001..014, AC-REP-01..06 |
| 12 | AI Insights Panel | `/reports/ai` (or tab inside Reports) | Grounded NL summary, demand forecast, patterns, anomalies, recommendations | Admin, Reporting/ESG Viewer, Management | `nlSummary`, `demandForecast`, `patterns`, `anomalies`, `recommendations`, `grounding`, `confidence`, `simulatedDataLabel` | Drill into grounding metric, accept/dismiss insight | FR-AI-001..011, AC-AI-01..07 |
| 13 | Eligible EV User Management | `/admin/users` | Admin CRUD; Security/Workplace read-only view | Admin, Security, Workplace | User list: `displayName`, `workplaceRegistryEid`, `eligibilityStatus`, `vehicleMake`, `vehicleModel`, `privacyAcknowledgementStatus` | Create, Edit, Suspend/Activate, Delete, Search | FR-USER-001..006, AC-USER-01..04 |
| 14 | Eligible EV User Form | `/admin/users/new` and `/admin/users/:id/edit` | Create or update an eligible EV user record | Admin | All eligible user fields | Save, Cancel | FR-USER-003, section 9.3.3..9.3.4 |
| 15 | My Profile / Vehicle | `/profile` | Standard User self-view: eligibility status, vehicle, privacy acknowledgement status | Standard User | Own eligible-EV-user record (read-only except vehicle fields) | Update vehicle make/model | FR-USER-005..006, AC-USER-04 |
| 16 | Audit Log | `/admin/audit` | Read-only audit trail | Admin (all), Security/Workplace (operational scope) | Timestamp, actor, action, entity, before/after, reason, source | Filter by date/actor/action/entityType | FR-AUDIT-001..005, AC-AUDIT-01..03 |
| 17 | Maintenance Block Management | `/admin/maintenance` | Create and remove maintenance blocks | Admin | Active blocks: charger, start/end, reason, `isActive`; resolved blocks | Create block, Remove block | FR-ADMIN-001..003, FR-OCPP-011 |
| 18 | System Config | `/admin/config` | Edit runtime configuration values | Admin | Config key/value table: `GRACE_PERIOD_MINUTES`, `EMISSION_FACTOR_KG_PER_KWH`, `PRE_SESSION_REMINDER_MINUTES`, etc. | Edit value, Save | section 9.12 |
| 19 | 404 / Not Found | `/404` (catch-all) | Friendly not-found screen | All | Short message, link home | Go to dashboard | — |

---

## Navigation Structure

### Top-Level Navigation

The application has a single responsive top navigation bar (`NavBar` component) that adapts based on role. On mobile the nav collapses to a hamburger menu.

| Nav label | Route | Visible to |
|---|---|---|
| Dashboard | `/dashboard` | All authenticated |
| My Bookings | `/my-bookings` | Standard User |
| Operations | `/operations/bookings` | Security, Workplace, Admin |
| Reports | `/reports` | Admin, Workplace, Reporting/ESG Viewer, Management |
| Admin | Dropdown → see below | Admin only |
| Notification bell (icon button) | `/notifications` | All authenticated |
| Profile avatar | `/profile` | All authenticated |
| Logout | — (action) | All authenticated |

**Admin dropdown items:**
- Users (`/admin/users`)
- Maintenance (`/admin/maintenance`)
- Audit Log (`/admin/audit`)
- Notifications Audit (`/admin/notifications`)
- Config (`/admin/config`)

### Secondary Navigation

- The Reports page has an internal tab bar: **Overview**, **Sessions**, **Energy**, **Utilisation**, **Sustainability**, **AI Insights**.
- Booking Detail and Eligible User Detail have a `Back` chevron that returns to the originating list screen.

### Route Map (ASCII)

```
/
├── login                        (public)
├── privacy                      (auth-gated, redirected before first booking)
├── dashboard                    (all authenticated — P0)
├── bookings
│   ├── new                      (Standard User, Workplace, Admin)
│   └── :id                      (owner, Security, Workplace, Admin)
├── my-bookings                  (Standard User)
├── operations
│   └── bookings                 (Security, Workplace, Admin)
├── notifications                (all authenticated)
├── profile                      (all authenticated)
├── reports                      (Admin, Workplace, ESG Viewer, Management)
│   └── ai                       (Admin, ESG Viewer, Management — P2)
├── admin                        (Admin only)
│   ├── users
│   │   ├── new
│   │   └── :id/edit
│   ├── maintenance
│   ├── audit
│   ├── notifications
│   └── config
└── 404 (catch-all)
```

### Route Guards

| Guard | Applies to | Redirect |
|---|---|---|
| `RequireAuth` | All routes except `/login` and static assets | → `/login` |
| `RequireRole(roles)` | `/operations/bookings`, `/admin/**`, `/reports` | → `/dashboard` with a "Not authorized" toast |
| `RequirePrivacyAck` | `/bookings/new` only — checked before rendering the form | → `/privacy` with return URL |
| `RequireEligibility` | `/bookings/new` only | → `/dashboard` with a "Not eligible" inline message |

The `RequirePrivacyAck` and `RequireEligibility` guards read the `privacy.hasAcknowledgedCurrentVersion` and `eligibility.isEligible` fields from the `/auth/me` response cached in app context. If either is false the form page is blocked client-side; the backend enforces the same gates (403 `PrivacyNotAcknowledged` / `NotEligible`).

---

## Components

### Reusable Component Inventory

| Component | Intent | Key Props |
|---|---|---|
| `NavBar` | Responsive top nav with role-conditional items and notification badge | `currentUser`, `unreadCount`, `onLogout` |
| `ChargerCard` | Grid card for a single charger on the availability dashboard | `charger` (full API object), `onBook` callback, `isAdmin` (controls masking) |
| `StatusBadge` | Colour-coded pill for charger status, booking state, session state, `csmsSyncStatus`, `deliveryStatus` | `status`, `type` (`charger`/`booking`/`session`/`csmsSync`/`delivery`) |
| `BookingStateBadge` | Specialised `StatusBadge` for booking states with icon | `state` |
| `CsmsSyncBadge` | Displays `csmsSyncStatus` with icon: green check / yellow spinner / red warning / grey | `csmsSyncStatus` |
| `Toast` | Auto-dismissing notification overlay for success, error, info, and warning | `message`, `severity`, `duration` (ms), `onDismiss` |
| `ConfirmDialog` | Modal requiring explicit confirmation for destructive actions (cancel booking, delete user, remove maintenance block) | `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `requireReason` |
| `ReasonModal` | Variant of `ConfirmDialog` with a mandatory textarea for override reason | `title`, `message`, `onConfirm(reason)` |
| `NotificationBell` | Nav icon button showing unread badge count; fetches `GET /notifications/unread-count` on mount and tab focus | `unreadCount`, `onClick` |
| `NotificationItem` | Single row in the notification list or dropdown | `notification`, `onMarkRead`, `onClickThrough` |
| `SimulatedDataBanner` | Amber banner rendering `simulatedDataLabel` string verbatim when present on reporting/AI responses | `simulatedDataLabel` |
| `LoadingSkeleton` | Shimmer placeholder matching the shape of the target component (card, table row, KPI tile) | `variant` (`card`/`row`/`kpi`), `count` |
| `EmptyState` | Centred illustration + message + optional CTA for empty lists/tables | `icon`, `title`, `description`, `ctaLabel`, `onCta` |
| `ErrorBanner` | Full-width inline banner for API error states showing human-readable `message` and `traceId` link | `message`, `errors[]`, `traceId`, `onRetry` |
| `FilterBar` | Location filter (`NEX-TOWER`/`NEXTERACOM`/All) + date range pickers — shared across dashboard, bookings, reports | `filters`, `onChange`, `variant` (`dashboard`/`reports`/`bookings`) |
| `KpiCard` | Single metric tile on the reporting dashboard | `title`, `value`, `unit`, `trend`, `simulatedDataLabel`, `onClick` |
| `PeakHoursChart` | Bar chart of session starts by hour of day | `data` (array of `{hour, sessionCount}`), `isLoading` |
| `ChargerRankingList` | Ranked table of chargers by session count / kWh | `chargers`, `isLoading` |
| `LocationComparisonTable` | Side-by-side metric table for NEX Tower vs NEXTERACOM | `locationComparison`, `isLoading` |
| `AiInsightCard` | Single AI insight card (NL summary, pattern, anomaly, recommendation) with grounding block | `insight`, `confidence`, `simulatedDataLabel`, `onDismiss` |
| `PrivacyNoticeModal` | Full-screen modal rendering privacy notice markdown with "I Acknowledge" button | `notice`, `onAcknowledge`, `isLoading` |
| `PaginationControls` | Page prev/next + "Page N of M" — attached to any paginated list | `pagination`, `onPageChange` |
| `Breadcrumb` | Simple breadcrumb trail for detail pages (`Back to list` pattern) | `items[]` — `{label, href}` |
| `RoleGate` | Wrapper that renders children only if `currentUser.role` matches allowed roles | `allowedRoles[]`, `fallback` |
| `DailyCapIndicator` | Shows remaining daily minutes as informational text on the booking form | `remainingMinutes`, `dailyCapMinutes` |

---

## Forms

### Form 1: Login (`/login`)

| Field | Type | Required | Validation | Helper text |
|---|---|---|---|---|
| `email` | email input | Yes | RFC-5322 format | "e.g. alice.standard@nexlevel.local" |
| `password` | password input | Yes | 8–100 chars | "" |

**Submit:** `POST /api/v1/auth/login` with `{ email, password }`.

**Success:** Store `token` and `user` in `localStorage` + auth context. If `privacy.hasAcknowledgedCurrentVersion === false` AND role is `StandardUser`, redirect to `/privacy`; else redirect to `/dashboard`.

**Error (401):** Show inline error beneath the password field: "Invalid email or password." Never indicate which field was wrong. Error code: `Unauthenticated`.

**Error (400):** Field-level inline messages per `errors[].field`.

---

### Form 2: Privacy Acknowledgement (`/privacy`)

No editable fields — the notice content is rendered from `GET /privacy-notice` (`content` in Markdown).

**Key display fields:** `version`, `effectiveDate`, rendered `content` (Markdown to HTML).

**Submit:** `POST /api/v1/privacy-notice/acknowledge` with `{ version }` (the version shown on screen).

**Success (`201`):** Update `privacy.hasAcknowledgedCurrentVersion = true` in app context. Show success toast: "Privacy notice acknowledged." Redirect to the page the user originally tried to reach (return URL), defaulting to `/dashboard`.

**Error (`400 VersionMismatch`):** Banner: "The privacy notice has been updated since this page was loaded. Refreshing…" — then reload.
**Error (`409 AlreadyAcknowledged`):** Silently redirect to `/dashboard` (user is already acknowledged; treat as benign).

---

### Form 3: Booking Form (`/bookings/new?chargerId=...`)

| Field | API field | Type | Required | Validation | Helper text |
|---|---|---|---|---|---|
| Charger | `chargerId` | Hidden (pre-set from route param or charger selection step) | Yes | Must exist and be `Available` for the chosen window | — |
| Start time | `startTime` | datetime-local input (UTC+4 display, UTC on wire) | Yes | >= now − 1 min; same calendar day; ISO 8601 UTC | "Today only" |
| End time | `endTime` | datetime-local input | Yes | > `startTime`; `endTime − startTime <= 60 min` | "Max 1 hour" |
| Vehicle make | `vehicleMake` | text input | Yes | Non-empty; pre-filled from `eligibility.vehicleMake` | "e.g. Tesla" |
| Vehicle model | `vehicleModel` | text input | Yes | Non-empty; pre-filled from `eligibility.vehicleModel` | "e.g. Model 3" |
| On behalf of user | `onBehalfOfUserId` | user-search select | No (Workplace/Admin only) | Must be a valid eligible user UUID | "Leave blank to book for yourself" |
| Override reason | `reasonForOverride` | textarea | Conditional | Required when duration > 60 min AND role is Security/Workplace/Admin | "Reason is required for an override" |

**Fair-use rule display:** Immediately below the form heading, display a highlighted note: "Maximum 1 hour of charging per user per day (BR002)." Also show the `DailyCapIndicator` component with remaining minutes for the authenticated user.

**Duration hint:** A live "Duration: X min" label updates as start/end times change. If duration > 60 min and the user is not an override-eligible role, the Submit button is disabled with tooltip "Duration cannot exceed 1 hour."

**Submit:** `POST /api/v1/bookings` with all fields. Button label: "Confirm Booking". Show spinner on button while in-flight; disable re-submit.

**Success (`201`):** Read the returned booking object. If `csmsSyncStatus === "AuthorizationFailed"`, show a warning banner on the confirmation screen (not an error — the booking was created). Otherwise show success. Navigate to Booking Confirmation view (inline post-submit page).

**Errors:**

| HTTP | Code | UI treatment |
|---|---|---|
| `400 RequiredFieldMissing` | Per `errors[].field` | Field-level inline error beneath affected field |
| `400 DurationExceeded` | `endTime` field | Inline: "Maximum booking duration is 1 hour." |
| `400 SameDayOnly` | `startTime` field | Inline: "Bookings can only be made for today." |
| `400 InvalidStartTime` | `startTime` field | Inline: "Start time must be in the future." |
| `403 NotEligible` | — | Banner: "Your account is not eligible to book. Contact the Workplace team." |
| `403 PrivacyNotAcknowledged` | — | Redirect to `/privacy` with return URL |
| `409 OverlappingBooking` | — | Banner: "This charger is already booked for that window. Pick a different slot or charger." |
| `409 DailyCapExceeded` | — | Banner: "Daily charging limit (1 hour) exceeded. Remaining: X minutes today." |
| `409 AlreadyHasActiveBooking` | — | Banner: "You already have an active booking. Cancel or release it first." |
| `409 ChargerUnavailable` | — | Banner: "This charger is not available for that window." |
| `409 MaintenanceBlockConflict` | — | Banner: "This charger is blocked for maintenance during that window." |
| `400 ReasonRequired` | `reasonForOverride` field | Inline: "Reason is required for an override." |
| `500` | — | Banner with generic message + `traceId`. Retry button. |

---

### Form 4: Cancel Booking (within `ConfirmDialog` on `/bookings/:id` or `/my-bookings`)

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| Reason | `reason` | textarea | Conditional | Required when an Admin cancels another user's booking; optional for owner. |

**Submit:** `PUT /api/v1/bookings/:id/cancel` with `{ reason }`.
**Success (`200`):** Close dialog. Show toast: "Booking cancelled." Refresh booking list/detail.
**Error (`409 InvalidStateTransition`):** Close dialog. Toast: "This booking has already been cancelled or is no longer active."

---

### Form 5: Release Booking (within `ReasonModal`)

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| Reason | `reason` | textarea | Conditional | Required when an operator (Security/Workplace/Admin) releases another user's booking. |

**Submit:** `PUT /api/v1/bookings/:id/release` with `{ reason }`.
**Success (`200`):** Toast: "Booking released." Refresh.
**Errors:** Same as cancel.

---

### Form 6: Override Booking (`ReasonModal` on operations or booking detail)

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| New end time | `newEndTime` | datetime-local | Yes | Must be > existing `endTime`. |
| Reason | `reason` | textarea | Yes | Always required. |

**Submit:** `PUT /api/v1/bookings/:id/override` with `{ newEndTime, reason }`.
**Success (`200`):** Toast: "Booking extended." Refresh detail.
**Error (`400 ReasonRequired`):** Inline: "Reason is required."
**Error (`409`):** Banner: "This change conflicts with another booking on the same charger."

---

### Form 7: Charger Status Update (inline action on dashboard or operations screen)

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| Status | `status` | select | Yes | Allowed: `Available`, `Unavailable`, `Faulted`, `BlockedForMaintenance` |
| Reason | `reason` | textarea | Yes | Always required |

**Submit:** `PUT /api/v1/chargers/:id/status` with `{ status, reason }`.
**Success (`200`):** Toast: "Charger status updated." Dashboard card refreshes.

---

### Form 8: Create Maintenance Block (`/admin/maintenance`)

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| Charger | `chargerId` | select | Yes | Filtered list of all chargers |
| Start time | `startTime` | datetime-local | Yes | ISO 8601 UTC |
| End time | `endTime` | datetime-local | No | `null` = open-ended |
| Reason | `reason` | textarea | Yes | Non-empty |
| Force release existing bookings | `forceReleaseExistingBookings` | checkbox | No | Visible only if overlap detected; default unchecked |

**Submit:** `POST /api/v1/maintenance-blocks` with all fields.
**Success (`201`):** Toast: "Maintenance block created. Charger is now Blocked for Maintenance." Navigate back to maintenance list.
**Error (`409 MaintenanceBlockConflict`):** Show a warning panel listing affected bookings. Prompt user to check "Force release existing bookings" and re-submit.

---

### Form 9: Create / Edit Eligible EV User (`/admin/users/new`, `/admin/users/:id/edit`)

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| Email | `email` | email input | Yes (create only) | Read-only on edit |
| Display name | `displayName` | text | Yes | |
| Role | `role` | select | Yes | `StandardUser`, `Security`, `Workplace`, `Admin`, `ReportingESGViewer`, `Management` |
| Workplace EID | `workplaceRegistryEid` | text | Yes | |
| Badge ID | `badgeId` | text | Yes | |
| Eligibility status | `eligibilityStatus` | select | Yes | `Active`, `Inactive`, `Suspended` |
| Vehicle make | `vehicleMake` | text | No | |
| Vehicle model | `vehicleModel` | text | No | |
| Site context | `siteContext` | select | Yes | `NexTower`, `Nexteracom`, `Both` |
| Password | `password` | password input | Yes (create only) | Not shown on edit |

**Submit (create):** `POST /api/v1/eligible-users`.
**Submit (edit):** `PUT /api/v1/eligible-users/:id`.
**Success:** Toast "User saved." Navigate to `/admin/users`.
**Errors:** Field-level for `409 DuplicateEid`/`DuplicateBadge`/`DuplicateEmail`.

---

### Form 10: My Vehicle Update (`/profile`)

Standard User may update only `vehicleMake` and `vehicleModel` on their own record.

| Field | API field | Type | Required | Notes |
|---|---|---|---|---|
| Vehicle make | `vehicleMake` | text | No | |
| Vehicle model | `vehicleModel` | text | No | |

**Submit:** `PUT /api/v1/eligible-users/:id` with `{ vehicleMake, vehicleModel }`.
**Success (`200`):** Toast: "Vehicle updated." Update local `eligibility` context so the next booking form pre-fills the new values.
**Error (`403`):** Banner: "You may only update your own vehicle make and model."

---

### Form 11: System Config (`/admin/config`)

Inline edit table — each row is its own mini-form.

| Config key | `key` (API field) | Display label | Input type | Notes |
|---|---|---|---|---|
| `GRACE_PERIOD_MINUTES` | Grace period (min) | number | 1–120 |
| `EMISSION_FACTOR_KG_PER_KWH` | CO₂ emission factor (kgCO₂/kWh) | number | > 0 |
| `PRE_SESSION_REMINDER_MINUTES` | Pre-session reminder lead (min) | number | 1–60 |
| `SESSION_ENDING_REMINDER_MINUTES` | Session-ending reminder lead (min) | number | 1–60 |
| `DAILY_CAP_MINUTES` | Daily charging cap (min) | number | 1–480 |
| `NO_SHOW_THRESHOLD_COUNT` | No-show alert threshold (count) | number | 1–10 |
| `NO_SHOW_THRESHOLD_DAYS` | No-show alert window (days) | number | 1–30 |
| `CSMS_POLLING_INTERVAL_SECONDS` | CSMS poll interval (sec) | number | 3–60 |

**Submit:** `PUT /api/v1/config` with `{ updates: [{ key, value }] }`. Send only changed rows.
**Success (`200`):** Toast: "Configuration saved."

---

## Tables / Lists

### Table 1: Charger Availability Dashboard Grid (`/dashboard`)

Not a traditional table — rendered as a responsive card grid (2 columns on mobile, 3–4 on tablet/desktop). Each card is a `ChargerCard`.

**Card content:** `displayName`, `location.name`, `status` (`StatusBadge`), `activeSession.energyKwh` + `elapsedMinutes` (when charging), `activeSession.userDisplayName` / `vehicleMake` / `vehicleModel` (masked as `"***"` for non-admin).

**Filters:** `FilterBar` with location radio buttons (`All` / `NEX Tower` / `NEXTERACOM`), optional status multi-select.

**Sorting:** By status (available first) is the natural default order from the API.

**Empty state:** No chargers returned after filter → "No chargers match your filter. Try clearing the location filter." Clear filter button.

**Loading state:** Skeleton cards (same grid shape) while fetching.

**Error state:** `ErrorBanner` with retry button.

**Polling:** The dashboard calls `GET /api/v1/chargers` every 5 seconds. On each successful poll, update card content without a full page flash (diffing in state).

**Row actions (on charger card):** "Book Now" button (visible when `status === "Available"` and user is Standard User or eligible Workplace/Admin). Admin/Security/Workplace see "Change Status" action button on cards.

---

### Table 2: My Bookings (`/my-bookings`)

**Columns (mobile-first, collapsible):**

| Column | API field | Mobile visible | Notes |
|---|---|---|---|
| Charger | `chargerDisplayName` | Yes | |
| Location | `locationCode` | No (shown in detail) | |
| Start | `startTime` | Yes | Local time (UTC+4) |
| End | `endTime` | No | |
| State | `state` | Yes | `BookingStateBadge` |
| CSMS sync | `csmsSyncStatus` | Yes | `CsmsSyncBadge` |
| Vehicle | `vehicleMake` + `vehicleModel` | No | |
| Actions | — | Yes | Cancel / Release / View |

**Filters:** State (`Confirmed`, `Active`, `Completed`, `Cancelled`, `Released`, `NoShow`, `Overridden`); date range.

**Sort:** Default `startTime desc`. Allowed: `startTime`, `state`.

**Empty state:** "You have no bookings yet." with a "Book a Charger" button linking to `/dashboard`.

**Pagination:** Standard `PaginationControls`. Default page size 20.

**Row actions:**
- "Cancel" — enabled when `state === "Confirmed"`. Opens `ConfirmDialog`.
- "Release" — enabled when `state === "Active"`. Opens `ReasonModal`.
- "View" — always enabled. Links to `/bookings/:id`.

---

### Table 3: Operational Bookings Today (`/operations/bookings`)

For Security, Workplace, Admin.

**Columns:**

| Column | API field | Notes |
|---|---|---|
| User | `userDisplayName` | Full name — not masked for these roles |
| Charger | `chargerDisplayName` | |
| Location | `locationCode` | |
| Start | `startTime` | |
| End | `endTime` | |
| State | `state` | `BookingStateBadge` |
| CSMS sync | `csmsSyncStatus` | `CsmsSyncBadge` |
| Actions | — | Release, Override |

**Filters:** Location, state, `csmsSyncStatus`, user search.

**Row actions:** "Release" (→ `ReasonModal`), "Override" (→ override form modal, Security/Workplace/Admin only), "View Detail".

**Empty state:** "No bookings for today at this location."

---

### Table 4: Eligible EV Users (`/admin/users`)

| Column | API field | Notes |
|---|---|---|
| Name | `displayName` | |
| EID | `workplaceRegistryEid` | |
| Badge ID | `badgeId` | |
| Status | `eligibilityStatus` | `StatusBadge` colour-coded: Active=green, Suspended=orange, Inactive=grey |
| Vehicle | `vehicleMake` + `vehicleModel` | |
| Site | `siteContext` | |
| Privacy | `privacyAcknowledgementStatus` | "Acknowledged" / "Pending" |
| Last updated | `lastUpdatedAt` | |
| Actions | — | Edit, Suspend/Activate, Delete |

**Search:** `?search=` on `displayName` or `workplaceRegistryEid`.

**Filters:** `eligibilityStatus`, `siteContext`.

**Sort:** Default `displayName asc`. Allowed: `displayName`, `workplaceRegistryEid`, `lastUpdatedAt`.

**Empty state:** "No eligible EV users found. Create the first user." with "Add User" button (Admin only).

**Row actions:** "Edit" (→ `/admin/users/:id/edit`), "Suspend" / "Activate" (inline toggle), "Delete" (→ `ConfirmDialog`, blocked if active booking exists).

---

### Table 5: Audit Log (`/admin/audit`)

Read-only.

| Column | API field | Notes |
|---|---|---|
| Timestamp | `timestamp` | Local time |
| Actor | `actorUserId` + `actorRole` | "system" shown verbatim |
| Action | `action` | Monospace text |
| Entity | `entityType` + `entityId` | EntityId is a clickable UUID link |
| Before | `beforeState` | Collapsed JSON snippet; expand on click |
| After | `afterState` | Collapsed JSON snippet; expand on click |
| Reason | `reason` | Truncated, expand on click |
| Source | `source` | `StatusBadge` |

**Filters:** Date range, `actorUserId`, `action` (multi-select), `entityType` (multi-select), `source`.

**Empty state:** "No audit log entries match your filter."

**No row actions.** Read-only. Entries cannot be edited or deleted.

---

### Table 6: Notification Audit (`/admin/notifications`)

| Column | API field | Notes |
|---|---|---|
| Timestamp | `timestamp` | Local time |
| Recipient | `audienceUserDisplayName` | |
| Event | `triggerEvent` | |
| Channel | `channel` | `StatusBadge` (InApp / Email / Teams) |
| Severity | `severity` | Info / Warning / Critical |
| Delivery | `deliveryStatus` | `StatusBadge`: Sent=green, Previewed=yellow, Failed=red |
| Linked to | `linkedBookingId` / `linkedSessionId` / `linkedChargerId` | Clickable short IDs |
| Payload | — | "Preview" button for Email and Teams rows |

**Filter:** `audienceUserId`, `channel`, `deliveryStatus`, `triggerEvent`, date range.

**Payload preview:** Clicking "Preview" on an Email row opens a modal with a rendered email (subject + body). Clicking "Preview" on a Teams row opens a modal with the Adaptive Card JSON rendered as a formatted preview (JSON syntax-highlighted, or rendered card if a lightweight renderer is available).

---

### Table 7: Maintenance Blocks (`/admin/maintenance`)

| Column | API field | Notes |
|---|---|---|
| Charger | `chargerId` (resolved to display name) | |
| Start | `startTime` | |
| End | `endTime` | "Open-ended" when `null` |
| Reason | `reason` | |
| Active | `isActive` | Boolean badge |
| Created by | `actorUserId` | |
| Actions | — | Remove (active blocks only) |

**Empty state:** "No active maintenance blocks." with "Create Block" button.

---

### Table 8: Notification Center (`/notifications`)

Rendered as a list, not a table.

| Field | API field | Display |
|---|---|---|
| Title | `title` | Bold when `readState === false` |
| Body | `body` | Single line, truncated |
| Severity | `severity` | Coloured left border: Info=blue, Warning=amber, Critical=red |
| Timestamp | `timestamp` | Relative ("2 min ago") |
| Channel | `channel` | Small icon (bell / envelope / teams-icon) |
| Read/unread | `readState` | Unread = solid dot indicator |
| Linked entity | `linkedBookingId` / `linkedSessionId` / `linkedChargerId` | Tap row to navigate to linked entity |

**Row action:** Tap anywhere on the row to mark as read (`PUT /notifications/:id/read`) and navigate to the linked entity.

**"Mark all read" button** at the top of the list (client-side only for MVP — calls `PUT /notifications/:id/read` for each visible unread item).

---

## Dashboard Cards

KPI tiles on the Reporting Dashboard (`/reports`) — source: `GET /api/v1/reports/summary`, `GET /api/v1/reports/sessions`, `GET /api/v1/reports/energy`, `GET /api/v1/reports/sustainability`.

| Card title | API field | Endpoint | Format | Click-through |
|---|---|---|---|---|
| Total Sessions | `data.totalSessions` | `/reports/summary` | Integer | → Sessions tab |
| Total Energy | `data.totalKwh` | `/reports/summary` | `X.X kWh` (1 decimal) | → Energy tab |
| Estimated CO₂ Savings | `data.estimatedCo2SavingsKg` | `/reports/summary` | `X.X kg CO₂` | → Sustainability tab |
| Emission Factor Used | `data.emissionFactorUsed` | `/reports/summary` | `X.XX kgCO₂/kWh` | — (informational) |
| Avg Session Duration | `data.avgDurationMinutes` | `/reports/sessions` | `X.X min` | → Sessions tab |
| Avg Energy / Session | `data.avgKwh` | `/reports/sessions` | `X.X kWh` | → Energy tab |
| Cancelled Bookings | `data.cancelledCount` | `/reports/sessions` | Integer | → Sessions tab |
| No-Show Bookings | `data.noShowCount` | `/reports/sessions` | Integer | → Sessions tab |

Each KPI card renders the `SimulatedDataBanner` if the enclosing page-level `simulatedDataLabel` is non-null. The banner is displayed once at the top of the reporting page, not repeated on each card.

---

## Charts

Charts live on the Reporting Dashboard `/reports` under the **Energy** and **Utilisation** tabs. All charts are P1 / Should-have.

### Chart 1: Peak Charging Hours Bar Chart

- **Type:** Vertical bar chart.
- **X axis:** Hour of day (0–23); labelled in local time (UTC+4).
- **Y axis:** Session count.
- **Data source:** `GET /api/v1/reports/energy` → `data.peakHourDistribution` (array of `{ hour, sessionCount }`).
- **Legend:** "Sessions by hour."
- **Empty state:** "No session data for the selected period." — render an empty chart with axis labels, not a hidden chart.
- **Loading state:** Skeleton shimmer the same height as the chart area.
- **Simulated label:** Show `SimulatedDataBanner` if `simulatedDataLabel` is present.

### Chart 2: Charger Ranking List

Rendered as a horizontal bar list (not a full SVG chart) to keep it mobile-friendly.

- **Data source:** `GET /api/v1/reports/energy` → `data.chargerRanking` (array of `{ chargerId, displayName, sessionCount, totalKwh }`).
- **Display:** Each row shows charger display name, session count bar (relative to max), and `totalKwh`.
- **Sort:** By `sessionCount` descending (as returned by the API).

### Chart 3: Charger Utilisation Table

- **Type:** Table with a percentage bar per row.
- **Data source:** `GET /api/v1/reports/utilization` → `data.chargers` (array of `{ chargerId, displayName, utilizationPercent, blockedForMaintenanceMinutes, faultedEventCount }`).
- **Empty state:** "No utilisation data for the selected period."

### Chart 4: Location Comparison

- **Type:** Two-column summary table.
- **Data source:** `GET /api/v1/reports/utilization` → `data.locationComparison` with keys `NEX-TOWER` and `NEXTERACOM`.
- **Fields shown:** `totalSessions`, `totalKwh`, `avgUtilizationPercent`.

### Charts for P2 (AI Insights)

- **Demand forecast:** Rendered as a small bar chart on the AI Insights panel using `demandForecast` array (`{ hourBucket, demandScore }`). X axis: hour bucket; Y axis: relative demand score 0–1. Not implemented unless P2 time permits; slot is reserved in the layout.
- `GET /api/v1/ai/insights` is the source for all AI chart data.

> **Gap:** The API contract does not include a dedicated endpoint for time-series energy trend (daily/weekly kWh over a date range). The `GET /reports/energy` `peakHourDistribution` is hour-of-day only, not date-over-date. A line chart showing energy consumed per day would be a useful P1 visual but is not specifiable against the current contract. If this is needed for the demo, a `GET /reports/energy?groupBy=day` parameter should be added to the API contract before implementation.

---

## User Interactions

### Click and Navigation

- Charger cards are entirely clickable. Clicking an Available charger opens the booking form with `chargerId` pre-set.
- Booking state badge clicks on My Bookings navigate to Booking Detail.
- Notification items are clickable and navigate to the linked entity (booking/session/charger).
- Audit log entity IDs are clickable where a detail screen exists for that entity type.

### Hover States

- All interactive cards have a subtle `box-shadow` or `border` hover effect at >= 768px breakpoint (desktop/tablet). On mobile, hover is not applicable.
- CTA buttons change background colour on hover.

### Keyboard Shortcuts

No global keyboard shortcuts are defined for the MVP. Standard browser tab order and ENTER/SPACE for buttons and interactive controls apply.

### Drag / Drop

Not applicable in this MVP.

### Confirmations for Destructive Actions

All destructive or state-changing actions require an explicit confirmation via `ConfirmDialog` or `ReasonModal`:

| Action | Confirmation required | Reason field |
|---|---|---|
| Cancel booking (owner) | Yes — "Are you sure you want to cancel this booking?" | Optional |
| Cancel booking (admin on behalf) | Yes | Required |
| Release booking (owner) | Yes — "Release this booking early?" | Optional |
| Release booking (operator) | Yes | Required |
| Override booking | Yes | Required |
| Delete eligible EV user | Yes — "This will deactivate the user." | — |
| Create maintenance block with force-release | Yes — lists affected bookings | — |
| Remove maintenance block | Yes | — |

### Optimistic Updates

**Forbidden for state transitions** (per API contract section 12.4). The app must wait for the server response before updating booking state, charger status, or notification read state. The one exception is the `PUT /notifications/:id/read` call, which can optimistically flip `readState` in the local list immediately while the request is in-flight, because the worst failure case is a harmless re-fetch.

### CSMS Sync Status Warning

When a `POST /bookings` response returns `201` with `csmsSyncStatus === "AuthorizationFailed"`, the Booking Confirmation screen renders a persistent amber warning banner (not a dismissable toast):

> "Warning: Your booking was created but could not be authorised at the charging station. Charging may not be possible. Operations have been notified. Ref: {traceId}"

---

## Loading States

### Strategy

- Show a `LoadingSkeleton` (shimmer) for any component that takes > 200 ms to receive its first data. For requests expected to resolve in < 200 ms, use a subtle opacity transition instead of a full skeleton.
- Use skeleton variants that match the shape of the target content so the layout does not shift on data arrival.
- Global navigation and the notification bell do not block rendering while loading.

### Component-Level Loading Patterns

| Component / Screen | Loading treatment |
|---|---|
| Dashboard charger grid (initial load) | 8 `LoadingSkeleton` cards in the same grid |
| Dashboard charger grid (poll refresh) | Silent background refresh — no skeleton on subsequent polls; stale data remains visible |
| My Bookings list | Skeleton rows matching table columns |
| Booking Detail | Skeleton matching the two-column detail layout |
| Reporting KPI tiles | Skeleton tiles with correct dimensions |
| Reporting charts | Skeleton shimmer occupying the chart area |
| Notification Center list | Skeleton rows |
| Eligible User list | Skeleton table rows |
| Audit Log | Skeleton rows |
| Privacy Notice (modal) | Spinner inside modal, body text replaced with skeleton |
| AI Insights panel | Shimmer placeholder for each insight card |
| `POST /bookings` submit | Button becomes a spinner; button label changes to "Confirming…"; button disabled |
| Any other form submit | Same spinner-on-button pattern |

---

## Empty States

| Screen / List | Empty state copy | Icon placeholder | CTA |
|---|---|---|---|
| Dashboard (after filter — no chargers match) | "No chargers match your filter." | Plug / charging icon | "Clear Filter" button |
| My Bookings (no bookings ever) | "You have no bookings. Book a charger to get started." | Calendar icon | "Book a Charger" → `/dashboard` |
| My Bookings (no bookings in selected state) | "No bookings with status {state}." | — | "Clear Filter" |
| Operations Bookings (no bookings today) | "No bookings for today at this location." | Check-circle icon | — |
| Notification Center (no notifications) | "No notifications yet. You'll receive reminders and updates here." | Bell icon | — |
| Notification Audit (no results) | "No notifications match your filter." | — | "Clear Filters" |
| Eligible EV Users (no users) | "No eligible EV users found. Create the first user." | Person icon | "Add User" (Admin only) |
| Audit Log (no entries) | "No audit log entries match your filter." | Shield icon | "Clear Filters" |
| Maintenance Blocks (none active) | "No active maintenance blocks." | Wrench icon | "Create Block" (Admin only) |
| Reporting Dashboard (no data in date range) | "No charging activity in the selected period." | Chart icon | "Adjust Date Range" |
| AI Insights (no data) | "No charging activity recorded in the selected period." | Brain / AI icon | — |
| Sessions list (no sessions) | "No sessions found for the selected filters." | — | "Clear Filters" |

---

## Error States

### Error class handling

| HTTP Status | Error class | UI pattern |
|---|---|---|
| `400 Bad Request` | Validation error | Field-level inline error messages (per `errors[].field`); if field is unknown, show `ErrorBanner` below the form |
| `401 Unauthorized` | Session expired | Redirect to `/login` with a toast: "Your session has expired. Please sign in again." Clear localStorage. |
| `403 Forbidden` | Permission denied | Inline `ErrorBanner` with message from `errors[0].message`. If `code === "PrivacyNotAcknowledged"`, redirect to `/privacy`. If `code === "NotEligible"`, show banner with support contact text. |
| `404 Not Found` | Resource missing | Navigate to `/404` for top-level resources (booking ID typed in URL). For secondary resources loaded inside a screen (e.g., linked session), show inline "Not found" text in the section. |
| `409 Conflict` | Business rule conflict | `ErrorBanner` inside the form or page, not a full redirect. Show the `errors[0].message`. Include a retry prompt only if the user can take a corrective action. |
| `500 Internal Server Error` | Server error | `ErrorBanner` with "Something went wrong. If this persists, reference ID: {traceId}." No stack traces. Retry button where appropriate. |
| `503 Service Unavailable` | CSMS or AI unavailable | For CSMS-related: banner "The charging station system is temporarily unavailable. Your booking has been saved but may not be authorised. Operations have been notified." For AI insights `503 AiUnavailable`: render a static fallback notice in place of AI content: "AI insights are temporarily unavailable." |
| Network / offline | Client-side | Banner at top of page: "You appear to be offline. Some features may not work until your connection is restored." Polling pauses. |

### Error shapes (tied to `api-contract.md` §7)

Every error response has `{ message, errors[], traceId }`. The frontend:
1. Shows `message` in the `ErrorBanner` headline.
2. If `errors[].field` is present, maps to field-level inline error messages.
3. Logs `traceId` to the browser console.
4. Includes `traceId` in any "Report a problem" link text.

### Retry / fallback rules

- Dashboard polling failures: silently suppress a single failed poll; show the error banner after 3 consecutive failures, with a "Retry" button that resumes polling.
- Form submission failures (5xx): show error banner with "Try again" button. Do not reset form values.
- AI insights `503`: render the static fallback copy. Do not show a spinner loop.
- CSMS `AuthorizationFailed` after booking creation (a `201` with degraded state): not an error per se — treat as a warning on the confirmation screen (see Booking Form error table above).

---

## Success States

### Toast Guidelines

- **Duration:** 3 seconds for `Info` / success toasts. 5 seconds for `Warning`. `Critical` severity toasts do not auto-dismiss; require a manual close.
- **Position:** Top-right on desktop/tablet; top-centre on mobile (full width minus 16px margin).
- **Max simultaneous toasts:** 3. If a 4th fires, the oldest is removed.

### Success treatment per action

| Action | Success treatment | Post-success navigation |
|---|---|---|
| Login | Toast: "Welcome back, {displayName}." | → `/privacy` (if unacknowledged) or `/dashboard` |
| Privacy acknowledged | Toast: "Privacy notice acknowledged." | → return URL or `/dashboard` |
| Booking created (CSMS Authorized) | Full Booking Confirmation view with a green `CsmsSyncBadge` and summary. Toast: "Booking confirmed." | Confirmation stays visible; "View My Bookings" and "Back to Dashboard" buttons |
| Booking created (CSMS AuthorizationFailed) | Booking Confirmation view with amber warning banner (see Interactions section). No "Booking confirmed" toast. | Same — user should understand the degraded state before navigating away |
| Booking cancelled | Toast: "Booking cancelled." | Refresh current list/detail |
| Booking released | Toast: "Charger released. Thank you." | Refresh current list/detail |
| Booking override | Toast: "Booking extended." | Refresh booking detail |
| Charger status updated | Toast: "Charger status updated to {status}." | Dashboard card refreshes |
| Maintenance block created | Toast: "Maintenance block created." | Navigate to `/admin/maintenance` |
| Maintenance block removed | Toast: "Maintenance block removed. Charger is now Available." | Refresh maintenance list |
| Eligible user created | Toast: "User {displayName} added." | Navigate to `/admin/users` |
| Eligible user updated | Toast: "User updated." | Stay on page or navigate to list |
| Eligible user deleted | Toast: "User deactivated." | Navigate to `/admin/users` |
| Vehicle make/model updated | Toast: "Vehicle updated." | Stay on `/profile` |
| Config saved | Toast: "Configuration saved." | Stay on `/admin/config` |
| Notification marked read | Unread dot disappears; badge count decrements. No toast (too frequent). | Stay on list |
| Logout | Toast: "You have been signed out." | → `/login` |

---

## Mobile Responsiveness

### Breakpoints

| Breakpoint label | Width range | Layout strategy |
|---|---|---|
| Mobile (phone) | 320px – 767px | Single column; hamburger nav; stacked forms; card list (not table) |
| Tablet | 768px – 1023px | Two-column layouts; side nav optional; simplified tables |
| Laptop | 1024px – 1439px | Full nav bar; multi-column grid; full tables with all columns |
| Projector / large display | 1440px+ | Same as laptop but with wider padding; font size comfortable from 3 m distance |

**Minimum supported width:** 320px.

### Mobile-Specific Rules

- The charger availability dashboard renders a 1-column card list on mobile (< 768px). No horizontal scrolling.
- The Booking Form collapses to a single-column layout; `startTime` and `endTime` pickers stack vertically. Touch targets are a minimum of 44×44 px (WCAG 2.5.5).
- The top nav bar collapses to a hamburger menu at < 768px. Notification bell and profile avatar remain visible at all breakpoints.
- Tables transform to card lists on mobile. Each card shows the most important 3–4 fields; a "View" button opens the detail.
- KPI tiles render as a scrollable horizontal strip on mobile (2 tiles visible, swipe for more) rather than a 4-column grid.
- Modal dialogs are full-screen on mobile (< 768px) and centred card on tablet/desktop.
- The `SimulatedDataBanner` is always visible on mobile; it collapses to a compact strip rather than hiding.
- Form labels are above the input on mobile (not inline).

### Table → Card transformation rules

On mobile (< 768px), all paginated tables (My Bookings, Eligible Users, Audit Log, Notifications Audit, Maintenance Blocks) transform to stacked card lists. Each card shows:
1. The primary identifier (charger name / user name / action).
2. The most important status badge.
3. The timestamp.
4. An expandable "More details" section for secondary fields.
5. All row action buttons (full width on mobile).

---

## Accessibility

### Keyboard Navigation

- All interactive elements (buttons, links, form inputs, cards, modal close buttons) are reachable via `Tab` key in logical DOM order.
- Modal dialogs trap focus within the modal while open. When the modal closes, focus returns to the element that triggered it.
- The charger card grid uses `role="grid"` with arrow-key navigation between cards.
- The hamburger menu button has `aria-expanded` attribute.

### ARIA Labels for Icon Buttons

| Button | `aria-label` |
|---|---|
| Notification bell | `"Notifications — {count} unread"` (updated dynamically) |
| Hamburger menu | `"Open navigation menu"` (closed) / `"Close navigation menu"` (open) |
| Close modal (×) | `"Close dialog"` |
| Mark notification read | `"Mark as read"` |
| Edit user | `"Edit {displayName}"` |
| Delete user | `"Delete {displayName}"` |
| Remove maintenance block | `"Remove maintenance block for {chargerDisplayName}"` |
| "Book Now" on charger card | `"Book {chargerDisplayName}"` |
| Filter clear | `"Clear filter"` |

### Contrast Targets

- All text and interactive elements meet WCAG AA contrast ratio: 4.5:1 for normal text, 3:1 for large text (18pt / 14pt bold) and UI components.
- Status badge colours use sufficient contrast against both light and dark card backgrounds. Do not rely on colour alone to convey status — always pair with a label or icon.

### Status Colours (accessible palette)

| Status / severity | Background | Foreground | Icon |
|---|---|---|---|
| Available | `#D1FAE5` (green-100) | `#065F46` (green-900) | Check circle |
| Reserved | `#DBEAFE` (blue-100) | `#1E40AF` (blue-900) | Clock |
| Charging | `#FEF3C7` (amber-100) | `#92400E` (amber-900) | Lightning bolt |
| Blocked for Maintenance | `#F3F4F6` (grey-100) | `#374151` (grey-700) | Wrench |
| Unavailable | `#FEE2E2` (red-100) | `#991B1B` (red-800) | Minus circle |
| Faulted | `#FEE2E2` (red-100) | `#991B1B` (red-800) | Exclamation triangle |
| Info severity | `#EFF6FF` (blue-50) | `#1E3A8A` (blue-900) | Info circle |
| Warning severity | `#FFFBEB` (amber-50) | `#78350F` (amber-900) | Warning triangle |
| Critical severity | `#FFF1F2` (rose-50) | `#9F1239` (rose-900) | Alert circle |
| csmsSyncStatus: Authorized | `#D1FAE5` | `#065F46` | Check |
| csmsSyncStatus: AuthorizationPending | `#FFFBEB` | `#78350F` | Spinner |
| csmsSyncStatus: AuthorizationFailed | `#FEE2E2` | `#991B1B` | X circle |
| csmsSyncStatus: Revoked | `#F3F4F6` | `#6B7280` | Minus |

### Form Label Rules

- Every input has an associated `<label>` element with a `for`/`htmlFor` attribute linked to the input's `id`. No placeholder-only labels.
- Required fields are marked with a visible asterisk `*` and `aria-required="true"`.
- Inline error messages are associated with the input via `aria-describedby`.

### Error Announcement

- Form validation errors are announced to screen readers via `role="alert"` on the error container that appears or changes.
- The `ErrorBanner` component uses `role="alert"` so assistive technology reads it immediately when injected.
- Toast messages use `role="status"` for `Info` / success and `role="alert"` for `Warning` / `Critical`.

### Prefers-Reduced-Motion

- All CSS transitions and animations check `@media (prefers-reduced-motion: reduce)` and reduce or eliminate motion.
- The `LoadingSkeleton` shimmer is replaced by a static grey fill when reduced-motion is preferred.
- The polling refresh of the charger grid does not animate card content; it updates in-place.

---

## Demo-Friendly UI Polish

### What makes this demo well on a projector at hour 16

**Hero numbers visible immediately.** The Reporting Dashboard KPI tiles (`totalSessions`, `totalKwh`, `estimatedCo2SavingsKg`) are the first thing visible when a jury member looks at the screen. They must be large (≥ 32px font), clearly labelled, and populated with seeded data.

**Seeded data requirements (anti-blank-screen rules).**
- At least 8 chargers seeded (4 per location: NEX-TOWER-CH-01..04, NEXTERACOM-CH-01..04).
- At least 6 seeded users covering all roles: one Standard User (Alice, privacy acknowledged, eligible, Tesla Model 3), one Standard User (Bob, privacy NOT acknowledged), one Security user, one Workplace user, one Admin, one Reporting/ESG Viewer.
- At least 10 completed charging sessions seeded in the database so KPI tiles show real numbers on first load.
- At least 1 active booking seeded to demonstrate `csmsSyncStatus = Authorized` and the charger in `Reserved` status.
- Privacy notice (v1) seeded.
- Config table seeded with default values.

**"Do not demo" guardrails.**
- Do not demo the `/admin/audit` log while scrolling — it can look intimidating. The recommended demo path shows the audit log with a single filtered view (e.g., one booking override record).
- Do not demo the Notification Audit before creating at least one notification — the empty state is functional but does not impress. Seed at least 3 notification records (one booking confirmation, one pre-session reminder, one session-ended alert) with all three channels.
- Do not demo `/admin/config` as a primary screen — show it briefly as "here is where operations teams control the rules."
- Do not leave the AI Insights panel if it returns `confidence: Low` — pre-seed at least 10 sessions so it returns at least `Medium` confidence.

**Micro-polish checklist:**
- [ ] Browser tab title is the application name (e.g., "NEX EV Charging Platform") — set via React Helmet or document.title.
- [ ] Favicon matches the product branding (EV / charging bolt theme).
- [ ] Page titles (`<h1>`) are present on every screen for accessibility and demo clarity.
- [ ] All datetime values display in UTC+4 (Mauritius local time), not UTC.
- [ ] The `SimulatedDataBanner` text is exactly `"Based on simulated demo data"` (verbatim from API contract) — do not rephrase it.
- [ ] The `emissionFactorUsed` value (0.85) is always visible alongside the CO₂ savings KPI so the jury can see the formula.
- [ ] The `csmsSyncStatus` badge is visible on every booking row and detail screen — this is the most asked-about field during demo Q&A.
- [ ] Loading skeletons are present so the demo does not flash blank content during page transitions.
- [ ] The charger grid auto-refreshes every 5 seconds — demonstrate this live by showing the status change from `Reserved` → `Charging` as the simulator starts.
- [ ] Notification bell badge count is visible in the nav bar at all times when there are unread notifications.
- [ ] The "1 hour per user per day" fair-use rule is displayed on the booking form before submission — show this to the jury explicitly.
- [ ] Mobile demo path: open the dashboard on a phone-sized browser window (375px) and show that it is fully usable with no horizontal scroll.
- [ ] The Privacy Notice screen is full and readable, not truncated. Show the "I Acknowledge" button clearly.
- [ ] On the AI Insights panel, the `grounding` block is expandable — show it to demonstrate that the AI is grounded in real data.
- [ ] Smooth CSS `transition: all 0.15s ease` on card hover states (laptop/tablet view) — avoid abrupt state changes during demos.

**Projector-specific notes:**
- Default font size should be at least 16px body text so it is readable from a distance of 3 metres.
- Use high-contrast status colours (see Accessibility section palette) — washed-out pastels are not visible at projector scale.
- Avoid dark backgrounds for main content areas — projectors tend to wash out dark UI.
- The top navigation bar should be visible and clearly labelled — not just icon-only.

---

*All field names in this specification use the exact camelCase identifiers from `api-contract.md`. Any screen requirements that depend on data not currently in the API contract are flagged with `> Gap:` blockquotes above.*

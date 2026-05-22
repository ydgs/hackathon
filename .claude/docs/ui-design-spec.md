# UI Design Specification — AI-Powered EV Charging Orchestration Platform

**Status:** Authoritative hackathon spec  
**Date:** 2026-05-23  
**Sources:** `use-case-brief.md`, `functional-requirements.md`, `user-journeys.md`, `backlog-structure.md`, `api-contract.md`, `api-conventions.md`, `solution-architecture.md`, `ui-ux-spec.md`  
**Audience:** Frontend Developer, QA Engineer, Demo Coach  
**Stack confirmed:** React 18 + Vite + TypeScript + Tailwind CSS

---

## Overall UI Concept

The platform presents itself as an **intelligent operational command centre for EV charging** — not a simple booking form. From the very first screen, users understand they are interacting with a data-connected, real-time system. The charger availability dashboard is the heart of the product: a live grid of charger status cards that updates every five seconds, colour-coded by status, readable on a phone at a glance. Every action — booking, releasing, reviewing a session, reading an AI insight — is one or two taps away from the dashboard. The information hierarchy communicates operational health immediately: charger status at the top, booking details one level deeper, energy and sustainability data one level further. For the demo jury, the first ten seconds show a living dashboard with coloured status badges, a notification bell with an unread count, and headline KPI numbers that move. The product feels like something that runs Accenture's facilities for real, not a proof-of-concept prototype.

---

## Design Style and Visual Direction

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `brand-900` | `#0A1628` | Page background, side panel backgrounds |
| `brand-800` | `#0E2240` | Card backgrounds, nav bar |
| `brand-700` | `#1A3456` | Hover states, table row hover |
| `brand-500` | `#1D6FA4` | Primary interactive elements, active nav links |
| `brand-400` | `#2E8BC0` | Primary button background, link colour |
| `brand-300` | `#5AB1D8` | Secondary accents, focus rings |
| `brand-50`  | `#E8F4FB` | Light-mode card backgrounds (if used) |
| `white`     | `#FFFFFF` | Body text on dark backgrounds, card content |
| `grey-100`  | `#F3F4F6` | Input field backgrounds, light dividers |
| `grey-300`  | `#D1D5DB` | Borders, disabled states |
| `grey-600`  | `#4B5563` | Secondary text, placeholder text |
| `grey-900`  | `#111827` | Body text on light backgrounds |

**Status colour system (WCAG AA compliant against brand-800):**

| Status | Background Hex | Text Hex | Usage |
|---|---|---|---|
| Available | `#16A34A` (green-600) | `#FFFFFF` | Charger available, booking confirmed-OK |
| Reserved | `#2563EB` (blue-600) | `#FFFFFF` | Charger has an upcoming booking |
| Charging | `#7C3AED` (violet-600) | `#FFFFFF` | Active charging session |
| Blocked for Maintenance | `#EA580C` (orange-600) | `#FFFFFF` | Admin-set maintenance block |
| Unavailable | `#6B7280` (grey-500) | `#FFFFFF` | Temporarily unavailable |
| Faulted | `#DC2626` (red-600) | `#FFFFFF` | Charger error |
| AuthorizationFailed (CSMS) | `#DC2626` | `#FFFFFF` | Warning: CSMS sync failed |
| AuthorizationPending | `#D97706` (amber-600) | `#FFFFFF` | CSMS authorization in progress |

**Notification severity colours:**

| Severity | Accent Hex | Icon |
|---|---|---|
| Info | `#3B82F6` (blue-500) | information-circle |
| Warning | `#F59E0B` (amber-500) | exclamation-triangle |
| Critical | `#EF4444` (red-500) | exclamation-circle |

### Typography

| Role | Font | Size / Weight | Line Height |
|---|---|---|---|
| Page heading H1 | Inter, system-ui | 24px / 700 | 1.2 |
| Section heading H2 | Inter, system-ui | 20px / 600 | 1.3 |
| Card heading H3 | Inter, system-ui | 16px / 600 | 1.4 |
| Body text | Inter, system-ui | 14px / 400 | 1.5 |
| Small / meta | Inter, system-ui | 12px / 400 | 1.4 |
| Monospace (IDs, timestamps, payloads) | `JetBrains Mono`, `Consolas`, monospace | 12px / 400 | 1.5 |
| Button label | Inter, system-ui | 14px / 600 | 1 |
| KPI hero number | Inter, system-ui | 36px / 700 | 1 |
| KPI sub-label | Inter, system-ui | 12px / 500 | 1.3 |

Font loading: use `@import` from Google Fonts for Inter (weights 400, 600, 700) and JetBrains Mono (weight 400). Both are free and CDN-fast.

### Spacing Scale

Based on Tailwind's default 4px base unit:

`4px · 8px · 12px · 16px · 20px · 24px · 32px · 40px · 48px · 64px · 80px · 96px`

Component-level defaults:
- Card inner padding: `24px` all sides on desktop; `16px` on mobile.
- Form field vertical gap: `16px`.
- Section gap between cards on a dashboard row: `16px`.
- Page horizontal padding: `24px` desktop, `16px` mobile.
- Nav bar height: `56px` desktop, `56px` mobile.

### Border Radius

| Surface | Radius |
|---|---|
| Cards | `12px` |
| Buttons (primary/secondary) | `8px` |
| Input fields | `6px` |
| Status badges / pills | `999px` (fully rounded) |
| Modals / drawer panels | `16px` |
| Notification toast | `10px` |
| Avatar circles | `999px` |

### Shadow Language

| Context | Shadow |
|---|---|
| Card resting | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.07)` |
| Card hover / focused | `0 4px 12px rgba(0,0,0,0.18)` |
| Modal overlay | `0 20px 60px rgba(0,0,0,0.4)` |
| Dropdown menu | `0 4px 16px rgba(0,0,0,0.18)` |
| Floating action button | `0 4px 10px rgba(0,0,0,0.2)` |

### Icon Library

Use **Heroicons v2** (MIT licence, ships as `@heroicons/react`). Use outline variants by default; switch to solid on active/selected states only. Do NOT import icons you don't use — import individually. Common icons:

- `BoltIcon` — EV charging, energy
- `CalendarIcon` — bookings
- `ClockIcon` — time slots, session duration
- `MapPinIcon` — location
- `CheckCircleIcon` — success, available
- `XCircleIcon` — error, faulted
- `ExclamationTriangleIcon` — warning
- `BellIcon` / `BellAlertIcon` — notifications
- `UserCircleIcon` — profile
- `ChevronRightIcon` / `ChevronLeftIcon` — navigation
- `ArrowPathIcon` — refresh/sync indicator
- `MagnifyingGlassIcon` — search
- `FunnelIcon` — filter
- `PlusIcon` — create actions
- `TrashIcon` — delete
- `PencilSquareIcon` — edit

### Tone

**Corporate-operational with clean data-dense clarity.** This is a facilities management and sustainability platform, not a consumer app. The tone is confident, informative, and efficient — not playful. Status is always visible. Numbers are the hero. White space is used to separate data zones, not to decorate. The dark (`brand-900` / `brand-800`) background on the dashboard and nav creates an operations-centre aesthetic appropriate for a demo to management and sustainability stakeholders.

---

## Responsive / Mobile-First Layout Guidance

### Breakpoints

| Name | Minimum width | Target device |
|---|---|---|
| `xs` | 320px | Small phones (iPhone SE) |
| `sm` | 375px | Standard phones |
| `md` | 768px | Large phones / small tablets (landscape) |
| `lg` | 1024px | Tablets, small laptops |
| `xl` | 1280px | Desktop, projector |

Tailwind breakpoints map directly: use `md:`, `lg:`, `xl:` prefixes. All layout decisions start at `xs` and add overrides at wider breakpoints.

### Grid Approach

- Mobile (`xs`–`sm`): Single-column layout. Full-width cards. Nav collapses to hamburger.
- Tablet (`md`): Two-column grid for charger cards. Sidebar or bottom-sheet for filters.
- Desktop (`lg`+): Three or four-column grid for charger cards. Sidebar filters always visible. Reports use 2–3 column KPI rows plus full-width charts.

Use Tailwind's `grid` utilities: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` for charger cards.

### What Collapses on Mobile

| Element | Desktop behaviour | Mobile behaviour |
|---|---|---|
| Nav items | Horizontal nav bar | Hamburger icon → slide-in drawer |
| Admin dropdown | Dropdown menu | Drawer sub-menu |
| Filter bar (dashboard) | Always visible row under nav | Collapsible drawer toggled by FunnelIcon button |
| Reporting sidebar filters | Fixed sidebar column | Bottom drawer |
| Dashboard charger grid | 3–4 columns | 1 column stacked cards |
| Table views (bookings, audit log) | Full columns | Card-per-row (hide secondary columns) |
| Booking form | 2-column field layout | 1-column full-width |
| Modal dialogs | Centred dialog box | Bottom sheet (slide up from bottom) |

### What Stays on Desktop

- Admin dashboard KPI tile rows (3–4 tiles per row): stay side by side at all sizes above `lg`.
- Reports charts: use full-width at all sizes; reduce chart height on mobile.
- AI insights panel: full-width at all sizes; grounding block collapses to an accordion on mobile.

### Projector Demo Considerations

- Minimum touch target: 44 × 44px for all interactive elements. All buttons and nav items satisfy this.
- Status badges must be large enough to read from 2 metres: minimum 14px badge text, 28px badge height.
- KPI hero numbers at 36px are legible on a standard projector.
- High contrast: all status badge foreground/background combinations clear WCAG AA (4.5:1 minimum).
- Do not rely on hover states to reveal information; all status/label text is visible on load.
- Dark theme reduces projector glare — keep brand-900 background on operational screens.
- Demo-ready charger cards should show at least two different status colours at rest (seed data ensures this).

---

## App Navigation Structure

### Navigation Type

Single persistent top navigation bar (`NavBar` component). On `md` and below it collapses to a hamburger icon that opens a full-screen drawer. The nav bar height is `56px` fixed. The remaining viewport below the nav is the page content area.

### Primary Destinations

| Nav label | Route | Visible to roles |
|---|---|---|
| Dashboard | `/dashboard` | All authenticated |
| My Bookings | `/my-bookings` | StandardUser |
| Operations | `/operations/bookings` | Security, Workplace, Admin |
| Reports | `/reports` | Admin, Workplace, ReportingESGViewer, Management |
| Admin (dropdown) | — | Admin only |

### Secondary Actions (always in nav)

| Element | Behaviour |
|---|---|
| Bell icon with unread badge | Links to `/notifications`; badge count from `GET /notifications/unread-count` |
| Avatar / display name | Links to `/profile` |
| Logout | Calls `POST /auth/logout`, clears localStorage, redirects to `/login` |

### Admin Dropdown Items

- Users → `/admin/users`
- Maintenance → `/admin/maintenance`
- Audit Log → `/admin/audit`
- Notifications Audit → `/admin/notifications`
- Config → `/admin/config`

### Breadcrumb Policy

No global breadcrumb component. Individual detail screens show a single back-chevron link to the originating list screen. Example: Booking Detail shows "← My Bookings" for a StandardUser, or "← Operations" for an operator.

### Reports Internal Tab Bar

The `/reports` page renders a horizontal tab bar immediately below the page heading:

`Overview | Sessions | Energy | Utilisation | Sustainability | AI Insights`

AI Insights is a P2 tab; it renders a lock icon if unavailable but is not hidden.

### Navigation Tree (ASCII)

```
/ (root) → redirects to /dashboard if authenticated, /login if not
│
├── /login                             PUBLIC — all users
├── /privacy                           AUTH — StandardUser (redirected before first booking)
│
├── /dashboard                         AUTH — all roles
│
├── /bookings
│   ├── /new                           AUTH — StandardUser, Workplace, Admin
│   └── /:id                           AUTH — owner / Security / Workplace / Admin
│
├── /my-bookings                       AUTH — StandardUser
│
├── /operations
│   └── /bookings                      AUTH — Security, Workplace, Admin
│
├── /notifications                     AUTH — all roles
├── /profile                           AUTH — all roles
│
├── /reports                           AUTH — Admin, Workplace, ReportingESGViewer, Management
│   └── /ai                            AUTH — Admin, ReportingESGViewer, Management (P2)
│
├── /admin                             AUTH — Admin only
│   ├── /users
│   │   ├── /new
│   │   └── /:id/edit
│   ├── /maintenance
│   ├── /audit
│   ├── /notifications
│   └── /config
│
└── * (catch-all)                      → /404
```

### Route Guards

| Guard | Routes | Redirect on failure |
|---|---|---|
| `RequireAuth` | All routes except `/login` | → `/login` |
| `RequireRole` | `/operations/**`, `/admin/**`, `/reports` | → `/dashboard` + "Not authorized" toast |
| `RequirePrivacyAck` | `/bookings/new` | → `/privacy` with `?returnTo=/bookings/new` |
| `RequireEligibility` | `/bookings/new` | → `/dashboard` + "Not eligible" inline banner |

---

## Screen List

| # | Screen Name | Route | Primary User Story | Priority |
|---|---|---|---|---|
| 1 | Login | `/login` | US-001 | P0 |
| 2 | Privacy Notice | `/privacy` | US-005 | P0 |
| 3 | Charger Availability Dashboard | `/dashboard` | US-014 | P0 |
| 4 | Booking Form | `/bookings/new` | US-007 | P0 |
| 5 | Booking Confirmation (post-submit inline state) | `/bookings/new` (success state) | US-007, US-018 | P0 |
| 6 | My Bookings | `/my-bookings` | US-008 | P0 |
| 7 | Booking Detail | `/bookings/:id` | US-008, US-009, US-010 | P0 |
| 8 | Cancel Booking (modal) | Modal on My Bookings / Booking Detail | US-009 | P0 |
| 9 | Notification Center | `/notifications` | US-021 | P0 |
| 10 | Reporting Dashboard | `/reports` | US-026, US-027 | P0 (P0 summary tile) / P1 (full metrics) |
| 11 | Operational Bookings (Today) | `/operations/bookings` | US-013 | P1 |
| 12 | Release Booking (modal) | Modal on Operations / Booking Detail | US-010, US-011 | P1 |
| 13 | Eligible EV User Management | `/admin/users` | US-003 | P1 |
| 14 | Eligible EV User Form | `/admin/users/new`, `/admin/users/:id/edit` | US-003 | P1 |
| 15 | My Profile / Vehicle | `/profile` | US-004 | P1 |
| 16 | Audit Log | `/admin/audit` | US-032 | P1 |
| 17 | Charger Status Control (modal) | Modal on Dashboard | US-015 | P1 |
| 18 | Maintenance Block Management | `/admin/maintenance` | US-020, US-030 | P1 |
| 19 | Notification Audit (Admin) | `/admin/notifications` | US-025 | P2 |
| 20 | AI Insights Panel | `/reports/ai` (tab in Reports) | US-029 | P2 |
| 21 | System Config | `/admin/config` | US-012 (config values) | P2 |
| 22 | Admin Booking on Behalf | Modal or form extension | US-031 | P2 |
| 23 | Override Booking (modal) | Modal on Operations | US-012 | P2 |
| 24 | 404 / Not Found | `/404` | — | P0 |

**Summary by priority: P0 = 10, P1 = 8, P2 = 6. Total: 24.**

---

## Page-by-Page UI Design

### Screen 1 — Login (`/login`)

**Purpose:** Authenticate a seeded user and receive a JWT. Simplified for the hackathon with role selector visible.

**Primary user:** All roles.

**Layout sketch:**

```
┌─────────────────────────────────────────────┐
│                                             │
│         [BOLT ICON]  NEXLevel Charge        │
│    AI-Powered EV Charging Orchestration     │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Email                              │    │
│  │  [______________________________]   │    │
│  │  Password                           │    │
│  │  [______________________________]   │    │
│  │                                     │    │
│  │  [Sign In ──────────────────────]   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Demo quick-select: [Alice][Bob][Admin][Security]
│                                             │
└─────────────────────────────────────────────┘
```

**Key sections:**
- Centred card on a brand-900 background. Card background brand-800.
- Logo area: BoltIcon + "NEXLevel Charge" wordmark in brand-400, subtitle in grey-300.
- Email field (type=email), Password field (type=password, show/hide toggle).
- Primary sign-in button: full-width, brand-400 background, white text.
- Demo quick-select row (below button): small role-chip buttons that pre-fill email/password from seeded demo accounts. Label: "Demo accounts:". These are visible only in development builds.
- No registration link (out of scope).

**Primary CTA:** Sign In button.

**Secondary actions:** Demo quick-select chips.

**Error state:** Inline error below the password field for 401. Field-level error below email for 400 format validation.

**Links from this screen:** On success → `/dashboard` (or `/privacy` if privacy not acknowledged).

---

### Screen 2 — Privacy Notice (`/privacy`)

**Purpose:** Render the current privacy notice and require explicit acknowledgement before the user can create their first booking.

**Primary user:** StandardUser (any role that has not acknowledged the current version).

**Layout sketch (mobile-first, single column):**

```
┌──────────────────────────────────────────┐
│  [← Dashboard]    Privacy Notice         │
├──────────────────────────────────────────┤
│  Version v1 · Effective 1 May 2026       │
│                                          │
│  ## Privacy Notice                       │
│  We store the following personal data …  │
│  [full rendered markdown content]        │
│                                          │
│  ─────────────────────────────────────── │
│  [✓ Acknowledge and Continue ──────────] │
│                                          │
└──────────────────────────────────────────┘
```

**Key sections:**
- Page heading: "Privacy Notice" with version badge and effective date (from `GET /privacy-notice` response fields `version` and `effectiveDate`).
- Scrollable content area: renders the `content` field as Markdown (using a lightweight markdown renderer or `dangerouslySetInnerHTML` with sanitization). Use `prose` typography style for readability.
- Sticky bottom bar (or bottom of content): single full-width CTA button.
- If the user arrives here from `?returnTo=...`, on successful acknowledgement redirect to the `returnTo` URL.

**Primary CTA:** "Acknowledge and Continue" button. Calls `POST /privacy-notice/acknowledge` with `{ "version": "v1" }`. On 201 success, redirects to returnTo or `/dashboard`.

**Error state:** If the POST returns 400 `VersionMismatch`, show a banner: "The privacy notice has been updated. Please reload the page to read the latest version." with a Reload button.

**Loading state:** Spinner while `GET /privacy-notice` loads. Skeleton placeholder for the text body.

**Empty/error state:** If `GET /privacy-notice` returns 500, show a full-page error with "Unable to load privacy notice" and a Retry button.

---

### Screen 3 — Charger Availability Dashboard (`/dashboard`)

**Purpose:** Real-time view of all chargers at both sites. The P0 hero screen.

**Primary user:** All authenticated roles.

**Layout sketch (desktop 3-column):**

```
┌─ NavBar ──────────────────────────────────────────────────────────────────┐
│ NEXLevel Charge   Dashboard  My Bookings  Reports  [Admin▾]  🔔3  [A]  □  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  EV Charging Availability              Last synced: 08:14:55 [↻]        │
│                                                                           │
│  [All Locations ▾]  [All Statuses ▾]          [Book a Charger →]         │
│                                                                           │
│  NEX Tower                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ ● AVAILABLE │  │ ● CHARGING  │  │ ● RESERVED  │  │ ● FAULTED   │     │
│  │ CH-01       │  │ CH-02       │  │ CH-03       │  │ CH-04       │     │
│  │ NEX Tower   │  │ 14 min      │  │ 09:00–10:00 │  │ Error       │     │
│  │ Connector 1 │  │ 4.21 kWh   │  │             │  │             │     │
│  │ [Book →]    │  │ [Detail →]  │  │ [Detail →]  │  │ [Detail →]  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                           │
│  NEXTERACOM                                                               │
│  ┌─────────────┐  ┌─────────────┐  ...                                  │
│  │ ● AVAILABLE │  │ ● MAINT.    │                                        │
│  └─────────────┘  └─────────────┘                                        │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

**Key sections:**
- Page heading with last-sync timestamp and a manual refresh icon (ArrowPathIcon). Timestamp comes from the most recent `lastCsmsSyncAt` across all charger records.
- Filter bar: Location dropdown (`All Locations`, `NEX Tower`, `NEXTERACOM`) and Status dropdown (multi-select chips for each of the 6 statuses). Filters apply client-side to the already-fetched `GET /chargers` response.
- Charger cards grouped under location section headings. Each card shows:
  - Status badge (coloured pill, full status label, e.g. "AVAILABLE", "CHARGING").
  - Charger display name and connector number.
  - Location name.
  - If `Charging`: elapsed time in minutes and `energyKwh` kWh. `userDisplayName`, `vehicleMake`, `vehicleModel` shown as `***` for non-admin or real values for admin/security/workplace.
  - If `Reserved`: the booking time window (start–end).
  - If `Faulted`: "Error — contact security" label.
  - If `BlockedForMaintenance`: "Maintenance" label with reason if available.
  - Primary action button: "Book" if `Available` (StandardUser, Workplace, Admin); "Detail" otherwise. Admin/Security/Workplace also see a "Status" button on any card.
- Polling: `GET /chargers` called every 5 seconds via `setInterval`. Loading skeleton is shown only on the initial load, not on poll refresh (silent refresh).

**Primary CTA:** "Book a Charger" button in the top filter row (scrolls to the first Available card or opens the booking form pre-selecting the first available charger).

**Secondary actions:** Location filter, Status filter, Manual refresh, individual card "Detail" and "Status" buttons.

**Mobile layout:** Single-column card stack. Filter bar collapses into a single "Filters" button that opens a bottom drawer. Status badge remains large and prominent. Cards are full-width with generous padding.

**Empty state:** If no chargers match the filter: "No chargers match your filter. Try removing a filter or check back shortly." with a Clear Filters button.

**Loading state (initial):** Skeleton cards — matching the card dimensions, shimmer animation, showing the location section headings.

**Error state:** If the poll returns a 500 or network error, show a non-blocking yellow banner at the top of the card grid: "Live charger data temporarily unavailable — showing last known status." The cards remain visible with their last-known data.

---

### Screen 4 — Booking Form (`/bookings/new`)

**Purpose:** Create a booking for a selected charger.

**Primary user:** StandardUser (own booking), Workplace (on behalf), Admin (on behalf + override).

**Layout sketch (mobile single column):**

```
┌───────────────────────────────────────────┐
│  [← Dashboard]    Book a Charger          │
├───────────────────────────────────────────┤
│                                           │
│  Charger *                                │
│  [NEX Tower Charger 1 (Available) ▾]      │
│                                           │
│  ⚡ Fair use: max 1 hour per day          │
│     You have 60 minutes available today.  │
│                                           │
│  Start time *                             │
│  [09:00 ▾]                                │
│                                           │
│  End time *                               │
│  [10:00 ▾]                                │
│  ✓ Duration: 60 minutes (max allowed)     │
│                                           │
│  Vehicle make *                           │
│  [Tesla_____________________________]     │
│                                           │
│  Vehicle model *                          │
│  [Model 3__________________________]      │
│                                           │
│  ── Admin / Workplace only ─────────────  │
│  Book on behalf of                        │
│  [Select user ▾]                          │
│  Reason for override                      │
│  [__________________________________]     │
│                                           │
│  [Confirm Booking ─────────────────────]  │
│  [Cancel]                                 │
│                                           │
└───────────────────────────────────────────┘
```

**Key sections:**
- Back chevron to `/dashboard`.
- Charger selector: dropdown or pre-selected if navigated from a specific charger card on the dashboard. Shows charger display name and current status badge. Only Available chargers are offered to StandardUser.
- Fair-use information box (blue/info background): "Max 1 hour per day. You have X minutes available today." Computed from existing confirmed/active bookings (informational only — not authoritative; server enforces the rule).
- Start time and End time pickers. Use `<input type="time">` constrained to same-day. Show live duration calculation below end time: "Duration: X minutes." Colour code: green ≤60 min, red >60 min.
- Vehicle make and model text fields. Pre-filled from `GET /auth/me` → `eligibility.vehicleMake` / `vehicleModel` if available. Editable.
- "Book on behalf of" section: visible only if the user's role is Workplace or Admin. Shows a user search dropdown (`GET /eligible-users`). If a target user is selected, a "Reason" text area becomes required.
- Confirm Booking button: full-width primary button. Disabled until required fields are valid.
- Cancel text link: returns to dashboard without creating a booking.

**Primary CTA:** Confirm Booking.

**Data shown:** Charger options from `GET /chargers?status=Available`, user's existing daily usage from `GET /bookings?state=Confirmed,Active&dateFrom=<today>&dateTo=<tomorrow>` (for the fair-use informational display only).

**API calls:** `POST /bookings` on submit.

**Validation (client-side, before submit):**
- Charger: required.
- Start time: required, must be ≥ now (within 1-minute tolerance).
- End time: required, must be > start time.
- Duration hint: `endTime − startTime > 60 min` shows a warning but still allows submission (server enforces for non-admin).
- Vehicle make: required, non-empty.
- Vehicle model: required, non-empty.
- Reason for override: required (non-empty) when booking on behalf as Workplace/Admin and a rule would be violated.

**Error handling:** Field-level errors below each input from the `errors[]` array on 400/409 responses. A form-level error banner at the top for 403 `NotEligible` or `PrivacyNotAcknowledged`.

**Loading state:** Submit button shows a loading spinner; form fields become disabled during the API call (prevent double-submit).

---

### Screen 5 — Booking Confirmation (inline success state on `/bookings/new`)

**Purpose:** Confirm the booking result including the CSMS authorization status. Shown in place of the booking form after a successful `POST /bookings` 201 response.

**Primary user:** StandardUser, Workplace, Admin.

**Layout sketch:**

```
┌───────────────────────────────────────────┐
│              Booking Confirmed! ✓         │
│                                           │
│  NEX Tower Charger 1                      │
│  09:00 – 10:00 · 60 min                  │
│  Tesla Model 3                            │
│                                           │
│  CSMS Status: ● Authorized                │
│  Ready to charge at the station.          │
│                                           │
│  ⚠ AuthorizationFailed                   │
│  (shown instead if csmsSyncStatus =       │
│   AuthorizationFailed)                    │
│  Contact operations — booking created     │
│  but charger authorization failed.        │
│                                           │
│  [View My Bookings]  [Back to Dashboard]  │
│                                           │
└───────────────────────────────────────────┘
```

**Key sections:**
- Success icon (CheckCircleIcon, green) and heading.
- Booking summary: charger name, start–end times, duration, vehicle.
- CSMS sync status badge (see colour coding in design section):
  - `Authorized` → green, "Ready to charge at the station."
  - `AuthorizationPending` → amber spinner, "Authorising at charger..." — auto-polls until status resolves.
  - `AuthorizationFailed` → red warning banner: "Contact operations — booking created but charger authorization failed." (This is per the api-contract.md note: 201 is returned even on CSMS failure; frontend must inspect `csmsSyncStatus`.)
- Notification preview note: "A booking confirmation has been sent to your notification center." with a link.
- Two CTA buttons: View My Bookings, Back to Dashboard.

---

### Screen 6 — My Bookings (`/my-bookings`)

**Purpose:** List all bookings owned by the current StandardUser.

**Primary user:** StandardUser.

**Layout sketch (mobile — card list):**

```
┌───────────────────────────────────────────┐
│  My Bookings                  [+ Book]    │
├───────────────────────────────────────────┤
│  Today  ────────────────────────────────  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ ● CONFIRMED       09:00–10:00       │  │
│  │ NEX Tower Charger 1 · Tesla Model 3 │  │
│  │ CSMS: ● Authorized                  │  │
│  │ [Detail →]  [Cancel]                │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Past  ──────────────────────────────────  │
│  ┌─────────────────────────────────────┐  │
│  │ ✓ COMPLETED       Yesterday         │  │
│  │ NEXTERACOM Charger 2 · Renault Zoe  │  │
│  │ 18.42 kWh                           │  │
│  │ [Detail →]                          │  │
│  └─────────────────────────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
```

**Key sections:**
- Page heading with a "Book" shortcut button.
- Bookings grouped by date section (Today, Yesterday, Earlier).
- Each booking card shows: state badge, charger name, time window, vehicle make/model, `csmsSyncStatus` badge.
- For Confirmed or Active bookings: Cancel and/or Release action buttons inline (Release only for Active, per BR-010/011).
- For Completed bookings: `energyKwh` from the linked session if available.
- Tapping the card or "Detail" navigates to `/bookings/:id`.

**Data source:** `GET /bookings` scoped to own bookings (backend returns only own for StandardUser). Default sort: `startTime desc`. Load with `limit=100` to avoid pagination complexity on a small dataset.

**Empty state:** Illustration concept (a stylised charger with an empty slot), heading "No bookings yet", body "Book a charging slot to get started.", CTA "Book a Charger".

**Loading state:** Three skeleton card items while data loads.

**Error state:** "Could not load your bookings. Tap to retry." with a retry affordance.

---

### Screen 7 — Booking Detail (`/bookings/:id`)

**Purpose:** Full detail of a single booking with the linked charging session.

**Primary user:** StandardUser (own booking), Security, Workplace, Admin.

**Layout sketch (single column):**

```
┌───────────────────────────────────────────┐
│  [← My Bookings]    Booking Detail        │
├───────────────────────────────────────────┤
│  NEX Tower Charger 1                      │
│  ● ACTIVE          09:00 – 10:00          │
│  Tesla Model 3                            │
│  CSMS: ● Authorized                       │
│                                           │
│  ── Charging Session ─────────────────── │
│  ● CHARGING                               │
│  Started: 09:02   Energy: 4.21 kWh        │
│  Source: CSMS-Simulator ⚠ (simulated)     │
│                                           │
│  ── Actions ────────────────────────────  │
│  [Release Booking]                        │
│  (Admin/Security/Workplace only:)         │
│  [Override ▾]  [Release (Operator)]       │
│                                           │
│  ── Booking Info ───────────────────────  │
│  ID: 3fa8...                              │
│  Created: 2026-05-23 08:01               │
│  Location: NEX Tower (NEX-TOWER)          │
│  Booking reference: EID-00123-20260523    │
│                                           │
└───────────────────────────────────────────┘
```

**Key sections:**
- Back chevron (context-aware: "My Bookings" for StandardUser, "Operations" for operator).
- Charger name, booking state badge, time window, vehicle, `csmsSyncStatus` badge (with visual treatment per design section).
- Charging session block: visible when a linked session exists. Shows session state, start time, `energyKwh`, `source` field. If `source = "CSMS-Simulator"` display a small "Based on simulated demo data" disclaimer.
- Actions block: context-aware by role and booking state:
  - StandardUser with Confirmed booking: "Cancel" button.
  - StandardUser with Active booking: "Release" button.
  - Security/Workplace/Admin: "Release (Operator)" button (requires reason). Admin additionally gets "Override" button.
  - Terminal states (Cancelled, Released, Completed, NoShow, Overridden): no action buttons.
- Booking metadata section: booking ID (monospace), creation timestamp, location code, `csmsIdTag` (monospace, partially masked for non-admin), `reasonForOverride` if present (labelled "Override reason:").

**Data source:** `GET /bookings/:id`.

---

### Screen 8 — Cancel Booking Modal

**Purpose:** Confirm cancellation of a Confirmed booking. Rendered as a modal dialog over My Bookings or Booking Detail.

**Layout:**

```
┌──────────────────────────────────────────┐
│  Cancel Booking                       ✕  │
├──────────────────────────────────────────┤
│  Are you sure you want to cancel your    │
│  booking for NEX Tower Charger 1         │
│  09:00 – 10:00 today?                    │
│                                          │
│  The slot will be freed immediately.     │
│  CSMS authorization will be revoked.     │
│                                          │
│  [Confirm Cancel]  [Keep Booking]        │
└──────────────────────────────────────────┘
```

**Validation:** No fields for StandardUser. If Admin cancelling someone else's booking, a "Reason" textarea appears and is required.

**API call:** `PUT /bookings/:id/cancel`.

**Success:** Modal closes, booking card updates to Cancelled state, toast "Booking cancelled successfully."

**Error:** Error message inside the modal on 409 (invalid state transition) or 400.

---

### Screen 9 — Notification Center (`/notifications`)

**Purpose:** The user's in-app notification feed showing booking and session lifecycle events.

**Primary user:** All authenticated roles.

**Layout sketch:**

```
┌──────────────────────────────────────────┐
│  Notifications              [Mark all ✓] │
├──────────────────────────────────────────┤
│  [All ▾]  [Unread only]  [Severity ▾]   │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │ 🔵 Info   •  Booking confirmed   │    │
│  │ NEX Tower Charger 1 · 09:00–10:00│    │
│  │ Tesla Model 3                    │    │
│  │ 08:01 · In-App                   │    │
│  │ [View Booking →]                 │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ ⚠ Warning  Booking grace warning │    │
│  │ Your slot starts in 10 min and   │    │
│  │ charging has not begun.          │    │
│  │ 09:05 · In-App    [UNREAD]       │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

**Key sections:**
- Page heading with "Mark all read" action.
- Filter row: All/Unread toggle, Severity multi-select.
- Notification items. Each item shows:
  - Severity indicator: coloured left border + icon (Info/Warning/Critical).
  - `title` field as bold heading.
  - `body` field as body text.
  - `timestamp` (formatted: "08:01 today", "Yesterday 14:22", ISO for older).
  - Channel indicator chip: "In-App".
  - `readState`: unread items have a subtle highlight background (brand-800 with a subtle blue tint vs brand-900 for read).
  - "View Booking/Session" link if `linkedBookingId` or `linkedSessionId` is set.
- Tapping a notification marks it read (`PUT /notifications/:id/read`) and navigates to the linked entity.
- Pagination: "Load more" button at the bottom (default `limit=20`, adds 20 per tap).

**Data source:** `GET /notifications` (InApp only, sorted by `timestamp desc`). Unread count badge in NavBar from `GET /notifications/unread-count`.

**Empty state:** BellIcon illustration, "You have no notifications yet.", sub-copy "Booking confirmations, reminders, and alerts will appear here."

**Loading state:** Three skeleton notification items.

---

### Screen 10 — Reporting Dashboard (`/reports`)

**Purpose:** Operational and sustainability metrics with date and location filters.

**Primary user:** Admin, Workplace, ReportingESGViewer, Management.

**Layout sketch (desktop — 3 KPI tiles then charts):**

```
┌───────────────────────────────────────────────────────────────────┐
│  Reports & Sustainability                                         │
│  [Overview][Sessions][Energy][Utilisation][Sustainability][AI ✦]  │
├───────────────────────────────────────────────────────────────────┤
│  Date: [Last 7 days ▾]  Location: [All ▾]          [Apply]       │
│                                                                   │
│  ⚠ Based on simulated demo data                                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  57          │  │  412.6 kWh   │  │  350.7 kg    │            │
│  │ Sessions     │  │ Total Energy │  │ CO₂ Savings  │            │
│  │              │  │              │  │ (0.85 kg/kWh)│            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                   │
│  Sessions tab view:                                               │
│  ┌──────────────────────┐   ┌────────────────────────────┐        │
│  │ Session status split │   │ Peak hour distribution     │        │
│  │ (pie or donut chart) │   │ (bar chart, hour 0–23)     │        │
│  └──────────────────────┘   └────────────────────────────┘        │
│                                                                   │
│  Most-used chargers (ranked list)                                 │
│  Location comparison: NEX Tower vs NEXTERACOM                     │
└───────────────────────────────────────────────────────────────────┘
```

**Key sections:**

**Overview tab (P0 — must be done):**
- Simulated data label banner: renders `simulatedDataLabel` verbatim when non-null. Yellow warning background, ExclamationTriangleIcon.
- Three KPI hero tiles: Total Sessions (`totalSessions`), Total Energy (`totalKwh` kWh), Estimated CO₂ Savings (`estimatedCo2SavingsKg` kg) with the emission factor visible beneath (`emissionFactorUsed` kg/kWh label).
- Data from `GET /reports/summary`.

**Sessions tab (P1):**
- KPI tiles: Completed, Cancelled, Released, NoShow counts (from `GET /reports/sessions`).
- Avg session duration and avg kWh per session KPI tiles.
- Pie/donut chart: session state distribution.
- Bar chart: peak hour distribution (from `GET /reports/energy` → `peakHourDistribution`, 24 bars).

**Energy tab (P1):**
- Total kWh and avg kWh hero tiles.
- Bar chart: charger ranking by session count and total kWh (`chargerRanking` array).

**Utilisation tab (P1):**
- Table: per-charger utilization percent, faulted event count (from `GET /reports/utilization`).
- Location comparison block: two side-by-side metric cards for NEX Tower and NEXTERACOM (`locationComparison`).

**Sustainability tab (P1):**
- Total kWh, CO₂ savings hero tiles.
- Stacked bar or grouped chart: usage by vehicle make (`usageByVehicleCategory`). Groups with < 3 users show as "Other".
- Note: "Emission factor: 0.85 kgCO₂/kWh. Groups with fewer than 3 users are aggregated for privacy."

**AI Insights tab (P2):** — see Screen 20.

**Data filters:** `dateFrom`/`dateTo` date range picker (presets: Today, Last 7 days, Last 30 days, Custom). Location dropdown. Apply button sends new query params. Applied filters reflected in `appliedFilters` response field.

**Loading state:** Skeleton tiles and chart placeholders.

**Empty state (no data for range):** "No data available for this period. Try adjusting the date range or check that seeded sessions exist."

---

### Screen 11 — Operational Bookings (`/operations/bookings`)

**Purpose:** Security / Workplace / Admin view of all bookings today, across both sites.

**Primary user:** Security, Workplace, Admin.

**Layout sketch (desktop — table view):**

```
┌──────────────────────────────────────────────────────────────────┐
│  Operations — Today's Bookings                                   │
│  [All Locations ▾]  [All States ▾]  [Search user…]              │
├──────────────────────────────────────────────────────────────────┤
│  User          Charger         Time       State      CSMS        │
│  ──────────────────────────────────────────────────────────────  │
│  Alice Standard  NEX-TOWER-CH-01  09:00–10:00  ● ACTIVE   ✓Auth  │
│  Bob Driver      NEXTERACOM-CH-01 10:00–11:00  ○ CONFIRMED ✓Auth │
│  (no-show user)  NEX-TOWER-CH-02  08:00–09:00  ✕ NOSHOW   Revoked│
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│  [Load more]                                                     │
└──────────────────────────────────────────────────────────────────┘
```

**Key sections:**
- Filters: location, state, free-text user search.
- Table columns: User (display name), Charger, Time window, State badge, `csmsSyncStatus` badge, Vehicle, Actions.
- Actions column per row: "Detail" link → `/bookings/:id`. For Active/Confirmed: "Release" button (opens release modal).
- Mobile: table collapses to card-per-row showing key fields only.

**Data source:** `GET /bookings?dateFrom=<today-start>&dateTo=<today-end>` (Security/Workplace/Admin see all).

---

### Screen 12 — Release Booking Modal

**Purpose:** Operator releases another user's Active booking with a mandatory reason.

**Layout:**

```
┌──────────────────────────────────────────┐
│  Release Booking                      ✕  │
├──────────────────────────────────────────┤
│  Release booking for Alice Standard on  │
│  NEX Tower Charger 1 (09:00–10:00)?     │
│                                          │
│  Reason *                                │
│  [__________________________________]    │
│                                          │
│  This action will be audit-logged.       │
│  CSMS authorization will be revoked.     │
│                                          │
│  [Confirm Release]  [Cancel]             │
└──────────────────────────────────────────┘
```

**Validation:** Reason field required for operator; optional for user releasing own booking.

**API call:** `PUT /bookings/:id/release` with `{ reason: "..." }`.

**Success:** Modal closes, table row updates, toast "Booking released."

---

### Screen 13 — Eligible EV User Management (`/admin/users`)

**Purpose:** Admin CRUD on the eligible EV user registry. Security and Workplace have read-only access.

**Primary user:** Admin (full), Security / Workplace (read-only).

**Layout sketch:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Eligible EV Users                              [+ Add User]     │
│  [Search name or EID…]  [Status ▾]  [Site ▾]                    │
├──────────────────────────────────────────────────────────────────┤
│  Name              EID        Status    Vehicle        Site      │
│  ─────────────────────────────────────────────────────────────── │
│  Alice Standard    EID-00123  ● Active  Tesla Model 3  Both      │
│  Bob Driver        EID-00456  ● Active  Renault Zoe    NexTower  │
│  Carol Suspended   EID-00789  ○ Suspended  —           Nexteracom│
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│  [1] [2] [3] … pagination                                        │
└──────────────────────────────────────────────────────────────────┘
```

**Key sections:**
- "Add User" button (Admin only, hidden for Security/Workplace).
- Search bar (substring on `displayName` or `workplaceRegistryEid`).
- Status and site filters.
- Table columns: Name, EID (`workplaceRegistryEid`), `eligibilityStatus` badge, Vehicle (`vehicleMake` `vehicleModel`), `siteContext`, Privacy acknowledged (Yes/No), Actions.
- Actions per row (Admin): Edit link → `/admin/users/:id/edit`, Suspend/Activate toggle, Delete (with confirmation).
- Pagination controls.
- Mobile: card-per-row layout.

**Data source:** `GET /eligible-users` with filters.

**Empty state:** "No eligible EV users found. Add the first user to get started." with CTA.

---

### Screen 14 — Eligible EV User Form (`/admin/users/new`, `/admin/users/:id/edit`)

**Purpose:** Create or update an eligible EV user record.

**Layout:** Single-column form (full-width on mobile, max 600px centred on desktop).

Fields rendered (see Form Validation section for rules): Email, Display Name, Role, Workplace Registry EID, Badge ID, Eligibility Status, Vehicle Make, Vehicle Model, Site Context, Password (create only).

**Primary CTA:** Save. Secondary: Cancel.

**API calls:** `POST /eligible-users` (create), `PUT /eligible-users/:id` (update).

---

### Screen 15 — My Profile / Vehicle (`/profile`)

**Purpose:** StandardUser self-view of eligibility and vehicle; edit vehicle make/model.

**Layout:**

```
┌──────────────────────────────────────────┐
│  My Profile                              │
├──────────────────────────────────────────┤
│  Alice Standard                          │
│  alice.standard@nexlevel.local           │
│  Role: Standard User                     │
│                                          │
│  Eligibility: ● Active                   │
│  EID: EID-00123                          │
│  Badge: BDG-00123                        │
│  Site: Both                              │
│                                          │
│  Privacy Notice: ✓ Acknowledged (v1)     │
│  Acknowledged: 2026-05-23 08:01          │
│                                          │
│  ── Vehicle ──────────────────────────── │
│  Make  [Tesla_________________________]  │
│  Model [Model 3______________________]  │
│                                          │
│  [Save Vehicle]                          │
│                                          │
└──────────────────────────────────────────┘
```

**Data source:** `GET /auth/me` (renders `eligibility` and `privacy` blocks). Edit calls `PUT /eligible-users/:id` with `{ vehicleMake, vehicleModel }`.

---

### Screen 16 — Audit Log (`/admin/audit`)

**Purpose:** Immutable audit trail. Admin sees all; Security/Workplace see operational scope only.

**Layout (table view):**

Columns: Timestamp, Actor (displayName), Role, Action, Entity Type, Entity ID (truncated), Reason, Source.

Filters: date range, actor (user search), action type dropdown, entity type dropdown.

Each row is read-only. No action buttons.

Mobile: card-per-row, showing timestamp, action, entity.

**Data source:** `GET /audit-logs`.

**Empty state:** "No audit entries for this filter. Try widening the date range."

---

### Screen 17 — Charger Status Control Modal

**Purpose:** Admin/Security/Workplace operationally set a charger's status.

**Trigger:** "Status" button on a charger card in the dashboard.

**Layout (modal):**

```
┌──────────────────────────────────────────┐
│  Update Charger Status — CH-01        ✕  │
├──────────────────────────────────────────┤
│  Current: ● AVAILABLE                    │
│                                          │
│  New Status *                            │
│  ○ Available  ● Unavailable             │
│  ○ Faulted    ○ Blocked for Maintenance  │
│                                          │
│  Reason *                                │
│  [__________________________________]    │
│                                          │
│  [Update Status]  [Cancel]               │
└──────────────────────────────────────────┘
```

**API call:** `PUT /chargers/:id/status`.

**Note:** `Reserved` and `Charging` are not selectable here (CSMS-driven only).

---

### Screen 18 — Maintenance Block Management (`/admin/maintenance`)

**Purpose:** Admin creates and removes maintenance blocks. Each block calls CSMS connector-block API on the backend.

**Layout (list + create form):**

Active blocks shown as cards with charger name, start/end, reason, "Remove Block" button. "Create Block" button opens a modal form (charger dropdown, start time, end time optional, reason required, `forceReleaseExistingBookings` checkbox for conflict override).

**Data source:** Maintenance blocks from a maintenance-blocks list endpoint (implied by the `POST /maintenance-blocks` and `DELETE /maintenance-blocks/:id` contract; the backend returns the created/remaining blocks).

---

### Screen 19 — Notification Audit (`/admin/notifications`) (P2)

**Purpose:** Cross-user, cross-channel notification history with payload preview. Admin sees all; Security/Workplace see operational scope.

**Layout (table view):**

Columns: Timestamp, Recipient, Trigger Event, Channel (In-App/Email/Teams chip), Delivery Status badge (Sent/Previewed/Failed), Correlation ID (truncated), Actions.

Actions per row: "View Payload" → opens a detail panel/modal showing the `payload` field — for Teams this renders the Adaptive Card JSON in a formatted code block with a collapsible preview; for Email this shows subject + body.

Filters: recipient user, channel, delivery status, trigger event, date range.

**Data source:** `GET /notifications/audit`.

---

### Screen 20 — AI Insights Panel (`/reports/ai` or Reports tab) (P2)

**Purpose:** Grounded NL summary, demand forecast, patterns, anomalies, recommendations.

**Primary user:** Admin, ReportingESGViewer, Management.

**Layout sketch:**

```
┌──────────────────────────────────────────────────────────────────┐
│  AI Insights                   [Refresh]     Confidence: Medium  │
│  ⚠ Based on simulated demo data                                  │
├──────────────────────────────────────────────────────────────────┤
│  Natural-language summary                                        │
│  "In the last 24 hours, 7 sessions delivered 41.3 kWh..."       │
│                                                                  │
│  ── Demand Forecast ─────────────────────────────────────────── │
│  Bar chart: hour-of-day demand score for the next 24h            │
│  Peak: 09:00 (score 0.82)                                        │
│                                                                  │
│  ── Patterns ────────────────────────────────────────────────── │
│  • Underused charger: NEXTERACOM-CH-02 (2 sessions this week)    │
│                                                                  │
│  ── Anomalies ───────────────────────────────────────────────── │
│  • Energy spike: 28.4 kWh session (expected 5–15 kWh)           │
│                                                                  │
│  ── Recommendations ────────────────────────────────────────── │
│  • Encourage off-peak booking 11:00–13:00                       │
│    Based on: Peak 09:00 utilization 92%                          │
│                                                                  │
│  ── Grounding ─────────────────────────────────────────────────  │
│  [↓ Show grounding data]  (accordion)                            │
│   Sessions: 7 · kWh: 41.3 · Peak hour: 09:00 · No-show: 14%    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Key sections:**
- Confidence badge: `Low` (red) / `Medium` (amber) / `High` (green).
- Simulated data label: renders `simulatedDataLabel` verbatim in a yellow banner when non-null.
- NL summary card: `nlSummary` text, read-only.
- Demand forecast: horizontal bar chart from `demandForecast[].hourBucket` / `demandScore`. Hidden when `confidence = Low` (replaced by low-confidence disclosure).
- Patterns list: each `patterns[]` item as a chip/line.
- Anomalies list: each `anomalies[]` item with entity ID, observed vs expected.
- Recommendations list: each `recommendations[]` item with `text` and `metric`/`thresholdReason` attribution.
- Grounding accordion: shows the `grounding` object key-value pairs; provides the cross-check link to the reporting dashboard for each metric.
- Accept/Dismiss buttons on each insight card (session-local state only; not persisted).
- 503 `AiUnavailable` error state: "AI insights temporarily unavailable. Showing last available analysis." with a static fallback message.

**Data source:** `GET /ai/insights`.

---

### Screen 21 — System Config (`/admin/config`) (P2)

**Purpose:** Admin views and edits runtime configuration values.

**Layout:** Key-value table. Each row: key name, current value, editable input, last updated timestamp, Save row button. Or: "Edit All" mode with a form per key.

Supported keys (from `GET /config` response): `GRACE_PERIOD_MINUTES`, `EMISSION_FACTOR_KG_PER_KWH`, `PRE_SESSION_REMINDER_MINUTES`, `SESSION_ENDING_REMINDER_MINUTES`, `DAILY_CAP_MINUTES`, `NO_SHOW_THRESHOLD_COUNT`, `NO_SHOW_THRESHOLD_DAYS`, `CSMS_POLLING_INTERVAL_SECONDS`.

**API calls:** `GET /config`, `PUT /config` with `updates[]` array.

---

### Screen 22 — Admin Booking on Behalf (P2)

**Purpose:** Workplace or Admin creates a booking for a specified user.

Extend the Booking Form (Screen 4). When the logged-in role is Workplace or Admin, add the "Book on behalf of" user-search field. Include a Reason textarea. Submit calls `POST /bookings` with `onBehalfOfUserId` and `reasonForOverride` populated.

---

### Screen 23 — Override Booking Modal (P2)

**Purpose:** Admin/Security/Workplace extends a booking beyond the 1-hour cap.

Modal triggered from Booking Detail or Operations. Fields: New End Time (required, must be > current end time), Reason (required). Calls `PUT /bookings/:id/override`.

---

### Screen 24 — 404 / Not Found

**Purpose:** Friendly fallback for undefined routes.

Layout: Centred on page background. Large `BoltIcon` in grey-600. Heading: "Page not found". Body: "The page you are looking for does not exist or you do not have permission to view it." CTA: "Go to Dashboard" button.

---

## Components Required Per Screen

### Shared / Reusable Components

| Component | Used on screens | Notes |
|---|---|---|
| `NavBar` | All authenticated screens | Responsive; collapses to hamburger on mobile |
| `StatusBadge` | 3, 6, 7, 8, 10, 11, 16 | Charger and booking status pill (colour + label) |
| `CsmsSyncBadge` | 5, 6, 7, 11 | CSMS authorization status indicator |
| `ChargerCard` | 3 | Dashboard charger card |
| `BookingCard` | 6 | My bookings list item |
| `NotificationItem` | 9 | Single notification row |
| `KpiTile` | 10 | Hero KPI number + label |
| `SimulatedDataLabel` | 10, 20 | Yellow banner for simulated data disclaimer |
| `LoadingSkeleton` | All data screens | Shimmer placeholder |
| `ErrorBanner` | All data screens | Form-level and page-level error |
| `EmptyState` | 6, 9, 10, 13, 16 | Illustration + heading + CTA |
| `Modal` | 8, 12, 17, 18, 23 | Generic modal container with overlay |
| `BottomSheet` | Mobile modals | Slides up from bottom on mobile |
| `FilterBar` | 3, 11, 13, 16, 19 | Location/status/date filter controls |
| `DateRangePicker` | 10, 16, 19 | Date from / to selector with presets |
| `PaginationControls` | 6, 9, 11, 13, 16, 19 | Page / Load more |
| `Toast` | All action screens | Success/error transient notification |
| `ConfidenceBadge` | 20 | Low/Medium/High indicator |
| `AuditLogTable` | 16 | Read-only table with filters |
| `PayloadViewer` | 19 | JSON payload renderer for email / Teams Adaptive Card |
| `RouteGuard` | All protected routes | RequireAuth, RequireRole, RequirePrivacyAck |
| `Button` | All screens | Primary / Secondary / Destructive / Ghost variants |
| `FormField` | 4, 14, 15, 17, 18 | Input + label + error message wrapper |
| `SelectDropdown` | 3, 4, 11, 13 | Native or custom dropdown |
| `SearchInput` | 11, 13 | Text input with MagnifyingGlassIcon |

### Screen-Specific Components

| Screen | Screen-Specific Components |
|---|---|
| 1 Login | `LoginForm`, `DemoAccountChips` |
| 2 Privacy | `PrivacyNoticeViewer`, `AcknowledgeButton` |
| 3 Dashboard | `ChargerGrid`, `LocationSectionHeader`, `SyncTimestamp` |
| 4 Booking Form | `BookingFormFields`, `DurationHint`, `FairUseCallout`, `OnBehalfOfSelector` |
| 5 Booking Confirmation | `BookingConfirmationCard` |
| 7 Booking Detail | `BookingDetailCard`, `SessionSummaryBlock`, `ActionPanel` |
| 9 Notifications | `NotificationFeed`, `UnreadBadge` |
| 10 Reports | `ReportTabBar`, `BarChart`, `PieChart`, `LocationComparisonPanel` |
| 13 Users | `EligibleUserTable`, `EligibilityStatusToggle` |
| 16 Audit | `AuditLogTable` |
| 20 AI Insights | `InsightCard`, `DemandForecastChart`, `GroundingAccordion` |

---

## Form Fields and Validation Messages

### Login Form (Screen 1)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| Email | email | Yes | RFC-5322 format | "Enter a valid email address." |
| Password | password | Yes | 8–100 characters | "Password must be at least 8 characters." |

On 401 from API: "Invalid email or password." shown below the password field.

### Booking Form (Screen 4)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| Charger | select | Yes | Must be a known charger ID | "Please select a charger." |
| Start time | time | Yes | Must be ≥ now (−1 min tolerance), same calendar day | "Start time must be today and in the future." |
| End time | time | Yes | Must be > start time | "End time must be after start time." |
| Duration hint | computed | — | endTime − startTime | Warning (not block): "Duration exceeds 1 hour. Your booking may be rejected." |
| Vehicle make | text | Yes | Non-empty string | "Vehicle make is required." |
| Vehicle model | text | Yes | Non-empty string | "Vehicle model is required." |
| Book on behalf of | select | Conditional | Required when operator intends to create for another user | "Please select a user to book on behalf of." |
| Reason for override | textarea | Conditional | Required when operator is booking on behalf or overriding the cap | "A reason is required for this override." |

Server-side errors surfaced by `errors[].field` + `errors[].message` from the API:
- `DurationExceeded` → "Maximum booking duration is 1 hour per day."
- `DailyCapExceeded` → "Daily charging limit (1 hour) exceeded. You have used X minutes today; this booking would add Y minutes."
- `OverlappingBooking` → "This charger is already booked for that window. Pick a different slot or charger."
- `AlreadyHasActiveBooking` → "You already have an active booking. Cancel or release it before booking again."
- `ChargerUnavailable` → "This charger is not available for booking."
- `MaintenanceBlockConflict` → "This charger is blocked for maintenance during that window."

### Privacy Acknowledgement (Screen 2)

No form fields. Single button. Server errors:
- `VersionMismatch` → "The privacy notice has been updated. Please reload the page."
- `AlreadyAcknowledged` → Treat as success (already done); navigate forward.

### Cancel Booking Modal (Screen 8)

| Field | Type | Required | Condition | Validation Message |
|---|---|---|---|---|
| Reason | textarea | Conditional | Required when Admin cancels another user's booking | "A reason is required to cancel another user's booking." |

Server errors:
- `InvalidStateTransition` → "This booking can no longer be cancelled. Refresh the page to see its current state."

### Release Booking Modal (Screen 12)

| Field | Type | Required | Condition | Validation Message |
|---|---|---|---|---|
| Reason | textarea | Conditional | Required for operator releasing another user's booking | "A reason is required to release this booking." |

### Charger Status Modal (Screen 17)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| New Status | radio | Yes | One of: Available, Unavailable, Faulted, BlockedForMaintenance | "Please select a status." |
| Reason | textarea | Yes | Non-empty | "A reason is required to change charger status." |

### Eligible EV User Form (Screen 14)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| Email | email | Yes | RFC-5322 | "Enter a valid email address." |
| Display Name | text | Yes | Non-empty | "Display name is required." |
| Role | select | Yes | Valid role enum value | "Please select a role." |
| Workplace Registry EID | text | Yes | Non-empty, unique | "EID is required." / (409 from server) "This EID is already registered." |
| Badge ID | text | Yes | Non-empty, unique | "Badge ID is required." / (409 from server) "This badge ID is already registered." |
| Eligibility Status | select | Yes | Active / Inactive / Suspended | "Please select an eligibility status." |
| Vehicle Make | text | No | — | — |
| Vehicle Model | text | No | — | — |
| Site Context | select | Yes | NexTower / Nexteracom / Both | "Please select a site context." |
| Password | password | Yes (create only) | 8–100 characters | "Password must be at least 8 characters." |

### Maintenance Block Form (Screen 18)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| Charger | select | Yes | Known charger ID | "Please select a charger." |
| Start time | datetime-local | Yes | Must be a valid date-time | "Start time is required." |
| End time | datetime-local | No | If provided, must be > start time | "End time must be after start time." |
| Reason | textarea | Yes | Non-empty | "A reason is required for a maintenance block." |
| Force release existing bookings | checkbox | No | — | — |

Server errors:
- `MaintenanceBlockConflict` (409) without `forceReleaseExistingBookings: true` → "This charger has active bookings in this window. Check 'Force release existing bookings' to override."

### Override Booking Modal (Screen 23)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| New End Time | time | Yes | Must be > current end time | "New end time must be after the current end time." |
| Reason | textarea | Yes | Non-empty | "A reason is required for an override." |

### My Profile — Vehicle (Screen 15)

| Field | Type | Required | Validation Rule | Validation Message |
|---|---|---|---|---|
| Vehicle Make | text | Yes | Non-empty | "Vehicle make is required." |
| Vehicle Model | text | Yes | Non-empty | "Vehicle model is required." |

On non-Admin sending any other field: server returns 403 "Standard users may only update vehicle fields."

---

## Tables, Cards, Filters, Search, and Dashboard Widgets

### Charger Dashboard (Screen 3)

**Card grid layout:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

**Card fields displayed:** Display name, status badge (coloured), connector number, location, active session info when Charging (`energyKwh`, elapsed minutes, user display name if admin).

**Filters:** Location dropdown (All / NEX Tower / NEXTERACOM), Status multi-select (checkboxes for all 6 statuses). Filter applied client-side to cached charger data.

**Sort:** Chargers sorted by location (NEX Tower first), then by `status` (Available first, Faulted last) within location.

**Search:** Not applicable for charger cards (small dataset ≤8 chargers).

**Dashboard widgets:** None on this screen. The charger cards ARE the widgets.

---

### My Bookings (Screen 6)

**Layout:** Card list (no table on mobile; on desktop a table variant may be used).

**Columns (desktop table variant):** Charger, Location, Date, Time window, Duration, State, CSMS Sync, Vehicle, Actions.

**Default sort:** `startTime desc` (most recent first).

**Grouping:** Date section headers (Today / Yesterday / Earlier).

**Filters:** None (StandardUser sees only their own; no further filter needed on small dataset).

**Pagination:** Load with `limit=100`, show "X bookings" count in the heading.

---

### Operational Bookings (Screen 11)

**Layout:** Table on desktop, cards on mobile.

**Columns:** User, Charger, Location, Time window, State badge, CSMS Sync badge, Vehicle, Actions.

**Default sort:** `startTime asc` (chronological for operational use).

**Filters:** Location dropdown, State multi-select, User search text input.

**Pagination:** Default `limit=20`, standard pagination controls.

---

### Eligible EV Users (Screen 13)

**Layout:** Table.

**Columns:** Display Name, EID, Status badge, Vehicle, Site, Privacy, Actions.

**Default sort:** `displayName asc`.

**Search:** Text input on `displayName` or `workplaceRegistryEid`.

**Filters:** `eligibilityStatus` (Active/Inactive/Suspended), `siteContext`.

**Pagination:** Default `limit=20`.

---

### Audit Log (Screen 16)

**Layout:** Table (read-only).

**Columns:** Timestamp, Actor, Role, Action, Entity Type, Entity ID (truncated to 8 chars + "…"), Reason (truncated), Source.

**Default sort:** `timestamp desc`.

**Filters:** Date range picker, Actor search, Action type dropdown, Entity type dropdown.

**Pagination:** Default `limit=20`.

---

### Reporting Dashboard — KPI Tiles (Screen 10 Overview tab)

| Widget | Type | Data field | Format |
|---|---|---|---|
| Total Sessions | KPI tile | `totalSessions` | Integer, no decimal |
| Total Energy | KPI tile | `totalKwh` kWh | 1 decimal place + "kWh" |
| Estimated CO₂ Savings | KPI tile | `estimatedCo2SavingsKg` kg | 1 decimal + "kg CO₂" |
| Emission factor disclosure | sub-label | `emissionFactorUsed` | "(factor: X kg/kWh)" |
| Completed sessions | KPI tile | `completedCount` | Integer |
| Cancelled | KPI tile | `cancelledCount` | Integer |
| No-shows | KPI tile | `noShowCount` | Integer |
| Avg duration | KPI tile | `avgDurationMinutes` min | 1 decimal + "min" |
| Avg kWh/session | KPI tile | `avgKwh` kWh | 2 decimal + "kWh" |

**Charts:**
- **Peak hour distribution:** Horizontal or vertical bar chart. X-axis: hours 0–23. Y-axis: `sessionCount`. Highlight the peak bar.
- **Charger ranking:** Horizontal bar chart. One bar per charger (`chargerRanking[]`). X-axis: `sessionCount`. Labelled with `displayName`.
- **Utilisation table:** Sortable table. Columns: Charger, Utilisation %, Faulted events, Maintenance minutes.
- **Location comparison:** Two side-by-side cards. Each shows `totalSessions`, `totalKwh`, `avgUtilizationPercent` for NEX Tower and NEXTERACOM.
- **Sustainability — vehicle category:** Stacked bar. Groups: `vehicleMake` values from `usageByVehicleCategory[]`. "Other" catch-all for groups < 3 users.

**Chart library:** Use lightweight inline SVG charts (recharts, if already installed) or simple CSS bar charts. Do not install a full charting library just for this; if recharts is not present, use a simple CSS-grid percentage-bar approach.

**Filter behaviour:** Date range and location filter controls at the top of the `/reports` page. Changing a filter replaces all widget data by refetching all report endpoints with the new params. Show a loading overlay on the dashboard widgets while refetching (do not flash empty state).

---

## Loading States

| Surface | Loading treatment | Debounce / timing |
|---|---|---|
| Charger dashboard — initial load | 4–6 skeleton charger cards (shimmer animation, matching card dimensions) | Immediate — no debounce |
| Charger dashboard — poll refresh (5s) | Silent: no spinner. Cards update in place. If the poll takes > 2s, show a subtle `ArrowPathIcon` spin in the sync timestamp area. | No debounce |
| Booking form — submit | Button text changes to "Creating booking…" with a spinner inside the button. Form fields disabled. | Immediate on click |
| Booking form — charger list load | Skeleton option in the charger dropdown ("Loading chargers…") | Immediate |
| My bookings — initial | 3 skeleton booking cards, shimmer | Immediate |
| Notification center | 3 skeleton notification items, shimmer | Immediate |
| Reports dashboard — initial | Skeleton KPI tiles (rect shapes, shimmer), skeleton chart placeholders | Immediate |
| Reports dashboard — filter change | Overlay spinner on the KPI tile area (semi-transparent white/dark overlay + spinner). Charts show skeleton. | 200ms debounce after the last filter change before triggering the fetch |
| Eligible user list | Skeleton table rows | Immediate |
| Audit log | Skeleton table rows | Immediate |
| AI insights | Spinner centered in the insights panel + text "Generating insights…". This can take 3–5s. After 10s show a "Still working…" sub-message. | Immediate |
| Modal actions (cancel/release/override) | Button spinner inside the confirm button. Confirm button disabled during call. | Immediate on click |

---

## Empty States

| Screen / Surface | Illustration concept | Headline | Sub-copy | Primary CTA |
|---|---|---|---|---|
| My Bookings | Stylised charger with an empty connector, grey tones | "No bookings yet" | "Book a charging slot to get started." | "Book a Charger" → `/bookings/new` |
| Notification Center | Bell icon with a small ZZZ, grey tones | "All caught up" | "Booking confirmations, reminders, and alerts will appear here." | None |
| Operational Bookings (filtered, no results) | Calendar with a magnifying glass | "No bookings match your filter" | "Try changing the location or status filter, or check a different date." | "Clear Filters" button |
| Eligible Users (no results from search) | User group icon, greyed out | "No users match your search" | "Try a different name or EID, or remove the status filter." | "Clear Filters" |
| Audit Log (no entries in range) | Clipboard icon | "No audit entries" | "No actions have been recorded in this date range. Try widening the filter." | None |
| Reporting Dashboard (no data in range) | Bar chart icon with a question mark | "No data for this period" | "Adjust the date range or confirm that seeded session data is available." | None |
| AI Insights (low confidence disclosure) | SparklesIcon greyed out | "Not enough data for forecasts" | "Fewer than 10 sessions were recorded in this period. Add more activity or widen the date range to generate AI insights." | None |

All empty state illustrations are composed from Heroicons — no image assets required.

---

## Error States

### Inline Field Errors

- Displayed immediately below the offending input field.
- Red text (`#DC2626`), small ExclamationCircleIcon prefix, 12px.
- Input border changes to red (`border-red-500`).
- Field-level `errors[]` from the API are mapped by `errors[].field` (camelCase) to the matching input.

### Form-Level Error Banner

- Displayed at the top of the form area, above all fields.
- Red background (`#FEF2F2`), red left border (`#DC2626`), ExclamationTriangleIcon.
- Shows the top-level `message` from the API error envelope.
- Used for: 403 `NotEligible`, 403 `PrivacyNotAcknowledged`, 409 `DailyCapExceeded`, 409 `AlreadyHasActiveBooking`, 409 `OverlappingBooking`.
- Dismissable (✕ button).

### Full-Page Error Fallback

- Shown when an entire screen cannot load (e.g., 500 on the initial `GET /chargers` or `GET /privacy-notice`).
- Centred card on the page background. `ExclamationCircleIcon` (large, red). Heading: "Something went wrong". Body: "We couldn't load this page. Please try again." Retry button re-fetches the failed request. Support note: "If the issue persists, include this trace ID: `<traceId>`."

### Toast Notifications (success and error)

- Position: top-right corner on desktop; top-centre on mobile.
- Auto-dismiss: 4 seconds for success, 6 seconds for error (or manual dismiss).
- Success toast: green left border, CheckCircleIcon, white background.
- Error toast: red left border, ExclamationCircleIcon, white background.
- Usage:
  - Success toast: booking cancelled, booking released, vehicle updated, user saved, maintenance block created/removed, config saved.
  - Error toast: generic unexpected errors (500) that are not tied to a specific form.

### Toast vs Banner Policy

| Scenario | Notification type |
|---|---|
| Action succeeds (cancel, release, save) | Success toast |
| Form validation fails (field errors) | Inline field errors + form banner |
| 403 access denied (role guard redirect) | "Not authorized" toast |
| 503 CSMS unavailable (booking creation still returns 201) | Warning banner on confirmation screen |
| 500 unexpected server error on a form action | Error toast |
| 500 on initial page load | Full-page error fallback |
| Poll refresh error (dashboard) | Non-blocking yellow banner above charger grid |

### Error Shape Mapping

All API errors return `{ message, errors[], traceId }`. Frontend maps this as:
- `errors[]` with `field` → inline field errors.
- `errors[]` without `field` → form-level banner.
- `errors[].code` drives programmatic UI decisions:
  - `PrivacyNotAcknowledged` → redirect to `/privacy`.
  - `NotEligible` → banner "Your account is not on the eligible EV user registry."
  - `CsmsUnavailable` → warning "CSMS authorization service is unavailable. Your booking is created but not yet authorized at the charger."
  - `AiUnavailable` → static fallback notice in the AI panel.
  - `AlreadyAcknowledged` → treat as success (privacy already done).
  - `InvalidStateTransition` → "This action is no longer valid. Refresh the page to see the current status."
- `traceId` → logged to browser console; shown in the full-page error fallback.

---

## Success States

### Booking Created

- Form is replaced by the Booking Confirmation inline state (Screen 5) — no full page redirect.
- If `csmsSyncStatus = Authorized`: success heading + green badge.
- If `csmsSyncStatus = AuthorizationFailed`: booking created but warning state.
- Two CTAs: "View My Bookings" and "Back to Dashboard".

### Booking Cancelled

- Modal closes.
- Success toast: "Booking cancelled."
- The booking card in My Bookings or the row in Operations updates to `Cancelled` state (re-fetch the booking list, or update the item in local state).

### Booking Released

- Modal closes.
- Success toast: "Booking released. Charger is now available."
- Booking state updates to `Released`.

### Privacy Acknowledged

- Redirect to the `returnTo` URL (or `/dashboard` if no returnTo).
- No explicit toast (the redirect is confirmation enough). If the user is redirected to the booking form, the fair-use callout is visible.

### User Saved (Admin)

- Redirect back to `/admin/users`.
- Success toast: "Eligible EV user saved."

### Vehicle Updated (Self)

- Stay on `/profile`.
- Success toast: "Vehicle updated."

### Notification Marked Read

- Inline: unread indicator disappears from the notification item.
- Unread count badge in the nav bar decrements.
- No toast (silent UX).

### Charger Status Updated

- Modal closes.
- Success toast: "Charger status updated."
- Dashboard charger card refreshes on the next poll cycle (within 5s) or immediately re-fetches `GET /chargers/:id`.

### Maintenance Block Created / Removed

- Success toast: "Maintenance block created." / "Maintenance block removed."
- Block list in `/admin/maintenance` updates.

### Config Saved

- Inline: each updated config key shows a small "Saved" checkmark for 2s.
- No redirect.

---

## Accessibility Considerations

### WCAG Target

**WCAG 2.1 Level AA** for all user-facing screens.

### Keyboard Navigation

- All interactive elements reachable by Tab.
- Tab order follows visual reading order (top-to-bottom, left-to-right).
- Modal dialogs: focus is trapped inside the modal while open. On close, focus returns to the trigger button.
- Dashboard charger cards: each card is a focusable `<article>` element. The Book button is the primary tab stop inside each card.
- Filter dropdowns: accessible via keyboard using native `<select>` or ARIA-compliant custom dropdowns.
- Notification items: each item is a focusable `<li>` with an implicit button role or `tabindex="0"`.

### Focus Ring Style

All interactive elements show a visible focus ring: `outline: 2px solid #5AB1D8; outline-offset: 2px;`. Never remove outline without providing an equivalent visible indicator.

### Contrast Ratios

- Body text on `brand-800` background: white (`#FFFFFF`) on `#0E2240` = 13.6:1 (exceeds AA).
- Status badge text (white on status colours): verified AA minimum 4.5:1 for all status colours listed above.
- Grey-600 (`#4B5563`) secondary text on white backgrounds: 7.6:1 (exceeds AA).
- Disabled state: `grey-300` text on `grey-100` background: 2.1:1 — acceptable for disabled/non-interactive elements only. Never use disabled contrast for required information.

### ARIA Roles for Custom Widgets

| Widget | ARIA role | Notes |
|---|---|---|
| Status badge / pill | `<span role="status">` | Allows screen reader to announce state |
| Notification bell | `<button aria-label="Notifications, X unread">` | Count in label, not just visual badge |
| Charger card | `<article aria-labelledby="charger-name-id">` | Named by the charger display name |
| Filter dropdown (custom) | `role="listbox"`, `aria-expanded` | Follow WAI-ARIA listbox pattern |
| Chart elements | `role="img" aria-label="..."` on SVG wrappers | Describe the chart data in the label |
| Modal | `role="dialog" aria-modal="true" aria-labelledby="modal-title"` | |
| Accordion (grounding) | `<button aria-expanded="...">` controlling a `<div id="..." hidden>` | |
| Toast notification | `role="alert" aria-live="assertive"` | |
| Loading skeleton | `aria-busy="true"` on the container | |

### Screen Reader Labels for Icon-Only Buttons

All icon-only buttons MUST have a visually hidden label:
```html
<button aria-label="Refresh charger data">
  <ArrowPathIcon aria-hidden="true" />
</button>
```

Common icon-only buttons and their `aria-label` values:
- Bell icon nav button → "Notifications, X unread"
- Refresh icon → "Refresh charger data"
- Close modal ✕ → "Close"
- Delete row → "Delete [user name]"
- Edit row → "Edit [user name]"
- Show password → "Show password" / "Hide password"
- Filter icon → "Open filters"

### Form Labelling Rules

- Every input has an explicit `<label htmlFor="...">` linked via `id` — never use `placeholder` as the only label.
- Required fields are marked with an asterisk `*` in the label AND `aria-required="true"` on the input.
- Error messages are associated with inputs via `aria-describedby="fieldName-error"`.
- Form groups (e.g., radio buttons for charger status) use `<fieldset>` and `<legend>`.

---

## Demo-Friendly Visual Polish

### Hero Numbers

The three P0 KPI tiles on the Reports Overview tab are the most impactful demo element. Seed enough simulated session data to show:
- Total Sessions: `57` (not `3`).
- Total Energy: `412.6 kWh`.
- Estimated CO₂ Savings: `350.7 kg`.

These numbers should be visible on the projector without zooming in.

### Status Colour Coding

The charger dashboard must show at least three different status colours at rest (Available green, Charging violet, Reserved blue) to demonstrate real-time variety. The `CP-NEX-001` and `CP-NEX-002` simulator chargers should be seeded or left running to show Charging status.

### Micro-Animations

Keep animations minimal and fast. Only two animations:
1. **Skeleton shimmer** on loading states: `@keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }`. 1.5s infinite. This is the single most effective "the app is alive" signal during a demo.
2. **Status badge pulse**: The `Charging` status badge has a subtle repeating pulse (`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.7 } }`) to indicate an active live state. 2s infinite. Applied only to `Charging` and `AuthorizationPending` badges.

Do not add page transitions, card flip animations, or scroll-triggered effects — they slow demos down.

### Seeded Data Quality

The backend must seed:
- 2 chargers at NEX Tower (`CP-NEX-001`, `CP-NEX-002`), 2 at NEXTERACOM.
- At least 3 seeded eligible EV users (Alice Standard, Bob Driver, Carol Admin).
- At least 1 booking in Confirmed state, 1 in Completed state (with an energyKwh value), 1 Cancelled.
- At least 7 completed charging sessions with `energyKwh` values for the reporting dashboard to show non-zero metrics.
- At least 5 in-app notifications in various states (read and unread).

The demo presenter should be able to open the app cold and immediately see a populated dashboard with mixed charger statuses, a non-zero notification badge, and non-zero KPI tiles — within 3 seconds of login.

### Happy Path Rehearsal Screen

The demo should be scripted to land on the charger dashboard immediately after login. The dashboard is the most visually compelling screen. Do not demo the login screen for longer than 5 seconds; do not start on an empty state.

### Fallback Static Screenshots Policy

Before the demo, take screenshots of:
1. The charger dashboard with all 4 charger cards showing different statuses.
2. The booking confirmation screen showing `csmsSyncStatus: Authorized`.
3. The reporting dashboard overview tab with the three KPI tiles.
4. The AI insights panel showing `nlSummary` and at least one recommendation.

Store as PNG files in `/frontend/public/fallback/` and be prepared to show them on a secondary screen if the backend is unavailable.

### "Simulated demo data" Label Visibility

The yellow `SimulatedDataLabel` banner on reporting and AI screens should be visible by default in the demo (it is not a negative — it proves the platform is data-aware and responsible). Do not attempt to hide it.

### Projector Font Size

On projector, Chrome's default zoom of 100% may be too small. Set the browser to 110% zoom before the demo. The 36px KPI hero numbers remain clearly legible even at 90% zoom.

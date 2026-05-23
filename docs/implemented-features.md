# Implemented Features — EV Charging Orchestration Platform

## Core Access & Security

### 1. User Authentication & Authorization
JWT-based login/logout with role-based access control across 6 user roles: Admin, StandardUser, Security, Workplace, Management, and ReportingESGViewer.

- **Frontend:** `/login` — LoginPage
- **Backend:** `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`

### 2. Privacy Notice & Acknowledgement
Displays versioned privacy policies and captures user acknowledgement as an immutable audit trail before granting access to booking features.

- **Frontend:** `/privacy` — PrivacyPage
- **Backend:** `GET /api/v1/privacy-notice`, `POST /api/v1/privacy-notice/acknowledge`

---

## Charger Management

### 3. Charger Catalog & Status
Browse all charging stations with real-time availability status: Available, Charging, Unavailable, BlockedForMaintenance, Faulted, Reserved.

- **Frontend:** `/chargers` — ChargersPage with status-based filtering and location grouping
- **Backend:** `GET /api/v1/chargers`, `GET /api/v1/chargers/{id}`, `PUT /api/v1/chargers/{id}/status` *(admin-only)*

### 4. Maintenance Block Management
Admins create maintenance windows on chargers with automatic conflict detection showing overlapping bookings. Supports force-release of conflicting bookings with a mandatory reason. Blocks the CSMS connector and sets charger to BlockedForMaintenance.

- **Frontend:** `/admin/maintenance` — MaintenancePage with charger picker, time range, conflict preview, and force-override confirmation dialog
- **Backend:** `POST /api/v1/maintenance-blocks`, `DELETE /api/v1/maintenance-blocks/{id}`

---

## Booking System

### 5. Booking Creation with Fair-Use Cap
Create hourly charging slot reservations with a 1-hour daily fair-use limit, 14-day advance booking window, date navigation, and time slot picker highlighting peak and best demand hours. Admins can override the cap with a reason.

- **Frontend:** `/bookings/new` — BookingNewPage with multi-date picker, slot selection, vehicle info, and admin override
- **Backend:** `POST /api/v1/bookings` with validation, cap enforcement, and optional admin override

### 6. My Bookings View
Personal booking list with filtering by state, cancel and release actions, and inline reason capture.

- **Frontend:** `/my-bookings` — MyBookingsPage with card-based list, action modals, and empty state
- **Backend:** `GET /api/v1/bookings` *(filtered to current user)*

### 7. Booking Detail & Actions
View full booking details including the linked charging session, CSMS sync status, and time-sensitive actions: cancel (owner), release, and operator release with a 5-character minimum reason.

- **Frontend:** `/bookings/{id}` — BookingDetailPage with session details, countdown, and action buttons
- **Backend:** `GET /api/v1/bookings/{id}`, `PUT /api/v1/bookings/{id}/cancel`, `PUT /api/v1/bookings/{id}/release`, `PUT /api/v1/bookings/{id}/override` *(operator-only)*

### 8. Operations Bookings Dashboard
Operational staff (Admin, Security, Workplace) view all bookings in a table or Gantt chart with 14-day date navigation, filters by state/location/user, and bulk release actions.

- **Frontend:** `/operations/bookings` — OperationsBookingsPage with table/gantt toggle, date nav, and filters
- **Backend:** `GET /api/v1/bookings` with admin-level filters and unrestricted scope

---

## Notifications

### 9. Notification Center (In-App Feed)
User-specific notification feed with unread badge count, read/unread toggling, and filtering by severity and trigger event.

- **Frontend:** `/notifications` — NotificationsPage
- **Backend:** `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PUT /api/v1/notifications/{id}/read`

### 10. Notifications Audit (Admin View)
Admin/Security/Workplace audit trail of all notifications across all channels (InApp, Email, TeamsAdaptiveCard) with filters for audience, delivery status, and correlation ID. Includes a payload preview modal.

- **Frontend:** `/admin/notifications` — NotificationsAuditPage with channel/event/date filters and payload preview
- **Backend:** `GET /api/v1/notifications/audit` with multi-channel filtering

---

## Reporting & Analytics

### 11. Reports Dashboard (Multi-Tab)
Six report tabs — Overview, Sessions, Energy, Utilisation, Sustainability, and AI Insights — with KPI tiles, charts, and date/location filters.

- **Frontend:** `/reports` — ReportsPage with tab navigation and data visualisation
- **Backend:** `GET /api/v1/reports/summary`, `GET /api/v1/reports/sessions`, `GET /api/v1/reports/energy`, `GET /api/v1/reports/utilization`, `GET /api/v1/reports/sustainability`

### 12. AI Insights Panel
Grounded AI analysis showing a natural language summary, demand forecast, detected patterns and anomalies, and actionable recommendations. Results are tagged with confidence levels: Low, Medium, or High, based on session data volume.

- **Frontend:** `/reports/ai` — AiInsightsPage with NL summary, demand forecast, and recommendations sections
- **Backend:** `GET /api/v1/ai/insights`

---

## Administration

### 13. Eligible EV Users Management
Admins manage workplace EV user eligibility records including email, badge ID, workplace registry EID, vehicle info, eligibility status (Active/Suspended/Inactive), site context, and privacy acknowledgement status. Standard users can self-service update their vehicle information.

- **Frontend:** `/admin/users` — UsersPage (list), `/admin/users/new` — UserFormPage (create), `/admin/users/{id}/edit` — UserFormPage (edit)
- **Backend:** `GET /api/v1/eligible-users`, `POST /api/v1/eligible-users`, `GET /api/v1/eligible-users/{id}`, `PUT /api/v1/eligible-users/{id}`, `DELETE /api/v1/eligible-users/{id}` *(soft delete to Inactive)*

### 14. System Configuration Panel
Admin-only management of all system settings: GRACE_PERIOD_MINUTES, NO_SHOW_THRESHOLD, DAILY_CAP_MINUTES, EMISSION_FACTOR, CSMS_POLLING_INTERVAL, and more. All changes are audit logged.

- **Frontend:** `/admin/config` — ConfigPage
- **Backend:** `GET /api/v1/config`, `PUT /api/v1/config`

### 15. Audit Logging with Filters
Immutable audit trail of all system actions (bookings, chargers, maintenance, config changes) with role-scoped visibility: Admins see all, Security/Workplace see operational actions only. Filterable by date range, actor, action type, and entity type. Includes a diff viewer for state changes.

- **Frontend:** `/admin/audit` — AuditPage with filters and diff viewer
- **Backend:** `GET /api/v1/audit-logs` with multi-field filtering and role-based scoping

---

## Background Services & Integration

### 16. Charging Sessions Tracking
Real-time charging session data synced from CSMS with full state tracking: Charging, Completed, StoppedByUser, StoppedByAdmin, NoShow, and Expired. Includes energy delivered and user linkage.

- **Backend:** `GET /api/v1/sessions`, `GET /api/v1/sessions/{id}` *(admin/operational staff only)*

### 17. Background Services
Three hosted workers running continuously:
- **CSMS Sync** — polls the external CSMS every 5 seconds for session and connector state updates
- **No-Show Detection** — compares session start times against booking windows to flag no-shows
- **Reminder Scheduler** — sends pre-session and session-ending notifications at the right times

### 18. Multi-Channel Notification Engine
Dispatches notifications across InApp, Email, and Teams Adaptive Card channels. Triggered by booking lifecycle events: BookingConfirmed, SessionEnding, NoShowAlert, MaintenanceCreated, and more. Supports severity levels and template customisation.

### 19. CSMS Integration
Typed HttpClient communicating with the external CSMS REST API for connector blocking/unblocking, session polling, and authorization status tracking. Includes a mock-mode fallback for demo resilience.

---

## UX & Layout

### 20. Responsive App Shell & Navigation
Full application shell with top bar, sidebar, and mobile bottom navigation. Menu items are role-filtered. Route guards enforce authentication, role, privacy acknowledgement, and eligibility checks before rendering any protected page.

- **Components:** AppShell, Sidebar, TopBar, MobileBottomNav, RequireAuth, RequireRole, RequirePrivacyAck, RequireEligibility

### 21. Overview Dashboard
Landing dashboard with real-time KPIs (available chargers, active sessions, energy delivered today, CO2 avoided), a charger availability grid, a recent activity feed, and an AI insights card.

- **Frontend:** `/dashboard` — OverviewDashboardPage

---

## Summary

| Metric | Count |
|---|---|
| Total Features | 21 |
| Frontend + Backend | 17 |
| Backend Only | 3 |
| Frontend Only | 1 |
| API Endpoints | 50+ |
| Frontend Pages | 19 |
| Backend Controllers | 12 |
| Database Entities | 12 |
| User Roles | 6 |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | ASP.NET Core 8 + C# |
| Database | PostgreSQL 16 + Entity Framework Core 8 |
| Auth | JWT Bearer |
| ORM Provider | Npgsql |

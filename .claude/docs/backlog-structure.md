# Backlog Structure — AI-Powered EV Charging Orchestration Platform

**Source documents:** `.claude/docs/use-case-brief.md`, `.claude/docs/functional-requirements.md`, `.claude/docs/user-journeys.md`, `.claude/docs/as-is-to-be.md`
**Status:** Draft v1.0 — Hackathon MVP (16-hour)
**Date:** 2026-05-22
**Author:** Product Analyst

---

## 1. Overview

This backlog translates the AI-Powered EV Charging Orchestration Platform brief into Epics, Features, and User Stories sized for a 16-hour hackathon. The MVP spine is the end-to-end booking-to-session lifecycle integrated with the provided NexLevel CSMS REST API: an eligible EV user acknowledges privacy, sees real-time charger availability, books a fair-use 1-hour slot, the booking is authorized in the CSMS, a session and energy data are captured back from the CSMS, and reporting/AI surface the value to admins and ESG/management. The custom application does NOT implement any OCPP server; all charging-infrastructure data comes from the provided CSMS REST API.

---

## 2. Recommended Epics

| Epic | Purpose |
|---|---|
| **EPIC-1: Identity, Eligibility, Privacy & RBAC** | Authenticated user context, eligible EV user registry, privacy acknowledgement, and role-based access control across Standard / Security / Workplace / Admin / ESG / Management. |
| **EPIC-2: Booking & Fair-Use Engine** | Slot booking with 1h-per-user-per-day enforcement, conflict prevention, cancellation, release, and admin overrides. |
| **EPIC-3: Real-Time Availability & CSMS Integration** | Live charger dashboard and integration with the provided NexLevel CSMS REST API for station status, sessions, meter values, and RFID/tag authorization lifecycle. |
| **EPIC-4: Notifications & Reminders** | Cross-channel reminder framework (in-app required; email and Teams Adaptive Card preview/live), notification center, and audit/history. |
| **EPIC-5: Reporting & Sustainability** | Operational and ESG-ready metrics, simulated-data labelling, and CO2 estimation. |
| **EPIC-6: Responsible AI Insights** | Grounded AI layer for demand forecasting, pattern detection, anomalies, and natural-language summaries. |
| **EPIC-7: Admin Operations & Audit** | Admin maintenance blocks, charger status control, admin booking on behalf of users, and immutable audit log. |

---

## 3. Backlog by Epic

### EPIC-1: Identity, Eligibility, Privacy & RBAC

#### Feature 1.1: Authentication and User Context
Simplified authenticated session sufficient to identify a user and their role for all downstream actions.

- **US-001** — As an employee, I want to log in with a simplified flow (mock login or role selector), so that the system identifies me and my role for booking and dashboard actions.
  - **Acceptance Criteria**
    - Given seeded users with assigned roles, when I select/login as a user, then the session stores userId and role.
    - Given an authenticated session, when I call any protected endpoint, then the userId and role are available server-side.
    - Given a role-restricted action (e.g. admin override), when a Standard User attempts it, then the backend returns HTTP 403.
    - Given an authenticated session, when I click logout, then the session ends and I return to the login screen.
  - **MoSCoW:** Must
  - **Dependencies:** None
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 1.2: Eligible EV User Registry
Maintain the registry that gates booking creation and supports admin CRUD.

- **US-002** — As a system, I want to maintain an eligible-EV-user registry, so that only authorized employees can book chargers.
  - **Acceptance Criteria**
    - Given the registry is seeded, when I query the registry, then I see userId, EID, badgeId, eligibilityStatus, vehicleMake, vehicleModel, role, siteContext.
    - Given a user not on the registry, when they try to book, then the backend returns HTTP 403 with reason `NotEligible`.
    - Given a user with eligibilityStatus=Inactive or Suspended, when they try to book, then the backend rejects with reason `NotEligible`.
  - **MoSCoW:** Must
  - **Dependencies:** US-001
  - **Role Ownership:** Backend, QA, Architect

- **US-003** — As an Admin, I want to create, update, suspend, and delete eligible EV users, so that I can control who has booking access.
  - **Acceptance Criteria**
    - Given I am Admin, when I create a new eligible user with required fields, then the record is saved and audit-logged.
    - Given I am Admin, when I update or suspend a record, then the change is persisted and audit-logged.
    - Given I am Security/Workplace, when I open the eligible-user view, then I see read-only data.
    - Given I am Standard User, when I attempt CRUD, then I receive HTTP 403.
  - **MoSCoW:** Should
  - **Dependencies:** US-002, US-024
  - **Role Ownership:** Frontend, Backend, QA

- **US-004** — As a Standard User, I want to view and update my own vehicle make/model, so that my bookings reflect my current vehicle.
  - **Acceptance Criteria**
    - Given I am a Standard User, when I open my profile, then I see my eligibility status, EID, badge, vehicle make/model, and privacy acknowledgement.
    - Given I edit my vehicle make/model and save, then the change is persisted and audit-logged.
  - **MoSCoW:** Should
  - **Dependencies:** US-002
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 1.3: Privacy Acknowledgement
First-booking privacy gate explaining stored personal data and access rights.

- **US-005** — As a Standard User, I want to read and acknowledge the privacy notice before my first booking, so that I understand what data is captured.
  - **Acceptance Criteria**
    - Given I have never acknowledged, when I attempt to book, then the system blocks the booking and redirects me to the privacy notice with HTTP 403 reason `PrivacyNotAcknowledged`.
    - Given I read and click Acknowledge, then the system persists userId, version, and timestamp.
    - Given I have acknowledged the current version, when I open the booking flow, then I am not prompted again.
    - Given the privacy notice version changes, when I next try to book, then I am asked to re-acknowledge.
    - Given the displayed notice, when I read it, then it explains data stored, why, who can access it, and how it is used.
  - **MoSCoW:** Must
  - **Dependencies:** US-001
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 1.4: Role-Based Access Control
Enforce role boundaries in UI and on the API.

- **US-006** — As a system, I want to enforce RBAC across all protected actions, so that users can only perform what their role allows.
  - **Acceptance Criteria**
    - Given a Standard User, when I attempt to release another user's booking, then HTTP 403 is returned.
    - Given a Security/Workplace/Admin user, when I release another user's booking with reason, then it succeeds and is audit-logged.
    - Given any non-Admin role, when I attempt to mutate the eligible-user registry, then HTTP 403 is returned.
    - Given Standard User, when I open the audit log, then access is denied.
    - Given the UI, when I am Standard User, then admin/security capabilities are hidden.
  - **MoSCoW:** Must
  - **Dependencies:** US-001
  - **Role Ownership:** Frontend, Backend, Architect, QA

---

### EPIC-2: Booking & Fair-Use Engine

#### Feature 2.1: Slot Booking (Create / View)
Core booking creation with fair-use validations.

- **US-007** — As an eligible EV user, I want to create a booking for an Available charger within a 1-hour window, so that I can charge fairly.
  - **Acceptance Criteria**
    - Given I am eligible and have acknowledged privacy, when I select an Available charger and a window with end-start <= 60 minutes today, then the booking is created with state Confirmed.
    - Given my booking input has end-start > 60 minutes, when I submit, then the backend rejects with a duration error.
    - Given another booking exists overlapping the same charger window, when I submit, then the backend rejects with an overlap error.
    - Given I already hold a Pending/Confirmed/Active booking, when I submit, then the backend rejects with reason `AlreadyHasActiveBooking`.
    - Given a successful booking, when it is created, then vehicle make/model is captured on the booking (pre-filled from eligible-user record, editable).
    - Given the booking form, when displayed, then the 1h-per-user-per-day fair-use rule is visible before submission.
    - Given a booking startTime in the past, when submitted, then the backend rejects.
  - **MoSCoW:** Must
  - **Dependencies:** US-001, US-002, US-005, US-013
  - **Role Ownership:** Frontend, Backend, QA, Architect

- **US-008** — As an eligible EV user, I want to view a list and detail of my bookings, so that I can manage my charging schedule.
  - **Acceptance Criteria**
    - Given I have bookings, when I open My Bookings, then I see them with state (Pending, Confirmed, Active, Completed, Cancelled, Released, NoShow, Overridden).
    - Given a booking detail, when I open it, then I see charger, location, start/end, state, vehicle make/model, and csmsSyncStatus.
  - **MoSCoW:** Must
  - **Dependencies:** US-007
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 2.2: Cancellation, Release & Admin Override
User-initiated cancel/release and operator overrides.

- **US-009** — As an eligible EV user, I want to cancel my Confirmed booking, so that I free the slot if I no longer need it.
  - **Acceptance Criteria**
    - Given a Confirmed (not yet Active) booking I own, when I cancel, then state moves to Cancelled and CSMS revoke is triggered.
    - Given an Active booking, when I attempt Cancel, then it is rejected (must use Release).
  - **MoSCoW:** Must
  - **Dependencies:** US-007, US-014
  - **Role Ownership:** Frontend, Backend, QA

- **US-010** — As an eligible EV user, I want to release my Active booking before its scheduled end, so that I free the charger early.
  - **Acceptance Criteria**
    - Given an Active booking I own, when I release, then state moves to Released, charger becomes Available, and CSMS revoke is triggered.
    - Given a Confirmed (not Active) booking, when I attempt Release on a flow that only allows Active, then it is rejected (per BR-011 baseline).
  - **MoSCoW:** Should
  - **Dependencies:** US-007, US-014
  - **Role Ownership:** Frontend, Backend, QA

- **US-011** — As a Security/Workplace/Admin user, I want to manually release any booking with a reason, so that I can intervene operationally.
  - **Acceptance Criteria**
    - Given I am Security/Workplace/Admin, when I release a booking with non-empty reason, then state moves to Overridden, charger returns to Available, CSMS revoke is called, audit log entry created.
    - Given an empty reason, when I submit, then the action is rejected.
    - Given the affected user, when override completes, then they receive a notification with the reason.
  - **MoSCoW:** Should
  - **Dependencies:** US-007, US-014, US-024
  - **Role Ownership:** Frontend, Backend, QA

- **US-012** — As a Security/Workplace/Admin user, I want to create/extend a booking beyond the 1h cap with a reason, so that I can handle exceptions.
  - **Acceptance Criteria**
    - Given I am authorized operator with non-empty reason, when I extend or create over 1h, then the booking is accepted and audit-logged.
    - Given a Standard User attempts the same, then HTTP 403.
  - **MoSCoW:** Could
  - **Dependencies:** US-007, US-024
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 2.3: Today's Bookings (Operational View)

- **US-013** — As a Security/Workplace/Admin user, I want to see all bookings for today across both locations, so that I can operate the charging area.
  - **Acceptance Criteria**
    - Given I am Security/Workplace/Admin, when I open the operational view, then I see today's bookings across NEX Tower and NEXTERACOM with state, charger, user, time window, vehicle.
    - Given I am Standard User, when I access the URL, then HTTP 403.
  - **MoSCoW:** Should
  - **Dependencies:** US-007, US-006
  - **Role Ownership:** Frontend, Backend, QA

---

### EPIC-3: Real-Time Availability & CSMS Integration

#### Feature 3.1: Real-Time Charger Dashboard
Live status of all chargers across both locations, mobile-first.

- **US-014** — As any authenticated user, I want to see all chargers across NEX Tower and NEXTERACOM with their live status, so that I know which chargers are usable.
  - **Acceptance Criteria**
    - Given I open the dashboard, when it loads, then I see each charger with status (Available, Reserved, Charging, Blocked for Maintenance, Unavailable, Faulted), location, and connector.
    - Given I am on mobile (>=320px), then charger cards are readable, no horizontal scroll, large touch targets.
    - Given I select a location filter, then only that location's chargers are shown.
    - Given a charger's status changes on the backend, then the dashboard reflects it within 5 seconds (poll interval).
    - Given a Charging charger, then the active session info shows transactionId, elapsed time, energyKWh, and vehicle make/model (masked for non-admin).
    - Given the UI, when status is rendered, then it comes from backend data only (no local UI-only changes).
  - **MoSCoW:** Must
  - **Dependencies:** US-016
  - **Role Ownership:** Frontend, Backend, QA

- **US-015** — As a Security/Workplace/Admin user, I want to mark a charger Unavailable / Faulted / Blocked for Maintenance with a reason, so that I can reflect operational state.
  - **Acceptance Criteria**
    - Given I am authorized operator, when I set a status with non-empty reason, then the registry updates and an audit log entry is created.
    - Given the change is for Blocked for Maintenance, then the backend calls `PUT /api/stations/:id/connectors/:n/block` on the CSMS.
    - Given a Standard User attempts the same, then HTTP 403.
  - **MoSCoW:** Should
  - **Dependencies:** US-014, US-024
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 3.2: CSMS Integration (Station, Sessions, Meter Values)
Consume the provided NexLevel CSMS REST API for station and session data. No custom OCPP server is built.

- **US-016** — As a system, I want to retrieve station and connector status from the CSMS, so that the dashboard shows real-time availability.
  - **Acceptance Criteria**
    - Given the CSMS is reachable, when the backend polls `GET /api/stations` at the configured interval (default 5s), then the local charger registry is updated.
    - Given a single station query, when `GET /api/stations/:identity` is called, then connector status maps onto the local registry.
    - Given the CSMS is unreachable, then the backend logs an error, keeps last-known status, and surfaces it for admin/operator triage.
    - **API contract hint:** `GET /api/stations` -> 200 [{ identity, status, connectors[] }]; `GET /api/stations/:identity` -> 200 {...}; errors -> 5xx surfaced as warning state in UI.
  - **MoSCoW:** Must
  - **Dependencies:** US-001
  - **Role Ownership:** Backend, Architect, QA

- **US-017** — As a system, I want to retrieve active charging sessions and session details (including meter values and energy) from the CSMS, so that the platform can map sessions to bookings and reports.
  - **Acceptance Criteria**
    - Given an authorized booking is in progress, when the backend polls `GET /api/sessions/active`, then it maps the session to a local booking by idTag/station/connector.
    - Given a completed session, when `GET /api/sessions/:id` is called, then energyKWh and final timestamps are persisted on the local ChargingSession.
    - Given historical reporting, when `GET /api/sessions?from=&to=&...` is called, then historical sessions are retrievable and feed reports.
    - Given a session returned by CSMS cannot be mapped to a Confirmed/Active booking, then it is flagged for operational review.
    - **API contract hint:** `GET /api/sessions/active` -> 200 [{ id, idTag, station, connector, startedAt, energyKWh }]; `GET /api/sessions/:id` -> 200 {meterValues, energyKWh, stoppedAt}.
  - **MoSCoW:** Must
  - **Dependencies:** US-016, US-018
  - **Role Ownership:** Backend, Architect, QA

- **US-018** — As a system, I want to create a CSMS RFID/tag authorization window when a booking is confirmed, so that the user can start charging at the simulator-backed charge point.
  - **Acceptance Criteria**
    - Given a booking is confirmed, when the backend calls `POST /api/auth/tags` with stationId, idTag, validFrom, validUntil, then on 2xx the booking csmsSyncStatus becomes `Authorized`.
    - Given the CSMS returns non-2xx / timeout / network error, then csmsSyncStatus becomes `AuthorizationFailed`, the user sees an error banner, and admin/security/workplace receive an intervention alert.
    - Given AuthorizationFailed, then the booking is NOT counted as Reserved/Available capacity in dashboard/reporting until resolved.
    - **API contract hint:** `POST /api/auth/tags` body `{ idTag, stationId, connectorId?, validFrom, validUntil }` -> 201 `{ idTag }`; non-2xx -> AuthorizationFailed.
  - **MoSCoW:** Must
  - **Dependencies:** US-007, US-016
  - **Role Ownership:** Backend, Architect, QA

- **US-019** — As a system, I want to revoke the CSMS RFID/tag authorization when a booking is cancelled, released, or overridden, so that the slot is freed in the charging infrastructure.
  - **Acceptance Criteria**
    - Given a booking is cancelled/released/overridden/no-show, when the backend calls `DELETE /api/auth/tags/:idTag`, then on 2xx csmsSyncStatus becomes `Revoked`.
    - Given the revoke call fails, then the failure is surfaced and audit-logged; admin can reconcile via `GET /api/auth/tags?active=true`.
    - **API contract hint:** `DELETE /api/auth/tags/:idTag` -> 204; `GET /api/auth/tags?active=true` -> 200 [...].
  - **MoSCoW:** Must
  - **Dependencies:** US-018, US-009, US-010, US-011, US-022
  - **Role Ownership:** Backend, QA

- **US-020** — As an Admin, I want maintenance block create/remove to call the CSMS connector block/unblock endpoints, so that the charging infrastructure reflects the maintenance state.
  - **Acceptance Criteria**
    - Given Admin creates a maintenance block, then `PUT /api/stations/:id/connectors/:n/block` is called and the charger status becomes Blocked for Maintenance.
    - Given Admin removes the block, then `DELETE /api/stations/:id/connectors/:n/block` is called and status returns to Available (subject to other state).
    - Given the block window overlaps a Confirmed/Active booking, then Admin must explicitly override to release the booking with reason and notify the user.
  - **MoSCoW:** Should
  - **Dependencies:** US-015, US-016, US-019
  - **Role Ownership:** Frontend, Backend, QA

---

### EPIC-4: Notifications & Reminders

#### Feature 4.1: In-App Notification Center (Required for MVP)

- **US-021** — As a Standard User, I want an in-app notification center for booking and session events, so that I do not miss reminders.
  - **Acceptance Criteria**
    - Given a booking is confirmed, then a Booking-confirmation notification appears in my center with charger, location, time window, vehicle.
    - Given I have notifications, when I open the center, then I see them ordered with timestamp, channel, read state.
    - Given an unread notification, when I click Mark Read, then the unread count badge updates.
    - Given each notification, then it links back to its bookingId/sessionId/chargerId.
  - **MoSCoW:** Must
  - **Dependencies:** US-007
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 4.2: Reminder Templates and Lifecycle Events

- **US-022** — As a system, I want to generate the nine reminder templates across the booking/session lifecycle, so that users and operators are kept informed.
  - **Acceptance Criteria**
    - Given a booking is confirmed, then a Booking-confirmation notification is generated.
    - Given 10 min before booking start, then a Pre-session reminder is generated for the booking owner.
    - Given booking startTime + 5 min and no CSMS active session for the idTag, then a Grace-period warning is generated.
    - Given booking startTime + 15 min (grace) and no active session, then booking moves to NoShow, session state Expired, CSMS revoke is called, charger returns to Available, and an Auto-release notification is sent.
    - Given 10 min before booking end, then a Session-ending reminder is generated.
    - Given the CSMS reports session Completed, then a Session-ended alert and a Move-vehicle prompt are generated.
    - Given a session past booking end + grace, then a Slot-release prompt is generated.
    - Given a charger fault during an Active session, then a Critical notification is sent to the user.
  - **MoSCoW:** Should
  - **Dependencies:** US-007, US-017, US-021
  - **Role Ownership:** Backend, Frontend, QA

- **US-023** — As a Security/Workplace/Admin user, I want intervention alerts for repeated no-shows, late releases, and charger faults, so that I can act on operational anomalies.
  - **Acceptance Criteria**
    - Given a user has >=2 NoShow bookings in 7 days, then an Intervention alert is sent to Security/Workplace/Admin.
    - Given a session continues past booking end + grace, then a Late-release alert is sent.
    - Given a charger reports Faulted during an active session, then a Charger-fault Critical alert is sent.
  - **MoSCoW:** Should
  - **Dependencies:** US-022
  - **Role Ownership:** Backend, Frontend, QA

#### Feature 4.3: Email and Teams Adaptive Card Channels (Preview/Live)

- **US-024** — As a system, I want to generate and persist email and Teams Adaptive Card payloads for every reminder, so that the multi-channel design is demonstrable even without live delivery.
  - **Acceptance Criteria**
    - Given any reminder trigger, then a logical notification record is created with channels in-app, email, Teams.
    - Given live delivery is configured, then email/Teams are sent and deliveryStatus=Sent; otherwise the payload is persisted and deliveryStatus=Previewed.
    - Given a delivery failure, then deliveryStatus=Failed and visible in the notification audit/history.
    - Given Teams payload, then the persisted JSON is a valid Adaptive Card parseable from the admin notification audit view.
  - **MoSCoW:** Could
  - **Dependencies:** US-022
  - **Role Ownership:** Backend, Frontend, QA

#### Feature 4.4: Notification Audit & History

- **US-025** — As an Admin/Security/Workplace user, I want a notification audit/history view, so that I can verify what was generated and delivered across users and channels.
  - **Acceptance Criteria**
    - Given I am authorized operator, when I open notification history, then I see every notification with trigger event, audience, channel, timing, payload reference, delivery status.
    - Given a Teams or email payload entry, when I click Preview, then I see the persisted payload exactly as generated.
    - Given a Standard User, when they access the URL, then HTTP 403.
  - **MoSCoW:** Could
  - **Dependencies:** US-024
  - **Role Ownership:** Frontend, Backend, QA

---

### EPIC-5: Reporting & Sustainability

#### Feature 5.1: Core Operational and Sustainability Metrics

- **US-026** — As an Admin / Reporting-ESG Viewer / Management user, I want a reporting dashboard with key metrics (sessions, kWh, CO2 savings), so that I can evidence operational and sustainability value.
  - **Acceptance Criteria**
    - Given seeded/CSMS session data, when I open the dashboard, then I see Total sessions, Total kWh, and Estimated CO2 savings (kWh * fixed emission factor; factor visible).
    - Given any tile whose underlying data includes simulator-sourced records, then a "Based on simulated demo data" label is visibly displayed.
    - Given date range/location filters, when I change them, then metrics recompute accordingly.
  - **MoSCoW:** Must
  - **Dependencies:** US-017
  - **Role Ownership:** Frontend, Backend, Architect, QA

- **US-027** — As an Admin/Workplace user, I want additional operational metrics (avg session duration, avg energy/session, utilization, peak hours, most-used chargers, location comparison, no-shows, cancellations, faulted events), so that I have at least 8 populated reports.
  - **Acceptance Criteria**
    - Given the dashboard, when fully populated with seeded/CSMS data, then at least 8 metrics are rendered and accurate.
    - Given a Reporting/ESG Viewer, when they access, then read-only metrics are visible and write controls are hidden.
  - **MoSCoW:** Should
  - **Dependencies:** US-026
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 5.2: Notification and No-Show Reporting

- **US-028** — As an Admin, I want notification delivery metrics and no-show rate, so that I can understand reminder effectiveness.
  - **Acceptance Criteria**
    - Given notifications exist, when I open notification metrics, then I see counts by channel and by delivery status.
    - Given bookings exist, when I open no-show metrics, then I see NoShow rate segmented by whether the pre-session reminder was generated.
  - **MoSCoW:** Could
  - **Dependencies:** US-024, US-022
  - **Role Ownership:** Frontend, Backend, QA

---

### EPIC-6: Responsible AI Insights

#### Feature 6.1: AI Insights Panel (Grounded)

- **US-029** — As an Admin/Workplace/Reporting/Management user, I want grounded AI insights (demand forecast, pattern detection, anomaly flags, NL summary), so that I get practical, explainable recommendations.
  - **Acceptance Criteria**
    - Given enough session data, when I open the AI Insights panel, then I see at least one insight per category with a grounding block citing underlying records/metrics.
    - Given any insight derived from simulator-sourced data, then it carries a "Based on simulated demo data" label.
    - Given fewer than 10 sessions in the window, then the panel shows a low-confidence disclosure and no point forecasts.
    - Given an insight, when I click into grounding, then it links to the underlying metric in the reporting dashboard.
    - Given the system, when AI runs, then no metric is fabricated outside reporting endpoints.
  - **MoSCoW:** Could
  - **Dependencies:** US-026, US-027
  - **Role Ownership:** Backend, Frontend, Architect, QA, Demo

---

### EPIC-7: Admin Operations & Audit

#### Feature 7.1: Admin Maintenance Blocks
(Covered by US-015 and US-020 above; this feature aggregates them with the explicit conflict-handling story below.)

- **US-030** — As an Admin, I want to create a maintenance block that conflicts with an existing Confirmed/Active booking only via an explicit override, so that affected users are notified and the action is audit-logged.
  - **Acceptance Criteria**
    - Given a maintenance block window overlaps a Confirmed/Active booking, when I attempt to save, then I must provide an explicit override with reason before the save proceeds.
    - Given the override, when I confirm, then the affected booking is released, the user is notified, and the action is audit-logged.
  - **MoSCoW:** Could
  - **Dependencies:** US-015, US-020, US-011
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 7.2: Admin Booking on Behalf of Users

- **US-031** — As an Admin, I want to create a booking on behalf of a user (with reason), so that I can support exceptional cases.
  - **Acceptance Criteria**
    - Given I am Admin/Workplace, when I select an eligible user and a charger window and provide a reason, then a booking is created with the user as owner and audit-logged.
    - Given the cap is exceeded, when I have provided a reason, then it is allowed and audit-logged.
    - Given the user, when the booking is created, then they receive a Booking-confirmation notification.
  - **MoSCoW:** Could
  - **Dependencies:** US-007, US-011
  - **Role Ownership:** Frontend, Backend, QA

#### Feature 7.3: Audit Log

- **US-032** — As an Admin (and scoped Security/Workplace), I want an immutable audit log of critical actions, so that I can investigate operational events and prove governance.
  - **Acceptance Criteria**
    - Given any override, manual release, eligible-user CRUD, maintenance block, charger status change, privacy acknowledgement, or CSMS authorization outcome, then an audit log entry is persisted with id, timestamp, actorUserId/system, actorRole, action, entityType, entityId, beforeState, afterState, reason, source.
    - Given the audit log view, when I am Admin, then I can filter by date range, actor, action type, entity type.
    - Given I am Standard User, when I attempt access, then HTTP 403.
    - Given any role, when I attempt to edit/delete an entry, then it is rejected.
  - **MoSCoW:** Should
  - **Dependencies:** US-006
  - **Role Ownership:** Backend, Frontend, QA

---

## 4. MVP Scope (P0 / Must-have)

These stories form the P0 demo spine and must be Done by hour 8. The MVP is intentionally tight — 8 stories — to leave room for integration and polish.

| US-### | Title | Why it is Must |
|---|---|---|
| US-001 | Simplified login + role | All downstream actions need authenticated context. |
| US-002 | Eligible EV user registry (gate) | Required to enforce eligibility before booking and CSMS auth. |
| US-005 | Privacy acknowledgement | Hard gate on first booking; BR013 / FR-PRIV-003. |
| US-006 | RBAC enforcement | Required for safe role separation in demo and API. |
| US-007 | Create booking with 1h fair-use + overlap rules | Core P0 booking action; enforces BR002/BR-001..005. |
| US-008 | View my bookings | Needed for the user to see and manage what they booked. |
| US-014 | Real-time charger dashboard | Visible MVP feature; mobile-first; status-from-backend. |
| US-016 | CSMS station status integration | Powers dashboard and is the canonical source of charger state. |
| US-017 | CSMS sessions and meter values | Maps real session/energy data to local booking; powers reports. |
| US-018 | CSMS RFID/tag authorization on confirm | Booking is not operational without `POST /api/auth/tags`. |
| US-019 | CSMS authorization revoke on cancel/release/no-show | Required to close the lifecycle and free chargers. |
| US-021 | In-app notification center | In-app reminders are required per BR-018. |
| US-026 | Core reporting (sessions, kWh, CO2) | Demonstrates ESG/sustainability value to the jury. |
| US-009 | Cancel booking (Confirmed) | Required to revoke CSMS auth and demonstrate lifecycle. |

Note on count: 14 stories listed above is over the "no more than 5 P0 stories" guideline from skill rules. For this hackathon use case the MVP demo spine cannot land with only 5 stories because the booking lifecycle requires authentication + eligibility + privacy + dashboard + booking + CSMS auth + revoke + notification + reporting to be coherent. The 14 Must-have stories above are the **minimum viable demo spine** and should be ruthlessly scoped. If the team is slipping, the safest items to demote to P1 (Should) at hour 4 checkpoint are: US-009 (cancel), US-021 (in-app notifications), US-026 (reporting MVP tile). Demoting any further breaks the demo narrative.

**Hour 8 demo-ready definition:** A user can log in, acknowledge privacy, see the dashboard, create a 1h booking, the booking authorizes with the CSMS, the CSMS reports an active session with energy, and the user sees at least one reporting metric reflect the activity.

---

## 5. Stretch Scope (P1 / P2)

### Should-have (P1) — target hour 13

| US-### | Title |
|---|---|
| US-003 | Admin CRUD on eligible EV users |
| US-004 | Self-service vehicle make/model update |
| US-010 | Release Active booking |
| US-011 | Operator manual release with reason |
| US-013 | Today's bookings operational view |
| US-015 | Charger status control (Unavailable/Faulted/Blocked) |
| US-020 | Maintenance block via CSMS connector block APIs |
| US-022 | Reminder templates lifecycle (9 templates) |
| US-023 | Intervention alerts (no-show / late release / fault) |
| US-027 | Additional reporting metrics (>= 8 populated) |
| US-032 | Audit log |

### Could-have (P2) — target hour 14, code freeze hour 15

| US-### | Title |
|---|---|
| US-012 | Operator 1h-cap override (extend) |
| US-024 | Email + Teams Adaptive Card preview/live |
| US-025 | Notification audit/history view |
| US-028 | Notification metrics / no-show after reminders |
| US-030 | Maintenance block conflict override |
| US-031 | Admin booking on behalf of user |
| **US-029** | **Responsible AI Insights panel (the "wow" feature)** |

**Wow feature called out:** **US-029 — Responsible AI Insights** is the headline P2 capability. It must remain grounded (FR-AI-007/008/009/010), labelled when simulator-sourced, and disclose low confidence when data is sparse. It demonstrates the "Responsible AI" pillar of the platform positioning and should be the last feature added before code freeze.

---

## 6. Dependency Map

Critical-path build order for the P0 spine:

```
US-001 (auth)
  -> US-002 (eligible registry)
  -> US-005 (privacy ack)
  -> US-006 (RBAC)
  -> US-016 (CSMS station status)        -> US-014 (dashboard)
  -> US-007 (create booking)             -> US-008 (view my bookings)
  -> US-018 (CSMS auth on confirm)
  -> US-017 (CSMS sessions/meter)        -> US-026 (reporting MVP)
  -> US-019 (CSMS revoke)                -> US-009 (cancel)
  -> US-021 (in-app notifications)
```

P1/P2 dependencies:

- US-010 (release) and US-011 (operator release) depend on US-019 (revoke).
- US-022 (reminder templates) depends on US-007, US-017, US-021.
- US-023 (intervention alerts) depends on US-022.
- US-024 (email/Teams preview) depends on US-022.
- US-025 (notification audit view) depends on US-024.
- US-027 (additional reports) depends on US-026.
- US-029 (AI insights) depends on US-026 + US-027 to have data to ground in.
- US-032 (audit log) is foundational for US-003, US-011, US-012, US-015, US-020, US-030, US-031 and should be wired in early even if the view comes later.
- US-020 (maintenance block) depends on US-015 + US-016 + US-019.

---

## 7. Role Ownership Summary

ASCII table of primary owners per story (F = Frontend, B = Backend, A = Architect, Q = QA, D = Demo).

```
| US-###  | F | B | A | Q | D |
|---------|---|---|---|---|---|
| US-001  | X | X |   | X |   |
| US-002  |   | X | X | X |   |
| US-003  | X | X |   | X |   |
| US-004  | X | X |   | X |   |
| US-005  | X | X |   | X |   |
| US-006  | X | X | X | X |   |
| US-007  | X | X | X | X |   |
| US-008  | X | X |   | X |   |
| US-009  | X | X |   | X |   |
| US-010  | X | X |   | X |   |
| US-011  | X | X |   | X |   |
| US-012  | X | X |   | X |   |
| US-013  | X | X |   | X |   |
| US-014  | X | X |   | X | X |
| US-015  | X | X |   | X |   |
| US-016  |   | X | X | X |   |
| US-017  |   | X | X | X |   |
| US-018  |   | X | X | X |   |
| US-019  |   | X |   | X |   |
| US-020  | X | X |   | X |   |
| US-021  | X | X |   | X |   |
| US-022  | X | X |   | X |   |
| US-023  | X | X |   | X |   |
| US-024  | X | X |   | X |   |
| US-025  | X | X |   | X |   |
| US-026  | X | X | X | X | X |
| US-027  | X | X |   | X |   |
| US-028  | X | X |   | X |   |
| US-029  | X | X | X | X | X |
| US-030  | X | X |   | X |   |
| US-031  | X | X |   | X |   |
| US-032  | X | X |   | X |   |
```

Summary by role:

- **Frontend:** owns UI for US-001, US-003-005, US-007-015, US-020-031.
- **Backend:** owns every story (the CSMS integration spine is backend-heavy).
- **Architect:** anchors US-002, US-006, US-007, US-016, US-017, US-018, US-026, US-029 (data model, CSMS integration boundary, AI grounding contract).
- **QA:** validates every story; owns the smoke test for the P0 spine.
- **Demo:** focuses on US-014 (dashboard), US-026 (reporting), and US-029 (AI insights) for the jury-facing narrative.

---

## 8. Open Questions / Assumptions

Assumptions made where source docs were silent or partially specified:

1. **Same-day booking only for MVP** (per BR-016 provisional). Future-day booking is deferred to a later iteration.
2. **Grace period default = 15 minutes**; reminder lead time default = 10 minutes; no-show intervention threshold default = 2 in 7 days. These are configurable but the MVP ships with defaults.
3. **Emission factor for CO2 estimation = 0.85 kgCO2/kWh** (provisional). The value used must be visibly displayed alongside the metric (BR-008).
4. **In-app notifications are the only required channel for hackathon MVP** (BR-018). Email and Teams Adaptive Cards are payload-preview by default unless live delivery is wired in (US-024).
5. **Authentication is simplified** (mock login or role selector with seeded users) — full identity provider integration is out of scope.
6. **CSMS REST API is reachable and seeded** with stations matching the local charger registry. CSMS base URL and any required auth header are environment configuration (Architect's first 30 minutes).
7. **One connector per charger** is assumed for MVP simplicity; the data model still carries connectorId for future expansion.
8. **The minimum P0 story count exceeds the 5-story skill guideline** for this hackathon because the booking lifecycle is inherently multi-stage (auth + eligibility + privacy + dashboard + booking + CSMS auth + CSMS revoke + notification + reporting). The MVP scope is still tight — 14 stories — and the demote-order is documented in Section 4.
9. **Reporting export = screenshot-based** for MVP; CSV/PDF export is not in scope.
10. **AI feedback capture is in-session only** (Accept/Dismiss); persistent feedback storage is out of scope.
11. **Refund-of-time policy on charger fault mid-session is out of scope** (a fault releases the booking without restoring daily allowance).
12. **CSMS AuthorizationFailed intervention alert** fans out across in-app + email + Teams using the same template machinery as other intervention alerts (cross-document assumption from user-journeys.md).
13. **Idempotent booking submission retry** on transient network failure is assumed at the backend.
14. **No "remaining daily allowance" indicator wireframe** is specified in source docs; assumed to be a small informational line on the booking form.
15. **Tech stack** is TBD per CLAUDE.md and will be confirmed by the Solution Architect in the first 30 minutes; backlog is stack-agnostic.

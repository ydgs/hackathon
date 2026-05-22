# User Journeys — AI-Powered EV Charging Orchestration Platform

**Sources:** `.claude/docs/use-case-brief.md`, `.claude/docs/as-is-to-be.md`, `.claude/docs/functional-requirements.md`

## Overview

This document maps the end-to-end user journeys for the AI-Powered EV Charging Orchestration Platform MVP at NEX Tower and NEXTERACOM. It covers the six roles defined in the source documents (Standard User / Eligible EV User, Security User, Workplace User, Admin / Facilities, Reporting / ESG Viewer, Management / Jury), the main happy-path booking-to-session lifecycle integrated with the provided NexLevel CSMS, alternative and error branches, admin operations, multi-channel notification flows, reporting access, and the responsible AI insight loop.

---

## User Journeys by Role

### Standard User / Eligible EV User

- **Who:** Authenticated Accenture employee on the eligible-EV-user registry with `eligibilityStatus = Active`.
- **Primary goals:** Find a free charger, reserve a one-hour slot, charge their EV fairly, receive timely reminders, release the charger.
- **Key journeys:** Privacy acknowledgement, view availability, create booking, receive reminders, start session via authorized RFID/tag, see energy/kWh, release slot, view own notification history, update own vehicle make/model.

### Security User

- **Who:** On-site staff responsible for operational order at the parking/charging area.
- **Primary goals:** Maintain operational order at chargers; intervene on no-shows, late releases, and faults.
- **Key journeys:** View today's bookings and active sessions, manually release a booking with reason, mark charger Unavailable / Faulted / Blocked for Maintenance, receive intervention alerts, view notification audit/history and audit log.

### Workplace User

- **Who:** Workplace team member supporting day-to-day booking operations and exception handling.
- **Primary goals:** Reduce manual coordination, handle booking exceptions, assist eligible-user enrolment requests.
- **Key journeys:** View today's bookings, manually release a booking, create a booking on behalf of a user (with reason), receive intervention alerts, view audit log entries scoped to operational actions.

### Admin / Facilities User

- **Who:** Operations owner for chargers, eligible users, configuration, and reports.
- **Primary goals:** Configure rules, manage the charger and eligible-user registries, oversee maintenance and exceptions, access full reporting and audit data.
- **Key journeys:** Manage eligible EV users (CRUD), create/remove maintenance blocks, configure grace period and emission factor, admin override on bookings, view full audit log and full notification audit/history, view all reports.

### Reporting / ESG Viewer

- **Who:** Sustainability / ESG stakeholder.
- **Primary goals:** Evidence ESG and net-zero metrics from charging activity.
- **Key journeys:** Open sustainability and reporting dashboard, filter by date range and location, view CO₂ savings (kWh × fixed emission factor), view AI-generated natural-language summaries, export/screenshot reports.

### Management / Jury

- **Who:** Hackathon evaluators and leadership.
- **Primary goals:** Evaluate fairness, sustainability, AI credibility, OCPP-readiness, and operational excellence.
- **Key journeys:** View read-only dashboards, AI insights, and the end-to-end demo journey.

---

## Main Happy Paths

### Happy Path 1: First-time booking and charging session (P0 demo spine)

1. The eligible EV user logs in to the mobile-first responsive web app (FR-AUTH-001, FR-AUTH-002).
2. The user reads and acknowledges the current privacy notice; acknowledgement is persisted with version and timestamp (FR-PRIV-001..004, BR-023).
3. The user opens the real-time availability dashboard and filters by location (NEX Tower / NEXTERACOM) and time slot (FR-DASH-001, FR-DASH-002, FR-DASH-004).
4. The user selects an Available charger and opens the booking form; vehicle make/model is pre-filled from their eligible-EV-user record (FR-BOOK-013).
5. The user picks a start time and end time within 60 minutes; the UI displays the 1h-per-user-per-day fair-use rule (FR-BOOK-006, BR002).
6. The user submits the booking. The backend validates eligibility, privacy acknowledgement, daily cumulative duration ≤ 60 min, no overlap on the charger, no other active booking by the user (FR-BOOK-002..005, FR-AUTH-006, BR-001..003, BR-013, BR-017, BR-025).
7. On success, the backend calls `POST /api/auth/tags` on the CSMS to create the RFID/tag authorization window; booking `csmsSyncStatus` is set to `Authorized` (FR-OCPP-007, BR-027).
8. The user receives an immediate Booking-confirmation notification across In-app + Email payload + Teams Adaptive Card payload (FR-REM-008, FR-REM-011, FR-REM-012, BR-018).
9. Ten minutes before the booking start time, the user receives a Pre-session reminder (FR-REM-001).
10. The user taps the authorized RFID/tag at the simulator-backed charge point; the CSMS authorizes and starts the session.
11. The backend polls `GET /api/sessions/active` and updates the charger status to `Charging` in the dashboard (FR-OCPP-004, FR-DASH-004).
12. The CSMS captures meter values; the backend retrieves session detail and `energyKWh` via `GET /api/sessions/:id` and persists it on the local ChargingSession, mapped to the booking, user, and vehicle make/model (FR-OCPP-005, FR-OCPP-014).
13. Ten minutes before booking end, the user receives a Session-ending reminder (FR-REM-002).
14. The session reaches Completed in the CSMS; the user receives a Session-ended alert showing kWh delivered, followed by a Move-vehicle prompt (FR-REM-003, FR-REM-004, notifications table).
15. The user (or the system, on completion) releases the slot. The backend calls `DELETE /api/auth/tags/:idTag` to revoke the authorization; `csmsSyncStatus` becomes `Revoked` and the charger returns to `Available` (FR-OCPP-008, BR-028, BR-005).
16. The reporting dashboard, sustainability metrics, and AI insights update with the new session data (FR-REP-001..009, FR-AI-001..006).

### Happy Path 2: Returning user, repeat booking

1. Returning user logs in; privacy acknowledgement is already on file for the current notice version (no re-prompt; FR-PRIV-004).
2. User opens the dashboard, filters by their preferred location.
3. User books an Available 30-minute slot on the same calendar day (still within the 60-minute daily cumulative cap if no prior booking that day; otherwise rejected, see Alternative Paths) (BR-003).
4. Steps 7–16 of Happy Path 1 repeat.

### Happy Path 3: Admin creates a booking on behalf of a user

1. Admin logs in and opens the operational bookings view (FR-BOOK-012).
2. Admin selects an eligible EV user from the registry (FR-USER-003).
3. Admin selects a charger and a time window; admin may exceed the 1h cap with a captured reason (FR-BOOK-010, BR-007).
4. Backend validates charger availability and creates the booking; CSMS authorization is created via `POST /api/auth/tags`.
5. The action is audit-logged with actor, reason, before/after state (FR-AUDIT-001, FR-AUDIT-002).
6. The affected user receives an in-app + email + Teams notification of the booking (notifications table — booking confirmation; admin context noted).

---

## Alternative Paths

- **User books a shorter slot (e.g., 30 minutes):** Allowed if total daily cumulative duration stays ≤ 60 minutes (BR-003). Steps 6–16 of Happy Path 1 proceed normally.
- **User books a second slot the same day after the first completed for less than 60 min total:** Allowed up to the remaining daily allowance (BR-003). The booking form displays remaining minutes (assumption: surfaced as informational text).
- **User cancels a Confirmed (not yet Active) booking:** User chooses Cancel; state moves to `Cancelled`; backend calls `DELETE /api/auth/tags/:idTag`; CSMS authorization revoked; charger returns to `Available` (FR-BOOK-007, BR-028).
- **User releases an Active booking before scheduled end:** State moves to `Released`; authorization revoked; charger returns to `Available` (FR-BOOK-008, BR-011).
- **User updates vehicle make/model on profile:** Self-service edit on own eligible-EV-user record; change is audit-logged; subsequent bookings pre-fill the new value (FR-USER-006, FR-BOOK-013).
- **User charges less than the booked window and ends the session early:** CSMS reports session Completed; Move-vehicle prompt fires; user releases the slot (FR-REM-003, FR-REM-004).
- **Admin uses optional remote start/stop:** Admin triggers `POST /api/stations/:id/remote-start` or `/remote-stop` for the authorized booking (FR-OCPP-012, FR-OCPP-013). Optional, gated by configuration.
- **Admin overrides the 1h cap or extends a booking:** Admin/Security/Workplace provides a reason; action is audit-logged; user receives notification of the change (FR-BOOK-010, BR-007).
- **Standard User abandons booking flow before submission:** No CSMS call is made; no booking is created; no notification is generated.

---

## Error Paths

- **Not on eligible-EV-user registry:** Booking creation returns HTTP 403 with reason `NotEligible` (FR-USER-002, FR-AUTH-006). UI shows: "Your account is not on the eligible EV user registry. Contact the Workplace team to request enrolment." Recovery: user contacts Workplace; Workplace forwards to Admin for registry update.
- **Privacy notice not acknowledged:** Booking creation returns HTTP 403 with reason `PrivacyNotAcknowledged` (FR-PRIV-003, FR-AUTH-006). UI redirects user to the privacy notice screen. Recovery: user acknowledges and retries.
- **Booking exceeds 1h daily cap:** Server-side rejection (FR-BOOK-003, BR-003). UI shows remaining allowed minutes and prevents submission (assumption: client also enforces). Recovery: user adjusts end time or books on a future calendar day.
- **Booking overlaps an existing booking on the charger:** Server-side rejection (FR-BOOK-004, BR-002). UI shows: "This charger is already booked for that window. Pick a different slot or charger." Recovery: user selects another slot/charger.
- **User already holds a Pending/Confirmed/Active booking:** Rejection (FR-BOOK-005). UI shows: "You already have an active booking. Cancel or release it before booking again." Recovery: user manages existing booking first.
- **Booking start in the past:** Rejection per BR-013. UI surfaces validation message inline on the start-time field.
- **Charger is Blocked for Maintenance / Unavailable / Faulted:** Rejection per BR-004. UI marks the charger as unavailable on the dashboard and disables the Book button.
- **CSMS `POST /api/auth/tags` fails (non-2xx / timeout / network):** Booking `csmsSyncStatus` set to `AuthorizationFailed`; the booking is NOT counted as Reserved/Available capacity; user sees an error banner; admin/security/workplace receive an intervention alert (FR-OCPP-010, BR-029). Recovery: user retries booking; admin investigates CSMS connectivity.
- **No-show (user does not start within the 15-minute grace period):** Booking moves to `NoShow`, session state to `Expired`; backend calls `DELETE /api/auth/tags/:idTag`; charger returns to `Available`; auto-release notification sent (FR-REM-005, BR-006). Recovery: user can create a new booking subject to daily cap.
- **Charger faults during an Active session:** Session state moves to `Faulted`; booking moves to `Released` (or `Overridden`); user notified with severity Critical; admin/security/workplace intervention alert raised (BR-015, FR-REM-010, notifications table — charger fault during session). Recovery: user contacts Security; Admin removes/blocks the charger; refunds-of-time policy is out of scope (assumption).
- **Permission denied for restricted actions:** Backend returns HTTP 403 (FR-AUTH-004) for role-restricted actions (override of others' bookings, charger status writes, eligible-user CRUD by non-Admin, audit log access by Standard User, report-only views). UI hides controls and surfaces a clear "Not authorized" message if a deep link is used.
- **Network or backend timeout on booking submission:** UI shows retry option; the booking is not created until a successful server response is observed. Idempotency on retry is an assumption (`assumption`: backend handles duplicate submissions safely).
- **CSMS revoke failure on cancel/release:** Local booking state still updates; revocation failure is surfaced and audit-logged; reconciliation via `GET /api/auth/tags?active=true` (FR-OCPP-009, BR-028). Recovery: admin uses reconciliation view to retry revoke.
- **Invalid Adaptive Card JSON or email payload generation failure:** Notification record stored with `deliveryStatus = Failed`; visible in notification audit/history (BR-020). Recovery: admin can re-trigger generation (assumption).

---

## Admin Flows

### Manage eligible EV users (FR-USER-001..006)

1. Admin opens the Eligible EV Users screen.
2. Admin creates a new record: userId, EID, badgeId, eligibilityStatus, vehicleMake, vehicleModel, role, siteContext.
3. Admin saves; record is audit-logged (FR-AUDIT-001).
4. Admin can edit, suspend, re-activate, or delete records. Security and Workplace have read-only access.

### Create / remove maintenance block (FR-ADMIN-001..003, FR-OCPP-011)

1. Admin selects a charger and opens the maintenance block form.
2. Admin enters start time, optional end time, and reason.
3. Backend creates the block; calls `PUT /api/stations/:id/connectors/:n/block` on the CSMS; charger status becomes `Blocked for Maintenance`.
4. If the block window overlaps a Confirmed/Active booking, Admin must provide an explicit override that releases the affected booking with reason; user is notified (FR-ADMIN-003).
5. To remove the block, Admin calls the unblock action; backend calls `DELETE /api/stations/:id/connectors/:n/block`; charger returns to `Available`. All actions audit-logged.

### Admin override on a booking (FR-BOOK-009, FR-BOOK-010, BR-007)

1. Admin opens the operational view and selects a booking.
2. Admin chooses Release / Cancel / Extend / Override 1h cap and enters a non-empty reason.
3. Backend updates the booking state to `Overridden` (or `Released` / `Cancelled`); calls CSMS revoke where applicable; audit-logged.
4. Affected user receives Admin-manual-release confirmation notification.

### Configure rules (assumption — configuration screen scope)

1. Admin opens configuration: grace period (default 15 min), reminder lead times (default 10 min pre-start and pre-end), no-show intervention threshold (default ≥ 2 in 7 days), emission factor (default 0.85 kgCO₂/kWh), daily-cap baseline (default 60 min). (`assumption`: a dedicated configuration screen exists; the source docs describe configurable values without specifying the screen.)
2. Admin saves; values are validated and applied; changes are audit-logged.

### Charger status control (FR-DASH-006)

1. Security / Workplace / Admin selects a charger.
2. User chooses Unavailable, Faulted, or Blocked for Maintenance with a reason.
3. Backend updates status; CSMS is called where applicable; audit log entry written.

### Audit log read (FR-AUDIT-003, FR-AUDIT-005)

1. Admin opens the Audit Log view (full access). Security and Workplace see entries scoped to operational actions.
2. User filters by date range, actor, action type, or entity type.
3. Entries display timestamp, actor, action, entity, before/after state, reason, source. Records are immutable (FR-AUDIT-004).

---

## Notification Flows

All notifications follow the cross-channel rule: one logical notification per trigger, fan-out across In-app (required), Email (payload preview or live), Teams Adaptive Card (payload preview or live). Delivery status persisted as `Sent` / `Previewed` / `Failed` (BR-018, BR-019, BR-020). Each record links back to bookingId / sessionId / chargerId (BR-022).

| Trigger | Recipient | Channel | Message Summary |
|---|---|---|---|
| Booking confirmation (FR-REM-008) | Booking owner | In-app + Email + Teams | Booking on {charger} at {location} confirmed for {start}-{end} ({vehicle}). |
| Pre-session reminder (FR-REM-001) | Booking owner | In-app + Email + Teams | Your charging slot at {charger} starts in 10 minutes. |
| Booking grace period warning (FR-REM-009) | Booking owner | In-app + Email + Teams | Booking started; charging has not begun. Auto-release in {N} minutes. |
| Session-ending reminder (FR-REM-002) | Booking owner | In-app + Email + Teams | Your charging session ends in 10 minutes. Prepare to release. |
| Session-ended alert (FR-REM-003) | Booking owner | In-app + Email + Teams | Your charging session has ended. {energyKWh} kWh delivered. |
| Move-vehicle prompt | Booking owner | In-app + Email + Teams | Charging complete. Move your vehicle to free the slot. |
| Slot release prompt (FR-REM-004) | Booking owner | In-app + Email + Teams | Charging complete. Please release the charger. |
| Auto-release on no-show (FR-REM-005) | Booking owner | In-app + Email + Teams | Booking on {charger} released because charging did not start in time. |
| Admin manual release confirmation (FR-REM-006) | Affected user + acting operator | In-app + Email + Teams | Operator released your booking on {charger}. Reason: {reason}. |
| Charger fault during session | Booking owner | In-app + Email + Teams | Charger reported a fault. Session stopped. Contact security. |
| Intervention alert — repeated no-shows (FR-REM-010, BR-021) | Security + Workplace + Admin | In-app + Email + Teams | User {userId} has {N} no-shows in 7 days. Consider operational review. |
| Intervention alert — late release (FR-REM-010, BR-021) | Security + Workplace + Admin | In-app + Email + Teams | Charger {charger} session past booking window. Manual release may be needed. |
| Intervention alert — charger faulted (FR-REM-010, BR-021) | Security + Workplace + Admin | In-app + Email + Teams | Charger {charger} faulted during active session. Intervention required. |
| CSMS AuthorizationFailed (BR-029) | Booking owner + Security + Workplace + Admin | In-app + Email + Teams (`assumption`: same fan-out as intervention alerts) | Booking authorization with charging infrastructure failed. Operational review needed. |

Notification triggers split into:

- **System-initiated:** Pre-session reminder, grace-period warning, session-ending reminder, session-ended alert, move-vehicle prompt, auto-release on no-show, intervention alerts (repeated no-shows / late release / charger faulted), CSMS AuthorizationFailed.
- **User-initiated:** Booking confirmation (triggered by user submitting a booking), admin manual release confirmation (triggered by an operator action — system fans it out to the affected user).

In-app notification center supports read/unread state and Mark-as-read (FR-REM-014, FR-REM-015). Admin notification audit/history exposes every record across all channels with payload preview (FR-REM-016, FR-REM-019).

---

## Reporting Flows

Reporting dashboard supports date range and location filters (FR-REP-013) and visibly labels any widget whose underlying data includes simulator-sourced records as "Based on simulated demo data" (FR-REP-012, BR-009).

1. Reporting/ESG Viewer (or Admin / Workplace / Management) opens the Reporting & Sustainability dashboard.
2. User selects date range and location filter (NEX Tower / NEXTERACOM / both).
3. Dashboard renders the metric tiles listed below.
4. User drills into a tile to see the underlying breakdown (per charger, per hour-of-day, per vehicle category where privacy permits).
5. User may export/screenshot the dashboard (`assumption`: export is screenshot-based for MVP; no formal CSV export specified).

| Report | Audience | Filters | Drill-down |
|---|---|---|---|
| Total charging sessions (FR-REP-001) | Admin, Workplace, Reporting/ESG, Management | date range, location, charger | per charger, per day |
| Total energy consumed kWh (FR-REP-002) | Admin, Workplace, Reporting/ESG | date range, location, charger | per session, per user (admin only) |
| Average session duration (FR-REP-003) | Admin, Workplace | date range, location, charger | per charger |
| Average energy per session (FR-REP-004) | Admin, Workplace, Reporting/ESG | date range, location | per charger |
| Charger utilization rate (FR-REP-005) | Admin, Workplace | date range, location | per charger, per hour |
| Peak charging hours (FR-REP-006) | Admin, Workplace | date range, location | hour-of-day distribution |
| Most-used chargers (FR-REP-007) | Admin, Workplace | date range, location | ranked list, per-charger detail |
| Location comparison (FR-REP-008) | Admin, Reporting/ESG, Management | date range | side-by-side metric table |
| Estimated CO₂ savings (FR-REP-009) | Reporting/ESG, Management | date range, location | shows emission factor used (BR-008) |
| Failed / cancelled / released bookings (FR-REP-010) | Admin, Workplace | date range, location | per state, per user (admin only) |
| Faulted / unavailable charger events (FR-REP-011) | Admin, Workplace | date range, location | timeline per charger |
| Notification delivery metrics (FR-REP-014) | Admin, Workplace | date range, channel | per channel, per status |
| Notification acknowledgment rate (FR-REP-015) | Admin, Workplace | date range | percentage trend over time |
| No-show rate after reminders (FR-REP-016) | Admin, Workplace | date range, location | segmented by reminder-generated yes/no |
| Usage by vehicle category (FR-REP-017) | Admin, Reporting/ESG | date range, location | aggregated; suppressed below 3-user threshold |

---

## AI Insight Flows

The Responsible AI layer is P2 / Could-have (FR-AI-001..011) and is grounded in system data with explicit simulated-data labelling and low-confidence disclosure rules.

1. Admin / Workplace / Reporting-ESG / Management user opens the AI Insights panel (typically embedded in the reporting dashboard).
2. Panel renders four insight types: Demand forecast (next 24h peak windows), Pattern detection (underused chargers, repeated late releases), Anomaly flags (energy spikes, unusual sessions, repeated no-shows), Natural-language daily summary.
3. Each insight displays:
   - The natural-language statement.
   - A `grounding` block listing the underlying records / metrics cited (FR-AI-007).
   - A "Based on simulated demo data" label when any underlying record is simulator-sourced (FR-AI-008, BR-009).
   - A low-confidence disclosure when supporting data is insufficient (< 10 sessions in window); no point forecast is produced (FR-AI-009).
4. User can drill into the grounding block to see the underlying metric in the reporting dashboard (cross-checkable per FR-AI-010).
5. User can act on operational recommendations (FR-AI-004) — for example, adjusting reminder lead times — by opening the relevant configuration screen. The AI does not directly mutate configuration (`assumption`: human-in-the-loop only).
6. Feedback capture: not explicitly specified in source docs. (`assumption`: an "Accept / Dismiss" control on each insight card with state stored locally for the session; persistent thumbs-up/thumbs-down feedback is out of scope for MVP unless time permits.)
7. AI-assisted notification phrasing (FR-AI-011) is optional and follows the same grounding, labelling, and low-confidence rules as other AI outputs.

---

## Assumptions Flagged

The following items are inferred but not explicitly stated in the source docs and should be validated:

1. The "remaining daily allowance" indicator on the booking form is surfaced as informational text — source docs require the daily cap but do not specify the UI pattern. (`assumption`)
2. A dedicated Admin Configuration screen exists for grace period, reminder lead times, intervention thresholds, emission factor, and daily-cap baseline. The source docs describe these values as configurable but do not specify the screen. (`assumption`)
3. Backend handles idempotent retry on a duplicate booking submission after a transient network failure. (`assumption`)
4. Refund-of-time policy when a charger faults mid-session (does the user get their remaining daily allowance back?) is out of scope for MVP. (`assumption`)
5. Reporting export is screenshot-based for the MVP; no CSV / PDF export specified in source docs. (`assumption`)
6. CSMS AuthorizationFailed intervention alert fans out across the same channels as other intervention alerts (in-app + email + Teams). (`assumption`)
7. Feedback capture on AI insights is limited to an in-session "Accept / Dismiss" control; persistent feedback storage is not in MVP scope. (`assumption`)

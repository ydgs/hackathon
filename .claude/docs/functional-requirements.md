# Functional Requirements — AI-Powered EV Charging Orchestration Platform

## 1. Document Header

| Field | Value |
|---|---|
| **Title** | Functional Requirements — AI-Powered EV Charging Orchestration Platform |
| **Purpose** | Translate the use-case brief into concrete, testable functional requirements, business rules, validations, and acceptance criteria that drive backlog generation, implementation, QA, and demo for the 16-hour hackathon MVP. |
| **Source** | `.claude/docs/use-case-brief.md` (Accenture Mauritius NEXLevel — "Energising the Future, Reinvented") |
| **Status** | Draft — Hackathon MVP |
| **Date** | 2026-05-22 |
| **Version** | v1.3 |
| **Author** | Product Analyst |
| **Audience** | Solution Architect, Backend Dev, Frontend Dev, QA, Scrum Master, Demo Coach |
| **Revision Notes** | v1.3 — Aligned to the updated `.claude/docs/use-case-brief.md` (Section 6.1 — Provided CSMS / OCPP Simulator Constraint). Key changes: (1) The custom application MUST NOT implement a custom OCPP WebSocket server, raw OCPP protocol handlers, or raw OCPP message ingestion. All charging infrastructure data comes from the provided NexLevel CSMS REST API. (2) Section 4.3 renamed from "OCPP-Style Consumption Capture (simulated telemetry)" to "CSMS REST API Integration"; FR-OCPP-001..014 retained the same IDs for traceability but their descriptions were rewritten to describe consuming CSMS REST endpoints (`GET /api/stations`, `GET /api/stations/:identity`, `GET /api/sessions/active`, `GET /api/sessions/:id`, `GET /api/sessions`, `POST /api/auth/tags`, `DELETE /api/auth/tags/:idTag`, `GET /api/auth/tags?active=true`, `PUT/DELETE /api/stations/:id/connectors/:n/block`, `POST /api/stations/:id/remote-start`, `POST /api/stations/:id/remote-stop`). (3) Added a "CSMS Authorization Sync Status" sub-section with the booking sync states `AuthorizationPending`, `Authorized`, `AuthorizationFailed`, `Revoked`. (4) Scope summary rewritten to remove references to building a custom OCPP ingestion endpoint; replaced with CSMS REST API integration language. (5) BR-027 and BR-028 rewritten to describe CSMS booking-to-authorization flow validation; added BR-029 for AuthorizationFailed handling. (6) Validation rules updated: removed TelemetryEvent / Authorize event rows; added Booking.csmsSyncStatus, CSMS-call station/connector validation, and CSMS error → AuthorizationFailed mapping. (7) Acceptance criteria for Section 4.3 (AC-OCPP-01..09) rewritten to test CSMS integration (POST/DELETE /api/auth/tags, GET /api/sessions/active, GET /api/sessions/:id, GET /api/stations, connector block/unblock, end-to-end CSMS-driven lifecycle). (8) Section 12 Demo Journey updated to describe CSMS-driven flow (POST /api/auth/tags on booking confirmation, GET /api/sessions/active polling, GET /api/sessions/:id for energy, GET /api/stations for connector status). (9) Out-of-scope (Section 15) explicitly lists "Custom OCPP WebSocket server" and "Raw OCPP message handling". (10) Traceability table row "OCPP-Style Consumption Capture & Contactless Auth" renamed to "CSMS REST API Integration" with updated brief section references (6.1, 10.3, 18). (11) Open Questions Q25 (CSMS base URL / auth), Q26 (polling interval), and Q27 (idTag format) added. No existing FR/BR/AC IDs from v1.1 or v1.2 were renumbered. v1.2 — Aligned to the latest `.claude/docs/use-case-brief.md`. Key changes: (1) Corrected the daily charging cap from 2 hours / 120 minutes to **1 hour / 60 minutes per user per day** (BR002 alignment) across scope summary, FR-BOOK-002/003/006, BR-001, validations, AC-BOOK-03, AC-BOOK-07, assumptions, and traceability. (2) Added a Privacy Acknowledgement feature group (FR-PRIV-001..005, BR-023..024, AC-PRIV-01..04) per brief Section 10.11 / BR013. (3) Added an Eligible EV User Management feature group (FR-USER-001..006, BR-025..026, AC-USER-01..04) per brief Section 10.5 / BR006. (4) Added an explicit OCPP Authorize / contactless handshake event (FR-OCPP-011..013, BR-027..028, AC-OCPP-09..11) per brief Section 10.3 / BR004. (5) Added vehicle make/model capture on session/booking (FR-BOOK-013, FR-OCPP-014, FR-REP-017). (6) Added Audit Log as a first-class feature group (FR-AUDIT-001..005, AC-AUDIT-01..03) per brief Section 16. (7) Added Admin Maintenance Block management (FR-ADMIN-001..003, AC-ADMIN-01..02) per brief Section 10.10. (8) Added booking state `Pending` and re-confirmed `Overridden`; added Charging Session state enum `NotStarted, Authenticating, Charging, Completed, StoppedByUser, StoppedByAdmin, Faulted, Expired` per brief Section 17. (9) Added Workplace User as a first-class role and clarified Reporting/ESG Viewer per brief Section 10.9. (10) Re-aligned charger status to canonical UI label **Blocked for Maintenance** per brief Section 10.2 (kept legacy term `Maintenance` documented as equivalent). (11) Refreshed notification section against brief Sections 10.6, 13, 14, 19 — kept all v1.1 notification content; clarified Workplace user as a recipient for operational alerts and added Adaptive Card preview persistence requirement (FR-REM-019). No existing IDs from v1.1 were renumbered. |

---

## 2. Scope Summary

The MVP is a mobile-first responsive web application for fair EV charger reservation, real-time charger visibility, CSMS-driven session and energy capture (including booking-to-RFID/tag authorization via the provided CSMS), eligible EV user management, privacy acknowledgement, sustainability reporting, and responsible AI insights at NEX Tower and NEXTERACOM.

**In scope:** authenticated booking with a **1-hour-per-user-per-day fair-use cap** (BR002), privacy acknowledgement, eligible EV user registry, live charger dashboard, integration with the **provided NexLevel CSMS REST API** (station status, active and historical sessions, meter values, RFID/tag authorization windows, connector block/unblock, optional remote start/stop), booking-to-CSMS RFID/tag authorization lifecycle (`POST /api/auth/tags` on confirm, `DELETE /api/auth/tags/:idTag` on cancel/release), local mapping of CSMS sessions/energy data to bookings/users/vehicles, session/energy tracking with vehicle make/model capture, reporting and sustainability metrics, multi-channel reminders (in-app required; email and Microsoft Teams Adaptive Card delivery if feasible, otherwise realistic preview/generated payloads for demo), notification center and history, admin/security/workplace override and manual release, maintenance block create/remove (via CSMS connector block APIs), audit logging for critical actions, and a grounded AI insights panel.

**Out of scope:** real OCPP hardware integration, **custom OCPP WebSocket server implementation, raw OCPP protocol handlers, raw OCPP message ingestion (BootNotification, StatusNotification, Authorize, StartTransaction, MeterValues, StopTransaction) — all charging infrastructure data comes from the provided CSMS REST API**, SMS or mobile push notification delivery, fully production-grade email/Teams notification infrastructure (preview/generated payloads acceptable for MVP if live delivery not feasible), payments, HR system integration, native mobile apps, multi-tenant support, fleet/vehicle management beyond storing make/model, grid pricing, dynamic tariffs, and vehicle-charger compatibility matching.

---

## 3. User Roles and Permissions

Roles are aligned with brief Sections 7 and 10.9.

| Role | Description | Key Actions (CAN) | Restricted (CANNOT) |
|---|---|---|---|
| **Standard User / Eligible EV User** | Authenticated employee on the eligible-EV-user registry who needs to charge a personal EV | Acknowledge privacy notice; view charger availability across both locations; create, view, cancel, or release own bookings (≤ 1h/day); declare vehicle make/model on booking or profile; receive in-app reminders across all reminder template types; view own notification history; mark own notifications read; preview email/Teams Adaptive Card payloads addressed to them; view own session status; view basic sustainability insights | Book without privacy acknowledgement; book without being on the eligible EV user registry; create overlapping bookings; exceed 1h/day; hold more than one active booking; override another user's booking; change charger status manually; access admin reports; bypass fair-use rules; dismiss or modify other users' notifications |
| **Security User** | On-site staff responsible for operational order at the parking/charging area | View today's bookings and active sessions; mark charger Unavailable / Faulted / Blocked for Maintenance; manually release a booking; override the 1h cap when operationally required (with reason); receive admin/security/workplace intervention alerts (repeated no-shows, late release, charger fault); view notification audit/history for operational triage; view audit log entries | Run sustainability/ESG reports as primary user; create bookings on behalf of employees outside operational need; alter historical telemetry records; suppress or delete audit notifications; modify the eligible EV user registry |
| **Workplace User** | Workplace team member who supports day-to-day booking operations and exception handling | View today's bookings and active sessions across both locations; manually release a booking; create a booking on behalf of a user (with reason); receive operational intervention alerts; view notification audit/history for operational triage; view audit log entries; assist with eligible EV user enrolment requests (submission to Admin) | Approve or change eligible EV user registry entries directly (Admin only); modify telemetry events; bypass audit logging; access raw simulator endpoints |
| **Admin (Facilities / Admin User)** | Operations owner for chargers, eligible users, configuration, and reports | All Security and Workplace actions; manage charger registry; manage eligible EV user registry (CRUD with audit); manage business configuration (grace period, emission factor, notification lead times, intervention thresholds, daily cap baseline); create / remove maintenance blocks; admin override on any booking with reason; access full notification audit/history across users and channels; access full audit log; view email/Teams Adaptive Card generated payloads for demo verification | Modify raw telemetry events; impersonate an employee for non-operational reasons; bypass audit logging; delete audit log records |
| **Reporting / ESG Viewer** | Sustainability / ESG stakeholder | View sustainability and reporting dashboards (kWh, CO₂, utilization, trends, location comparison, vehicle-segmented usage where privacy permits); export/screenshot reports; view AI-generated NL summaries and forecasts | Create or modify bookings; change charger status; modify emission factor or any configuration; manage eligible users; release bookings |
| **Management / Jury** | Hackathon evaluators / leadership | View dashboards, AI insights, and the demo journey | Perform any write action |

**Admin/Security/Workplace override:** Security, Workplace, and Admin can release, cancel, or extend a booking beyond the 1h cap subject to RBAC. Override actions MUST require a reason field and are audit-logged (see Audit Log, Section 4.9).

**Fair-use exceptions:** Only Security, Workplace, or Admin roles can authorise an override of the 1h cap or the "one active booking per user" rule. Workplace and Security override permissions can be tuned by Admin configuration.

---

## 4. Functional Requirements Grouped by Feature

### 4.1 Slot Booking

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-BOOK-001** | List available chargers | The system shall list all chargers across NEX Tower and NEXTERACOM with current status and location filter. | P0 | Standard User, Security, Workplace, Admin |
| **FR-BOOK-002** | Create booking | An authenticated Eligible EV User who has acknowledged the privacy notice can create a booking for an Available charger by selecting start time and end time (duration ≤ 60 minutes per BR002). | P0 | Standard User |
| **FR-BOOK-003** | Enforce 1h max duration per day | The system shall reject any booking creation or update where end − start > 60 minutes for non-admin users, and shall reject any booking whose total combined Confirmed/Active duration for the user on the same calendar day would exceed 60 minutes. | P0 | Standard User |
| **FR-BOOK-004** | Prevent overlapping bookings on same charger | The system shall reject a booking whose time window overlaps an existing Pending/Confirmed/Active booking on the same charger. | P0 | Standard User, Security, Workplace, Admin |
| **FR-BOOK-005** | One active booking per user | The system shall reject a booking when the requesting user already holds a Pending, Confirmed, or Active booking. | P0 | Standard User |
| **FR-BOOK-006** | Display 1h fair-use rule pre-confirmation | The booking confirmation screen shall display the 1-hour-per-user-per-day max rule (BR002) before submission. | P0 | Standard User |
| **FR-BOOK-007** | Cancel booking | A user can cancel their own Confirmed (not yet Active) booking. State moves to Cancelled. | P0 | Standard User |
| **FR-BOOK-008** | Release booking | A user can release an Active booking before its scheduled end. State moves to Released, charger returns to Available. | P1 | Standard User |
| **FR-BOOK-009** | Admin/Security/Workplace manual release | Security, Workplace, or Admin can release any booking; state moves to Overridden; reason captured. | P1 | Security, Workplace, Admin |
| **FR-BOOK-010** | Admin/Security/Workplace 1h override | Security, Workplace, or Admin can create or extend a booking beyond 1h; reason captured; audit-logged. | P1 | Security, Workplace, Admin |
| **FR-BOOK-011** | View my bookings | A Standard User can list and view detail of their bookings (Pending, Confirmed, Active, Completed, Cancelled, Released, NoShow, Overridden). | P0 | Standard User |
| **FR-BOOK-012** | View today's bookings (operational) | Security, Workplace, or Admin can view a list of all bookings for today across both locations. | P1 | Security, Workplace, Admin |
| **FR-BOOK-013** | Capture vehicle make/model on booking | Booking creation shall capture the vehicle make and model (pre-filled from the user's eligible-EV-user record where present, editable per booking). Vehicle make/model shall be persisted on the booking and the resulting charging session. | P1 | Standard User, Security, Workplace, Admin |

### 4.2 Real-Time Availability Dashboard

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-DASH-001** | Show all chargers with status | Display each charger with status (Available, Reserved, Charging, Blocked for Maintenance, Unavailable, Faulted), location, and connector. The canonical UI label is "Blocked for Maintenance" (legacy term "Maintenance" remains as a data equivalence). | P0 | All |
| **FR-DASH-002** | Filter by location | Allow filtering by NEX Tower or NEXTERACOM. | P0 | All |
| **FR-DASH-003** | Mobile-first layout | Charger cards readable on mobile (≥320px) with large touch targets, no horizontal scroll. | P0 | Standard User |
| **FR-DASH-004** | Real-time / near-real-time updates | Charger status reflects CSMS station/connector state (sourced from `GET /api/stations`, `GET /api/sessions/active`) within 5 seconds via backend polling at the configured interval (default 5s; SignalR/WebSocket optional if exposed by the CSMS). | P0 | All |
| **FR-DASH-005** | Show active session info | When a charger is Charging, show transactionId, user (masked for non-admin), elapsed time, energyKWh, and vehicle make/model (privacy-permitting; masked for non-admin). | P1 | All (admin sees user) |
| **FR-DASH-006** | Admin charger status control | Security, Workplace, or Admin can mark a charger Unavailable, Faulted, or Blocked for Maintenance with reason. | P1 | Security, Workplace, Admin |
| **FR-DASH-007** | Status driven by backend only | UI shall not modify charger status locally; status comes from backend events. | P0 | System |

### 4.3 CSMS REST API Integration

Brief reference: Sections 6.1 (Provided CSMS / OCPP Simulator Constraint), 10.3, 18.

> **Important constraint:** The custom application MUST NOT implement a custom OCPP WebSocket server, raw OCPP protocol handlers, or raw OCPP message ingestion (BootNotification, StatusNotification, Authorize, StartTransaction, MeterValues, StopTransaction). All charging infrastructure data flows from the provided NexLevel CSMS through its REST API into the custom backend, and from the backend into the frontend.

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-OCPP-001** | Station status retrieval | The backend shall integrate with the provided CSMS REST API (`GET /api/stations`) to retrieve all station identities and live connection status, and shall use this as the canonical source of station availability. | P0 | System |
| **FR-OCPP-002** | Single station retrieval | The backend shall retrieve individual station details and connector status via `GET /api/stations/:identity` from the CSMS, and shall map the returned data onto the local charger registry. | P0 | System |
| **FR-OCPP-003** | Charger status synchronization | The backend shall periodically poll or sync station/connector status from the CSMS and update the internal charger registry. The update interval is configurable (default 5 seconds) and drives the real-time dashboard refresh. | P0 | System |
| **FR-OCPP-004** | Active session retrieval | The backend shall retrieve active charging sessions from the CSMS via `GET /api/sessions/active` and map them to local bookings (by idTag / station / connector). | P0 | System |
| **FR-OCPP-005** | Session details and meter values | The backend shall retrieve session details, meter values, and cumulative energy from the CSMS via `GET /api/sessions/:id` and persist `energyKWh` (and final session timestamps) on the local ChargingSession record. | P0 | System |
| **FR-OCPP-006** | Historical session retrieval | The backend shall retrieve historical sessions from the CSMS via `GET /api/sessions?station=&idTag=&status=&from=&to=` for reporting, sustainability dashboards, and AI insights. | P0 | System |
| **FR-OCPP-007** | Booking-to-RFID/tag authorization | When a booking is confirmed, the backend shall call `POST /api/auth/tags` on the CSMS to create an authorization window for the booking's RFID/idTag, station, and time window. The booking shall store a CSMS sync status (one of `AuthorizationPending`, `Authorized`, `AuthorizationFailed`, `Revoked`). | P0 | System |
| **FR-OCPP-008** | Authorization revocation | When a booking is cancelled or released (by the user, by the system on no-show, or by an admin/security/workplace override), the backend shall call `DELETE /api/auth/tags/:idTag` on the CSMS to revoke the authorization window. The revocation outcome is persisted on the booking (`Revoked` on success; failures are surfaced and audit-logged). | P0 | System |
| **FR-OCPP-009** | Active authorization listing | The backend shall query `GET /api/auth/tags?active=true` on the CSMS to verify current authorization state and reconcile with local booking records (used for sync repair and for operational troubleshooting views). | P0 | System |
| **FR-OCPP-010** | CSMS sync failure handling | If a CSMS authorization call (`POST /api/auth/tags`) fails (non-2xx response, timeout, network error), the booking MUST NOT be silently confirmed as fully operational. The booking `csmsSyncStatus` shall be set to `AuthorizationFailed`, the user shall see an error message, and an admin/security/workplace intervention alert shall be raised. | P0 | System |
| **FR-OCPP-011** | Maintenance block via CSMS | When an Admin creates a maintenance block, the backend shall call `PUT /api/stations/:id/connectors/:n/block` on the CSMS to block the connector in the charging infrastructure. When the block is removed, the backend shall call `DELETE /api/stations/:id/connectors/:n/block`. Both actions are audit-logged. | P1 | System |
| **FR-OCPP-012** | Optional remote start | If required by the demo journey, the backend may call `POST /api/stations/:id/remote-start` on the CSMS to trigger a charging session start for a confirmed booking using the authorized idTag. This action is optional and gated by configuration. | P2 | System |
| **FR-OCPP-013** | Optional remote stop | If required by the demo journey, the backend may call `POST /api/stations/:id/remote-stop` on the CSMS to stop an active charging session (for example as part of admin/security manual release). This action is optional and gated by configuration. | P2 | System |
| **FR-OCPP-014** | Capture vehicle make/model on session | Where vehicle make/model is present on the booking or eligible-EV-user record, it shall be persisted on the charging session retrieved from the CSMS. Reports may segment by vehicle category subject to privacy rules. | P1 | System |

#### CSMS Authorization Sync Status

Every booking carries a `csmsSyncStatus` field reflecting the result of integration with the provided CSMS:

| Status | Meaning |
|---|---|
| **AuthorizationPending** | `POST /api/auth/tags` call to the CSMS has not yet been made or is in progress. Booking is locally created but not yet fully operational against the CSMS. |
| **Authorized** | CSMS confirmed the authorization window (2xx response from `POST /api/auth/tags`). Booking is fully operational and the RFID/idTag can be used at the station. |
| **AuthorizationFailed** | CSMS call failed (non-2xx, timeout, or network error). Booking is NOT fully operational. User and admin/security/workplace are informed; the booking does not count as Reserved/Available capacity until resolved. |
| **Revoked** | CSMS authorization was revoked via `DELETE /api/auth/tags/:idTag` (booking cancelled, released, or admin override). |

> **Reminder:** The custom application must NOT implement a custom OCPP WebSocket server, raw OCPP protocol handlers, or raw OCPP message ingestion. All charging infrastructure data comes through the provided CSMS REST API. OCPP-level message handling (BootNotification, StatusNotification, Authorize, StartTransaction, MeterValues, StopTransaction) is owned by the provided NexLevel CSMS.

### 4.4 Smart Reminders and Slot Release

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-REM-001** | Pre-session reminder | Generate an in-app reminder N minutes before booking start time (default 10 minutes). | P1 | Standard User |
| **FR-REM-002** | Session-ending reminder | Generate an in-app reminder N minutes before booking end (default 10 minutes). | P1 | Standard User |
| **FR-REM-003** | Session-ended alert | When a ChargingSession reaches Completed, generate an in-app alert to the user. | P1 | Standard User |
| **FR-REM-004** | Release prompt | If a session ends but the booking is still Active, prompt the user to release the charger. | P1 | Standard User |
| **FR-REM-005** | Auto-release on no-show | If the user has not started charging within the grace period (default 15 minutes) after booking start, the booking is moved to NoShow (session state Expired) and the charger returns to Available. | P1 | System |
| **FR-REM-006** | Admin manual release confirmation | When Security/Workplace/Admin manually releases, the affected user receives an in-app notification with the reason. | P1 | Standard User, Security, Workplace, Admin |
| **FR-REM-007** | List notifications | Standard Users can view a list of their in-app notifications. | P1 | Standard User |
| **FR-REM-008** | Booking confirmation reminder | On successful booking creation, generate an in-app notification confirming the booking (charger, time window, location, vehicle make/model). | P1 | Standard User |
| **FR-REM-009** | Booking grace period warning | After booking startTime if no active charging session has been reported by the CSMS (`GET /api/sessions/active`) for the booking's idTag, send an in-app warning to the user before the grace period expires (default: 5 minutes after start, i.e. 10 minutes before auto-release). | P1 | Standard User |
| **FR-REM-010** | Admin/security/workplace intervention alert | Generate an in-app alert to Security, Workplace, and Admin when operational intervention may be needed: repeated no-shows by a user (threshold configurable, default ≥ 2 in 7 days), late release (session continues past booking end + grace), or charger Faulted during active session. | P1 | Security, Workplace, Admin |
| **FR-REM-011** | Email notification delivery or preview | For every reminder template, the system shall either send a real email (if SMTP/mock provider configured) or generate and persist a realistic email payload (subject, body, recipient) viewable in the notification audit/history for demo purposes. | P1 | Standard User, Security, Workplace, Admin |
| **FR-REM-012** | Microsoft Teams Adaptive Card delivery or preview | For every reminder template, the system shall either deliver an Adaptive Card via Incoming Webhook / Power Automate / Microsoft Graph (if available) or generate and persist a valid Adaptive Card JSON payload viewable in the notification audit/history for demo purposes. | P1 | Standard User, Security, Workplace, Admin |
| **FR-REM-013** | Teams Adaptive Card actions | Generated Adaptive Cards shall support the following actions where feasible: View booking, Release slot, Confirm session started, Acknowledge end-of-session reminder. For the MVP these actions may deep-link back to the web application rather than execute inside Teams. | P1 | Standard User |
| **FR-REM-014** | Notification center / persistent in-app history | The in-app notification center shall display all notifications addressed to the current user across all channels (in-app, email payload, Teams Adaptive Card payload), with read/unread state, timestamp, channel indicator, and the linked booking/session/charger context. | P1 | Standard User, Security, Workplace, Admin |
| **FR-REM-015** | Mark notification read | Users can mark an individual in-app notification as read; the unread count badge updates accordingly. | P1 | Standard User, Security, Workplace, Admin |
| **FR-REM-016** | Notification audit/history endpoint | The backend shall expose a notification audit/history endpoint listing every notification generated (in-app, email payload, Teams payload) with trigger event, audience, channel, timing, payload reference, and delivery status (Sent, Previewed, Failed). | P1 | Security, Workplace, Admin |
| **FR-REM-017** | Reminder template registry | The system shall implement the nine reminder templates listed in the brief Section 19: Booking confirmation, Session starting soon, Booking grace period warning, Charging session ending soon, Charging session ended, Move vehicle prompt, Slot release prompt, Auto-release/no-show notification, Admin/security/workplace intervention alert. Each template shall be available across in-app, email, and Teams channels. | P1 | System |
| **FR-REM-018** | Cross-channel consistency | A single trigger event shall produce one logical notification record with the same message intent across all enabled channels (in-app, email, Teams). The user must not receive contradictory wording or timing across channels for the same event. | P1 | System |
| **FR-REM-019** | Adaptive Card preview persistence | When Teams delivery is not configured for live delivery, the generated Adaptive Card JSON payload shall be persisted in the notification audit/history exactly as it would have been delivered, and shall be retrievable and renderable (preview) from the admin notification audit view. The same persistence applies to generated email payloads. | P1 | Security, Workplace, Admin |

### 4.5 Reporting and Sustainability Dashboard

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-REP-001** | Total charging sessions | Display total count of ChargingSessions over a selected date range. | P0 | Admin, Workplace, Reporting/ESG Viewer, Management |
| **FR-REP-002** | Total energy consumed (kWh) | Display sum of energyKWh across all completed sessions. | P0 | Admin, Workplace, Reporting/ESG Viewer |
| **FR-REP-003** | Average session duration | Display avg(stopTime − startTime) for completed sessions retrieved from the CSMS via `GET /api/sessions`. | P1 | Admin, Workplace |
| **FR-REP-004** | Average energy per session | Display avg(energyKWh) per completed session. | P1 | Admin, Workplace, Reporting/ESG Viewer |
| **FR-REP-005** | Charger utilization rate | Display % of operating hours a charger spent in Reserved or Charging state. | P1 | Admin, Workplace |
| **FR-REP-006** | Peak charging hours | Display distribution of charging starts by hour-of-day. | P1 | Admin, Workplace |
| **FR-REP-007** | Most-used chargers | Ranked list of chargers by session count. | P1 | Admin, Workplace |
| **FR-REP-008** | Location comparison | Side-by-side metrics for NEX Tower vs NEXTERACOM. | P1 | Admin, Reporting/ESG Viewer, Management |
| **FR-REP-009** | Estimated CO₂ savings | Display total estimated kgCO₂ avoided using formula `kWh * fixedEmissionFactor`. Display the emission factor value used. | P0 | Reporting/ESG Viewer, Management |
| **FR-REP-010** | Failed / cancelled / released bookings | Display counts of failed booking attempts, cancellations, and releases. | P1 | Admin, Workplace |
| **FR-REP-011** | Faulted / unavailable charger events | Display count and timeline of charger fault and unavailable events. | P1 | Admin, Workplace |
| **FR-REP-012** | Label simulated data | All report widgets shall include a visible "Based on simulated demo data" label when any of the underlying data is sourced from the CSMS simulator (i.e. local ChargingSession records with `source = "CSMS-Simulator"`). | P0 | System |
| **FR-REP-013** | Date range and location filters | Reporting dashboard shall support date range and location filtering. | P1 | Admin, Workplace, Reporting/ESG Viewer |
| **FR-REP-014** | Notification delivery metrics | Display counts of notifications generated by channel (in-app, email, Teams) and by delivery status (Sent, Previewed, Failed) over the selected date range. | P1 | Admin, Workplace |
| **FR-REP-015** | Notification acknowledgment rate | Display the percentage of in-app notifications marked read by users over the selected date range. | P2 | Admin, Workplace |
| **FR-REP-016** | No-show rate after reminders | Display the rate of NoShow bookings as a percentage of total bookings, segmented by whether the pre-session reminder was generated. | P1 | Admin, Workplace |
| **FR-REP-017** | Usage by vehicle category (privacy-permitting) | Display aggregated charging usage (sessions, kWh) grouped by vehicle make and/or model where the data is available and privacy rules allow. Output MUST be aggregated and not expose individual users' vehicle identity below an aggregation threshold (default ≥ 3 users per group). | P2 | Admin, Reporting/ESG Viewer |

### 4.6 Responsible AI Layer

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-AI-001** | Demand forecasting | Provide a forecast of likely peak charging windows for the next 24h based on booking and session history. | P2 | Admin, Management |
| **FR-AI-002** | Pattern detection | Detect underused chargers, high-demand periods, and repeated late releases. | P2 | Admin, Workplace |
| **FR-AI-003** | Intelligent natural-language reporting | Generate a short natural-language daily summary of charging activity. | P2 | Admin, Reporting/ESG Viewer, Management |
| **FR-AI-004** | Operational recommendations | Suggest fair-use adjustments (e.g., reduce slot duration in peak windows, encourage off-peak booking) grounded in the 1h/day baseline. | P2 | Admin, Workplace |
| **FR-AI-005** | Anomaly flagging | Flag unexpected energy spikes, unusually long sessions, and repeated no-shows. | P2 | Admin, Workplace |
| **FR-AI-006** | NL insight generation | Generate management-friendly NL insights linked to underlying metrics. | P2 | Management, Reporting/ESG Viewer |
| **FR-AI-007** | Grounding rule | AI outputs must reference at least one underlying metric, charger, session, or booking record from the system. | P2 | System |
| **FR-AI-008** | Simulated data disclosure | When insights are derived from simulator-sourced data, the output must include a "Based on simulated demo data" label. | P2 | System |
| **FR-AI-009** | Low-confidence disclosure | When supporting data is insufficient (e.g., < 10 sessions in the window), the AI must state that confidence is limited and not produce point forecasts. | P2 | System |
| **FR-AI-010** | No fabricated metrics | AI must not invent metrics that do not exist in the data store; outputs shall be cross-checkable against reporting endpoints. | P2 | System |
| **FR-AI-011** | AI-assisted notification phrasing (optional) | When generating the natural-language body for an admin/security/workplace intervention alert or daily summary notification, the AI shall ground the wording in the same metrics/records it cites in its `grounding` block; AI-generated wording must follow the same simulated-data labelling, low-confidence rules, and the 1h/day baseline from FR-AI-007..010 and BR002. | P2 | System |

### 4.7 Authentication and User Context

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-AUTH-001** | Simplified login | The system shall provide a simplified authentication flow (mock login, role selector, or seeded users) sufficient to identify a user and their role. | P0 | All |
| **FR-AUTH-002** | Session context | Authenticated requests shall carry a userId and role used by all booking, dashboard, and reporting actions. | P0 | System |
| **FR-AUTH-003** | Role-based UI | The UI shall show or hide admin/security/workplace capabilities based on the authenticated role. | P0 | System |
| **FR-AUTH-004** | Role-based API authorization | The backend shall reject role-restricted actions (override, release of others' bookings, charger status writes, eligible-user CRUD, audit log access, report-only views) for unauthorised roles (HTTP 403). | P0 | System |
| **FR-AUTH-005** | Logout | The user can end their session and return to login. | P1 | All |
| **FR-AUTH-006** | Eligibility & privacy gate on protected actions | The backend shall reject booking creation (and shall NOT issue a CSMS `POST /api/auth/tags` authorization call) when the authenticated user is not on the eligible-EV-user registry OR has not acknowledged the current privacy notice (HTTP 403 with a machine-readable reason code). | P0 | System |

### 4.8 Privacy Acknowledgement

Brief reference: Section 10.11, BR013.

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-PRIV-001** | Privacy notice retrieval | The system shall expose the current privacy notice content (text, version, effective date) via an API and render it in the UI. | P0 | All |
| **FR-PRIV-002** | Required content of privacy notice | The privacy notice shall explain: (a) what personal data is stored (identity, EID, badge, parking slot, vehicle make/model, booking, charging session, energy consumption data retrieved from the provided CSMS); (b) why it is stored (charging access, operational tracking, reporting, governance, sustainability); (c) who can access it (Security, Workplace, Admin, Reporting/ESG Viewer roles per RBAC); (d) how booking, vehicle, badge, parking slot, and charging data are used. | P0 | All |
| **FR-PRIV-003** | Acknowledgement before first booking | A Standard User MUST acknowledge the current privacy notice version before their first booking can be created. If unacknowledged, the booking creation endpoint returns HTTP 403 with reason `PrivacyNotAcknowledged`. | P0 | Standard User |
| **FR-PRIV-004** | Persist acknowledgement status and timestamp | The system shall persist per-user the privacy notice version acknowledged, the acknowledgement timestamp, and the userId. | P0 | System |
| **FR-PRIV-005** | Re-acknowledgement on version change | If the privacy notice version changes, all users MUST re-acknowledge before their next booking. The previous acknowledgement record is retained for audit. | P1 | Standard User, System |

### 4.9 Audit Log

Brief reference: Section 16 (Audit Log as a domain concept), Section 20 (Auditability NFR).

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-AUDIT-001** | Record critical actions | The system shall persist an audit log entry for each of the following actions: admin/security/workplace override or manual release; admin booking on behalf of a user; maintenance block create/remove (including the CSMS `PUT/DELETE /api/stations/:id/connectors/:n/block` outcome); charger status change by an admin/security/workplace user; eligible-EV-user create/update/delete; privacy acknowledgement creation and re-acknowledgement; CSMS authorization outcomes (`Authorized`, `AuthorizationFailed`, `Revoked` from `POST/DELETE /api/auth/tags`); CSMS-driven booking state changes (e.g., NoShow auto-release, charger Faulted releases observed via the CSMS). | P0 | System |
| **FR-AUDIT-002** | Audit entry shape | Each audit log entry shall include: id, timestamp, actorUserId (or `system`), actorRole, action, entityType, entityId, beforeState, afterState, reason (where applicable), and source (`user`, `admin`, `system`, `csms`). | P0 | System |
| **FR-AUDIT-003** | Audit log read access | Admin can view the full audit log. Security and Workplace can view audit entries scoped to operational actions (bookings, sessions, charger status, maintenance blocks, CSMS authorization outcomes). Standard Users cannot access the audit log. | P0 | Security, Workplace, Admin |
| **FR-AUDIT-004** | Immutability | Audit log entries shall not be editable or deletable by any role through the application. | P0 | System |
| **FR-AUDIT-005** | Audit log filtering | The audit log view shall support filtering by date range, actor, action type, and entity type. | P1 | Security, Workplace, Admin |

### 4.10 Admin Operations — Maintenance Blocks

Brief reference: Section 10.10.

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-ADMIN-001** | Create maintenance block | Admin can create a maintenance block for a specified charger, with start time, end time (optional / open-ended), and reason. While the block is active, the charger status is `Blocked for Maintenance` and bookings are rejected. | P1 | Admin |
| **FR-ADMIN-002** | Remove maintenance block | Admin can remove an active maintenance block, returning the charger to `Available` (subject to other concurrent state events). | P1 | Admin |
| **FR-ADMIN-003** | Maintenance block conflict handling | Creating a maintenance block whose window overlaps a Confirmed or Active booking shall require an explicit admin override that releases the affected booking (with reason) and notifies the affected user. | P1 | Admin |

### 4.11 Eligible EV User Management

Brief reference: Section 10.5, BR006.

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-USER-001** | Eligible EV user registry | The system shall maintain a registry of eligible EV users with the following fields: userId, displayName, workplaceRegistryEid (EID), badgeId, eligibilityStatus (Active / Inactive / Suspended), vehicleMake, vehicleModel, role, siteContext (NEX-TOWER / NEXTERACOM / both), privacyAcknowledgementStatus, lastUpdatedTimestamp. | P0 | System |
| **FR-USER-002** | Eligibility gate on booking | Booking creation (and any downstream CSMS authorization call via `POST /api/auth/tags`) shall be rejected (HTTP 403 with reason `NotEligible`) when the user's eligibilityStatus is not `Active`. | P0 | System |
| **FR-USER-003** | Admin CRUD on eligible EV users | Admin can create, view, update, suspend/re-activate, and delete eligible EV user records. Each change is audit-logged (FR-AUDIT-001). | P1 | Admin |
| **FR-USER-004** | Read-only access for operational roles | Security and Workplace can view (but not modify) the eligible EV user registry to support operational triage. | P1 | Security, Workplace |
| **FR-USER-005** | Self-view of own eligibility | A Standard User can view their own eligible-EV-user record (eligibility status, EID, badge, vehicle make/model, privacy acknowledgement status). | P1 | Standard User |
| **FR-USER-006** | Editable vehicle make/model | A Standard User can update their own vehicle make/model on their own eligible-EV-user record; admin role is not required for this self-service edit. The edit is audit-logged. | P1 | Standard User |

---

## 5. Business Rules

1. **BR-001** A booking's duration MUST be > 0 and ≤ 60 minutes for non-admin users (BR002 alignment).
2. **BR-002** Two Pending/Confirmed/Active bookings on the same charger MUST NOT overlap in time (closed-open interval `[start, end)`).
3. **BR-003** A user MUST NOT hold more than one Pending, Confirmed, or Active booking at any time, AND the user's total Confirmed/Active booking duration on the same calendar day MUST NOT exceed 60 minutes.
4. **BR-004** A booking can only be created against a charger whose current status is `Available` or that is `Reserved`/`Charging` for a non-overlapping later slot. A charger in `Blocked for Maintenance`, `Unavailable`, or `Faulted` cannot accept new bookings.
5. **BR-005** Charger status transitions follow this lifecycle: `Available → Reserved → Charging → Available`. Side transitions to `Faulted`, `Unavailable`, or `Blocked for Maintenance` are allowed from any state and are sourced from the CSMS (`GET /api/stations`); recovery back to `Available` requires admin action and/or the CSMS reporting the connector as available again.
6. **BR-006** A no-show grace period of **15 minutes** (configurable) applies after booking start. After the grace period with no active charging session reported by the CSMS (`GET /api/sessions/active`) for the booking's idTag, the booking moves to `NoShow`, the charging session (if instantiated) moves to `Expired`, the CSMS authorization is revoked via `DELETE /api/auth/tags/:idTag`, and the charger returns to `Available`.
7. **BR-007** Admin/Security/Workplace override of the 1h cap or another user's booking REQUIRES a non-empty reason and creates an audit-log entry.
8. **BR-008** CO₂ savings are estimated using a fixed emission factor of **0.85 kgCO₂/kWh** (provisional — see Open Questions) and the value used MUST be visible alongside the metric.
9. **BR-009** Any data retrieved from the provided CSMS that is sourced from the simulator (sessions, meter values, station/connector status) is considered simulated. Local ChargingSession records carry `source = "CSMS-Simulator"` for such data. Any metric or AI insight derived from at least one simulator-sourced record MUST be visibly labelled "Based on simulated demo data".
10. **BR-010** A user cannot cancel a booking that is already `Active`; they must use **Release** instead.
11. **BR-011** A user cannot release a booking that is not `Active` (or `Confirmed`, if release-before-start is enabled — provisional, see Open Questions).
12. **BR-012** A ChargingSession is uniquely linked to one Booking, one Charger, one Connector, and one User. The custom backend creates/updates the local ChargingSession only from CSMS data (`GET /api/sessions/active` and `GET /api/sessions/:id`) and only when the booking has `csmsSyncStatus = Authorized`. Sessions returned by the CSMS that cannot be mapped to a Confirmed/Active booking are flagged for operational review (unless they originate from an admin override path).
13. **BR-013** Booking start time MUST be in the future or current (within a small tolerance, e.g., 1 minute) at the moment of submission.
14. **BR-014** All booking state changes (Pending, Confirmed, Active, Completed, Cancelled, Released, NoShow, Overridden) and all charging session state changes (NotStarted, Authenticating, Charging, Completed, StoppedByUser, StoppedByAdmin, Faulted, Expired) MUST be persisted and timestamped.
15. **BR-015** When a charger transitions to `Faulted` during an Active session, the session moves to `Faulted`, the booking moves to `Released` (or `Overridden`), and the user is notified.
16. **BR-016** A booking can be created **only for today** in the MVP (provisional — see Open Questions). Same-day forward booking only.
17. **BR-017** Fair-use enforcement (BR-001, BR-002, BR-003) is enforced server-side and cannot be bypassed by client manipulation.
18. **BR-018** In-app reminders are mandatory for the MVP. Email and Microsoft Teams Adaptive Card channels are recommended; if live delivery is not feasible at demo time, the system MUST still generate and persist a realistic payload viewable in the notification audit/history so the multi-channel design is demonstrable.
19. **BR-019** A single trigger event produces exactly one logical notification record. That record may fan out to multiple channels (in-app, email, Teams) but the message intent and timing MUST be consistent across channels.
20. **BR-020** Notification delivery status MUST be persisted per channel as one of: `Sent` (real delivery acknowledged), `Previewed` (payload generated, no live delivery), or `Failed` (delivery attempted and failed). The notification audit/history reflects this status.
21. **BR-021** Admin/security/workplace intervention alerts (FR-REM-010) are triggered by: repeated no-shows by the same user (default threshold ≥ 2 NoShow bookings within 7 days), late release (session active beyond booking end + grace), or any charger transitioning to `Faulted` during an Active session. Thresholds are configurable.
22. **BR-022** Notifications generated for a booking/session MUST link back to the originating bookingId/sessionId/chargerId for traceability, and MUST be retained at least for the duration of the demo session (see Q15).
23. **BR-023** A Standard User MUST acknowledge the current privacy notice version before any booking can be created on their behalf or by them (BR013, FR-PRIV-003). The acknowledgement status, version, and timestamp MUST be persisted.
24. **BR-024** When the privacy notice version changes, prior acknowledgements remain stored for audit but the user MUST re-acknowledge before their next booking (FR-PRIV-005).
25. **BR-025** Only users on the eligible-EV-user registry with `eligibilityStatus = Active` may create bookings or initiate a charging session via Authorize (BR006).
26. **BR-026** Only Admin can modify the eligible-EV-user registry. Security and Workplace have read-only access. A Standard User may only update their own vehicle make/model on their own record.
27. **BR-027** When a booking is confirmed, the backend MUST call `POST /api/auth/tags` on the provided CSMS to create an RFID/idTag authorization window for the booking. The booking's `csmsSyncStatus` MUST reflect the outcome of this call (`Authorized` on 2xx; `AuthorizationFailed` on any non-2xx, timeout, or network error). A booking is considered fully operational only when `csmsSyncStatus = Authorized`.
28. **BR-028** When a booking is cancelled, released, or overridden (by the user, by the system on no-show, or by admin/security/workplace), the backend MUST call `DELETE /api/auth/tags/:idTag` on the provided CSMS to revoke the authorization window. The booking's `csmsSyncStatus` MUST be set to `Revoked` on successful revocation; revocation failures MUST be surfaced and audit-logged.
29. **BR-029** When a booking's `csmsSyncStatus` is `AuthorizationFailed`, the system MUST surface this state to the user and to admin/security/workplace via the notification audit/history and an intervention alert, and the booking MUST NOT be counted as Available/Reserved capacity (dashboard, reporting, and AI insights) until it is either successfully re-authorized with the CSMS or cancelled.

---

## 6. Validation Rules

| Entity | Field | Rule | Error condition | Client | Server |
|---|---|---|---|---|---|
| Booking | startTime | Required, ISO 8601 | Missing or invalid format | Yes | Yes |
| Booking | endTime | Required, ISO 8601, > startTime | Missing, invalid, or ≤ startTime | Yes | Yes |
| Booking | duration | `endTime − startTime ≤ 60 minutes` (BR002) | Duration > 1h for non-admin | Yes | Yes |
| Booking | dailyCumulative | Sum of Confirmed/Active durations for the user on the same calendar day ≤ 60 minutes | Daily cumulative > 1h | No | Yes |
| Booking | startTime | ≥ now − 1 minute | Booking start in the past | Yes | Yes |
| Booking | startTime | Same calendar day as now (MVP) | Future-day booking attempted | Yes | Yes |
| Booking | chargerId | Required, exists in registry | Missing/unknown charger | No | Yes |
| Booking | chargerId | Charger status `Available` for window (not `Blocked for Maintenance`, `Unavailable`, `Faulted`) | Charger not available / overlap | No | Yes |
| Booking | userId | No existing Pending/Confirmed/Active booking by user | User already has active booking | No | Yes |
| Booking | userId | User is on eligible-EV-user registry with eligibilityStatus=Active | Not eligible | No | Yes |
| Booking | userId | User has acknowledged current privacy notice version | Privacy not acknowledged | No | Yes |
| Booking | vehicleMake / vehicleModel | Required (defaulted from eligible-EV-user record if present); non-empty string | Missing on booking | Yes | Yes |
| Booking | reasonForOverride | Required when role=admin/security/workplace and rule bypass invoked | Empty reason on override | Yes | Yes |
| Charger | chargerId | Required, unique | Duplicate or missing | No | Yes |
| Charger | locationId | Required, one of `NEX-TOWER`, `NEXTERACOM` | Unknown location | No | Yes |
| Charger | status | One of enum (Available, Reserved, Charging, Blocked for Maintenance, Unavailable, Faulted) | Invalid value | No | Yes |
| Booking | csmsSyncStatus | One of `AuthorizationPending`, `Authorized`, `AuthorizationFailed`, `Revoked` | Invalid value | No | Yes |
| Booking | csmsIdTag | Required when csmsSyncStatus ≠ `AuthorizationPending`; non-empty string matching the idTag format expected by the CSMS | Missing / invalid format | No | Yes |
| CSMS call (POST /api/auth/tags) | stationId | Required, matches a known station in the local charger registry / CSMS station list | Missing or unknown station | No | Yes |
| CSMS call (POST /api/auth/tags) | connectorId | Required (when provided by booking), matches a known connector for the station | Missing or unknown connector | No | Yes |
| CSMS call (POST /api/auth/tags) | idTag, validFrom, validUntil | All three required; validUntil > validFrom; window aligned to booking window | Missing/invalid window | No | Yes |
| CSMS response | HTTP status | 2xx → sync status `Authorized`; non-2xx, timeout, or network error → sync status `AuthorizationFailed` | Non-2xx without failure handling | No | Yes |
| CSMS call (DELETE /api/auth/tags/:idTag) | idTag | Required, matches the booking's csmsIdTag | Missing or mismatched | No | Yes |
| ChargingSession | energyKWh | ≥ 0; value retrieved from CSMS via `GET /api/sessions/:id` | Negative or non-numeric | No | Yes |
| ChargingSession | source | Recorded as `CSMS` (or `CSMS-Simulator` for simulator-backed sessions) | Missing | No | Yes |
| EligibleEVUser | userId | Required, unique | Missing / duplicate | No | Yes |
| EligibleEVUser | workplaceRegistryEid | Required, unique | Missing / duplicate | No | Yes |
| EligibleEVUser | badgeId | Required, unique | Missing / duplicate | No | Yes |
| EligibleEVUser | eligibilityStatus | One of Active, Inactive, Suspended | Invalid value | No | Yes |
| EligibleEVUser | siteContext | One of NEX-TOWER, NEXTERACOM, BOTH | Invalid value | No | Yes |
| PrivacyAcknowledgement | userId | Required, exists | Missing / unknown | No | Yes |
| PrivacyAcknowledgement | privacyNoticeVersion | Required, matches current published version (for new acknowledgements) | Missing / outdated | No | Yes |
| PrivacyAcknowledgement | acknowledgedAt | Required, ISO 8601 | Missing / invalid | No | Yes |
| User | userId | Required, exists | Missing or unknown | No | Yes |
| User | role | One of Standard User, Security, Workplace, Admin, Reporting/ESG Viewer, Management | Invalid role | No | Yes |
| Notification | triggerEvent | One of: BookingConfirmation, SessionStartingSoon, BookingGracePeriodWarning, ChargingSessionEndingSoon, ChargingSessionEnded, MoveVehiclePrompt, SlotReleasePrompt, AutoReleaseNoShow, AdminSecurityWorkplaceInterventionAlert | Unknown trigger | No | Yes |
| Notification | channel | One of: InApp, Email, Teams | Invalid channel | No | Yes |
| Notification | deliveryStatus | One of: Sent, Previewed, Failed | Invalid status | No | Yes |
| Notification | audienceUserId | Required, exists | Missing or unknown | No | Yes |
| Notification | linkedBookingId / sessionId / chargerId | At least one MUST be present | All three null | No | Yes |
| Notification | payload (email) | When channel=Email: subject and body non-empty | Missing subject or body | No | Yes |
| Notification | payload (Teams) | When channel=Teams: valid Adaptive Card JSON (parseable, schema-conformant) | Invalid Adaptive Card JSON | No | Yes |
| Notification | timestamp | Required, ISO 8601 | Missing/invalid | No | Yes |
| Notification | readState (in-app only) | Boolean; defaults to false | Invalid type | Yes | Yes |
| AuditLog | actorUserId or `system` | Required | Missing | No | Yes |
| AuditLog | action | Required, non-empty enum | Missing / unknown | No | Yes |
| AuditLog | entityType / entityId | Required | Missing | No | Yes |

---

## 7. Notifications and Reminders

The table below lists every reminder template required by the MVP, traced to brief Sections 10.6 and 19. The MVP requires in-app delivery; email and Microsoft Teams Adaptive Card delivery are recommended, with payload preview/generation as a fallback (see BR-018, FR-REM-011, FR-REM-012, FR-REM-019). Severity drives UI styling (Info / Warning / Critical). Action buttons map to the Adaptive Card actions in FR-REM-013 where applicable. Persistence "Yes" means the notification is retained in the notification center / audit history (FR-REM-014, FR-REM-016).

| Trigger | Audience | Channels | Timing | Severity | Action Buttons | Persistence | Message Intent |
|---|---|---|---|---|---|---|---|
| Booking confirmation (FR-REM-008) | Booking owner | In-app + Email + Teams | Immediately on successful booking creation | Info | View booking, Confirm session started | Yes | "Your booking on {charger} at {location} is confirmed for {startTime}–{endTime} ({vehicleMake} {vehicleModel})." |
| Pre-session reminder (Session starting soon) | Booking owner | In-app + Email + Teams | 10 min before booking startTime | Info | View booking | Yes | "Your charging slot at {charger} starts in 10 minutes." |
| Booking grace period warning (FR-REM-009) | Booking owner | In-app + Email + Teams | booking.startTime + 5 min, if no active session reported by CSMS for the booking's idTag | Warning | View booking, Confirm session started | Yes | "Your booking on {charger} starts soon and charging has not begun. The slot will be auto-released in {N} minutes." |
| Session-ending reminder (Charging session ending soon) | Booking owner | In-app + Email + Teams | 10 min before booking endTime | Warning | View booking, Release slot | Yes | "Your charging session ends in 10 minutes. Please prepare to release the charger." |
| Session-ended alert (Charging session ended) | Booking owner | In-app + Email + Teams | When CSMS `GET /api/sessions/:id` reports the session as completed | Info | View booking, Acknowledge end-of-session reminder | Yes | "Your charging session has ended. {energyKWh} kWh delivered." |
| Move vehicle prompt | Booking owner | In-app + Email + Teams | On session Completed, after end-of-session alert | Warning | Acknowledge | Yes | "Your charging session is complete. Please move your vehicle to free the slot." |
| Release prompt (Slot release prompt) | Booking owner | In-app + Email + Teams | If session ends but booking still Active | Warning | Release slot | Yes | "Charging complete. Please release the charger for the next user." |
| Auto-release on no-show (Auto-release/no-show notification) | Booking owner | In-app + Email + Teams | At booking.startTime + 15 min if no active session reported by CSMS for the booking's idTag | Warning | View booking | Yes | "Your booking on {charger} was released because charging did not start in time." |
| Admin manual release confirmation | Affected user + acting admin/security/workplace | In-app + Email + Teams | Immediately on admin/security/workplace release/override action | Warning | View booking | Yes | "An operator released your booking on {charger}. Reason: {reason}." |
| Charger fault during session | Booking owner | In-app + Email + Teams | When CSMS reports the connector as Faulted (via `GET /api/stations` or session detail) during an Active session | Critical | View booking | Yes | "Your charger reported a fault. Session stopped. Please contact security." |
| Admin/security/workplace intervention alert — repeated no-shows (FR-REM-010) | Security, Workplace, Admin | In-app + Email + Teams | When a user accumulates ≥ 2 NoShow bookings in 7 days | Warning | View booking | Yes | "User {userId} has {N} no-shows in the last 7 days. Consider operational review." |
| Admin/security/workplace intervention alert — late release (FR-REM-010) | Security, Workplace, Admin | In-app + Email + Teams | When a session continues past booking endTime + grace | Warning | Release slot | Yes | "Charger {charger} session is past its booking window. Manual release may be needed." |
| Admin/security/workplace intervention alert — charger faulted (FR-REM-010) | Security, Workplace, Admin | In-app + Email + Teams | When CSMS reports the connector as Faulted during an active session | Critical | View booking | Yes | "Charger {charger} reported a fault during an active session. Operational intervention required." |

---

## 8. Reporting Needs

| Metric | Definition | Data Source | Aggregation | Filter Dimensions | Audience |
|---|---|---|---|---|---|
| Total charging sessions | Count of ChargingSession in date range | session | count | location, charger, date range | Admin, Reporting/ESG, Mgmt |
| Total energy consumed (kWh) | Sum of session.energyKWh | session (sourced from CSMS `GET /api/sessions/:id`) | sum | location, charger, date range | Admin, Reporting/ESG |
| Average session duration | avg(stopTs − startTs) per completed session | session | avg | location, charger, date range | Admin |
| Average energy per session | avg(energyKWh) per completed session | session | avg | location, charger, date range | Admin, Reporting/ESG |
| Charger utilization rate | (time in Reserved+Charging) / operating window | charger state timeline (derived from CSMS station/connector status snapshots) | % | location, charger, date range | Admin |
| Peak charging hours | Distribution of session start times by hour-of-day | session (CSMS `GET /api/sessions`) | count by bucket | location, date range | Admin |
| Most-used chargers | Ranked list by session count | session | count grouped by charger | location, date range | Admin |
| Location comparison | Same metrics split by NEX Tower vs NEXTERACOM | derived | grouped | date range | Admin, Reporting/ESG, Mgmt |
| Estimated CO₂ savings (kg) | `total kWh × 0.85 kgCO₂/kWh` (provisional) | derived | sum | location, date range | Reporting/ESG, Mgmt |
| Failed bookings | Count of booking attempts rejected by validation | booking-attempt log | count | location, date range | Admin |
| Cancelled bookings | Count of bookings in Cancelled state | booking | count | location, date range | Admin |
| Released bookings | Count in Released state | booking | count | location, date range | Admin |
| No-show bookings | Count in NoShow state | booking | count | location, date range | Admin |
| Faulted / Unavailable charger events | Count of connector transitions to Faulted/Unavailable observed via CSMS `GET /api/stations` polling | charger state timeline (from CSMS) | count | location, charger, date range | Admin |
| Maintenance blocks | Count and total duration of Blocked for Maintenance windows | charger state timeline | count + duration | location, charger, date range | Admin |
| Usage by vehicle category | Sessions and kWh aggregated by vehicleMake/vehicleModel (≥ 3 users per group) | session | grouped sum/count | location, date range | Admin, Reporting/ESG |
| Notifications generated by channel | Count of notifications grouped by channel (InApp/Email/Teams) | notification audit | count | channel, trigger, date range | Admin, Workplace |
| Notification delivery status mix | Count of notifications grouped by deliveryStatus (Sent/Previewed/Failed) | notification audit | count | channel, date range | Admin, Workplace |
| Notification acknowledgment rate | % of in-app notifications marked read by audience | notification audit + readState | % | trigger, date range | Admin, Workplace |
| No-show rate after reminders | NoShow bookings / total bookings, segmented by whether pre-session reminder was generated | booking + notification audit | % | location, date range | Admin, Workplace |
| Admin/security/workplace intervention alerts triggered | Count of intervention alerts by sub-type (repeated no-shows / late release / charger fault) | notification audit | count by sub-type | date range | Security, Workplace, Admin |
| CSMS authorization outcomes | Count of `POST /api/auth/tags` calls grouped by outcome (`Authorized`, `AuthorizationFailed`, `Revoked`) | booking.csmsSyncStatus history | count | charger, date range | Admin, Security |

**CO₂ formula (stub):** `estimatedCO2SavingsKg = sum(energyKWh) * EMISSION_FACTOR_KG_PER_KWH` where `EMISSION_FACTOR_KG_PER_KWH = 0.85` (provisional, configurable).

---

## 9. AI-Related Functional Requirements

Each AI capability MUST satisfy: input source = system data; output explicit; grounded in metrics; labelled when based on simulated data; declares low confidence when data thin; no fabrication. AI recommendations that reference fair-use rules MUST cite the **1h/day** baseline (BR002).

### FR-AI-001 — Demand Forecasting
- **Purpose:** Predict likely peak charging windows for the next 24h to inform fair-use adjustments.
- **Input sources:** Booking history, local ChargingSession history (populated from CSMS), CSMS station/connector status timeline.
- **Output shape:** Ranked list of hour-of-day buckets with relative demand score and a short text summary.
- **Grounding rules:** Must cite the time range and number of sessions used; must label "Based on simulated demo data" if any simulator-sourced data is in the range.
- **Acceptance behavior:** If fewer than 10 sessions in the input window, return a "limited confidence" message and no point forecast.

### FR-AI-002 — Pattern Detection
- **Purpose:** Detect underused chargers, repeated late releases, high-demand windows.
- **Input sources:** Booking, Session, Telemetry.
- **Output shape:** List of pattern findings, each with: pattern type, affected entity (chargerId/userId), supporting count/duration, severity.
- **Grounding rules:** Each finding must point to ≥1 underlying record.
- **Acceptance behavior:** If no pattern crosses a configurable threshold, return "no significant patterns detected".

### FR-AI-003 — Intelligent Reporting (NL summary)
- **Purpose:** Produce a daily NL summary for facilities/ESG/management.
- **Input sources:** Reporting metrics endpoints.
- **Output shape:** Short paragraph (≤120 words) referencing total sessions, total kWh, top charger, peak hour, CO₂ estimate.
- **Grounding rules:** Every numeric in the summary must match the reporting endpoint output. Label simulated data.
- **Acceptance behavior:** If reporting endpoints return zero data, output "No charging activity recorded in the selected period."

### FR-AI-004 — Operational Recommendations
- **Purpose:** Suggest fair-use adjustments grounded in the 1h/day baseline.
- **Input sources:** Utilization, peak hour, no-show data.
- **Output shape:** Ranked list of recommendations with rationale and the metric that triggered them.
- **Grounding rules:** Each recommendation must cite the metric and threshold and must not propose changes that weaken the 1h/day baseline without explicit admin authorisation.
- **Acceptance behavior:** No recommendations if no metric exceeds threshold.

### FR-AI-005 — Anomaly Flagging
- **Purpose:** Flag unexpected energy spikes, unusually long sessions, repeated no-shows.
- **Input sources:** Local ChargingSession (meter values and energyKWh sourced from CSMS), Booking.
- **Output shape:** List of anomaly entries: entityId, anomaly type, observed value, expected range, reason.
- **Grounding rules:** Each anomaly must include the underlying datapoint.
- **Acceptance behavior:** Empty list when nothing exceeds threshold.

### FR-AI-006 — Natural-Language Insight Generation
- **Purpose:** Management-friendly explanation of trends.
- **Input sources:** Reporting metrics + pattern detection output.
- **Output shape:** Short text + a linked list of underlying metrics.
- **Grounding rules:** No metric in the text may be absent from the linked list.
- **Acceptance behavior:** Insight ends with a confidence indicator (High/Medium/Low) based on session count and data source mix.

### Responsible-AI Guardrails (cross-cutting)
- **FR-AI-007** AI responses MUST include a `grounding` block listing the source metric IDs or record IDs used.
- **FR-AI-008** AI responses derived from simulator-sourced data MUST include a visible "Based on simulated demo data" label.
- **FR-AI-009** AI responses MUST include a `confidence` field; when data is insufficient (configurable threshold, default <10 sessions), confidence is "Low" and no point predictions are returned.
- **FR-AI-010** AI MUST NOT output any numeric metric not present in the grounding block.
- **FR-AI-011** AI-assisted notification phrasing MUST also follow FR-AI-007..010 and MUST cite the 1h/day baseline when phrasing fair-use recommendations.

---

## 10. Acceptance Criteria per Feature

All acceptance criteria below are testable by QA without further clarification. Format: Given / When / Then.

### 4.1 Slot Booking — Acceptance Criteria

1. **AC-BOOK-01 (happy path)**
   Given I am authenticated as a Standard User on the eligible-EV-user registry, I have acknowledged the current privacy notice, and charger `NEX-TOWER-CH-01` is Available,
   When I submit a booking with startTime = now+5min, endTime = now+65min (60-minute slot) with my vehicle make/model,
   Then the booking is created with state `Confirmed`, the charger transitions to `Reserved`, vehicle make/model is persisted on the booking, and I see a confirmation.

2. **AC-BOOK-02 (overlap conflict)**
   Given a Confirmed booking exists on `NEX-TOWER-CH-01` from 09:00 to 09:45,
   When another Standard User submits a booking on the same charger from 09:30 to 10:00,
   Then the request is rejected with HTTP 409 and an error: "Time slot overlaps an existing booking."

3. **AC-BOOK-03 (1h cap — per booking)**
   Given I am authenticated as a Standard User,
   When I submit a booking with duration of 61 minutes,
   Then the request is rejected with HTTP 400 and an error: "Maximum booking duration is 1 hour per day."

4. **AC-BOOK-04 (one active booking)**
   Given I already have a Confirmed booking,
   When I attempt to create another Confirmed booking on any charger,
   Then the request is rejected with HTTP 409 and an error: "You already have an active booking."

5. **AC-BOOK-04b (1h cap — daily cumulative)**
   Given I already have a Completed booking of 40 minutes earlier today,
   When I attempt to create a new 30-minute booking later today,
   Then the request is rejected with HTTP 400 and an error: "Daily charging limit (1 hour) exceeded."

6. **AC-BOOK-05 (cancel)**
   Given I have a Confirmed booking that has not yet started,
   When I cancel it,
   Then the booking state becomes `Cancelled` and the charger returns to `Available`.

7. **AC-BOOK-06 (release active)**
   Given my booking is `Active` and a session is `Charging`,
   When I release the booking,
   Then the session is stopped (StoppedByUser), the booking moves to `Released`, and the charger becomes `Available`.

8. **AC-BOOK-07 (admin override 1h)**
   Given I am Security/Workplace/Admin and provide a non-empty reason,
   When I create a 90-minute booking,
   Then the booking is accepted, marked Overridden, and the audit log records the reason and acting user.

9. **AC-BOOK-08 (admin override without reason)**
   Given I am Security/Workplace/Admin,
   When I attempt a 1h-cap override with empty reason,
   Then the request is rejected with HTTP 400 and an error: "Reason is required for override."

10. **AC-BOOK-09 (vehicle make/model captured)**
    Given my eligible-EV-user record has vehicle make "Tesla", model "Model 3",
    When I create a booking,
    Then the booking and resulting charging session both contain vehicleMake="Tesla" and vehicleModel="Model 3".

### 4.2 Real-Time Availability Dashboard — Acceptance Criteria

1. **AC-DASH-01** Given the dashboard is open, When I load it, Then I see every registered charger with its current status colour-coded and labelled (Available, Reserved, Charging, Blocked for Maintenance, Unavailable, Faulted).
2. **AC-DASH-02** Given the CSMS reports `NEX-TOWER-CH-01` connector as `Charging` (via `GET /api/stations` and `GET /api/sessions/active`), When the dashboard refresh interval elapses (≤5s), Then the charger card updates to `Charging` without a manual reload.
3. **AC-DASH-03** Given I filter by NEXTERACOM, When the filter is applied, Then only NEXTERACOM chargers are shown.
4. **AC-DASH-04** Given I view the dashboard on a 360px-wide mobile viewport, When I scroll vertically, Then all charger cards are readable with no horizontal scroll.
5. **AC-DASH-05** Given I am a Standard User, When I view a `Charging` charger, Then the user identity and vehicle fields are masked or hidden.
6. **AC-DASH-06** Given I am Security/Workplace/Admin, When I mark `NEXTERACOM-CH-02` `Blocked for Maintenance` with reason "cable damaged", Then its status updates and the change is audit-logged.
7. **AC-DASH-07 (charger faulted mid-session — failure path)** Given a session is `Charging` and the CSMS reports the connector as `Faulted` (via `GET /api/stations` or session detail), When the backend syncs at the configured interval, Then the dashboard shows `Faulted`, the local session moves to `Faulted`, and the user receives a fault notification.

### 4.3 CSMS REST API Integration — Acceptance Criteria

1. **AC-OCPP-01 (booking → CSMS authorization)** Given a Standard User submits a valid booking that passes all fair-use and privacy checks, When the booking creation completes, Then the backend calls `POST /api/auth/tags` on the CSMS with the booking's idTag, station, and time window, and the booking `csmsSyncStatus` is set to `Authorized` on a 2xx response.
2. **AC-OCPP-02 (CSMS authorization failure)** Given the CSMS `POST /api/auth/tags` call returns a non-2xx response (or times out), When a booking is confirmed, Then `csmsSyncStatus = AuthorizationFailed`, the user sees an error message, the booking is not counted as Reserved capacity, and an admin/security/workplace intervention alert is raised.
3. **AC-OCPP-03 (cancellation → CSMS revocation)** Given a booking with `csmsSyncStatus = Authorized` is cancelled by the user, When cancellation completes, Then the backend calls `DELETE /api/auth/tags/:idTag` on the CSMS and `csmsSyncStatus = Revoked` on success, and an audit log entry records the revocation.
4. **AC-OCPP-04 (active session mapping)** Given the CSMS is available and at least one active session exists, When the backend polls `GET /api/sessions/active`, Then active sessions are mapped to local bookings by idTag/station, charger statuses on the dashboard reflect the CSMS connector status, and the mapping is refreshed within the configured poll interval.
5. **AC-OCPP-05 (session energy persistence)** Given a completed charging session exists in the CSMS, When the backend calls `GET /api/sessions/:id`, Then the session's `energyKWh`, start/stop timestamps, and final status are persisted on the local ChargingSession record and visible in the reporting dashboard.
6. **AC-OCPP-06 (station status sync)** Given `GET /api/stations` returns updated station and connector data, When the backend syncs at the configured interval, Then local charger status matches CSMS connector status within ≤5 seconds and the dashboard refreshes accordingly.
7. **AC-OCPP-07 (end-to-end CSMS-driven lifecycle)** Given a confirmed booking with `csmsSyncStatus = Authorized`, When the provided simulator runs the full scenario (authorization → session start → meter values → session stop), Then the application shows the charger transitioning `Reserved → Charging → (session energy updating) → Completed → Available`, all driven by CSMS REST API data with no custom OCPP handlers in the custom application.
8. **AC-OCPP-08 (maintenance block via CSMS)** Given Admin creates a maintenance block on `NEX-TOWER-CH-01` connector 1 with reason "firmware update", When the block is confirmed, Then the backend calls `PUT /api/stations/NEX-TOWER-CH-01/connectors/1/block` on the CSMS, the charger shows `Blocked for Maintenance` in the dashboard, and an audit log entry is created.
9. **AC-OCPP-09 (remove maintenance block via CSMS)** Given a maintenance block is active on `NEX-TOWER-CH-01` connector 1, When Admin removes it, Then the backend calls `DELETE /api/stations/NEX-TOWER-CH-01/connectors/1/block` on the CSMS, the charger returns to `Available` (subject to other concurrent state), and an audit log entry is created.
10. **AC-OCPP-10 (eligibility gate before CSMS call)** Given a user is not on the eligible-EV-user registry OR has not acknowledged the current privacy notice, When the user attempts to create a booking, Then the booking is rejected with HTTP 403 BEFORE any CSMS authorization call is made (no `POST /api/auth/tags` is issued).
11. **AC-OCPP-11 (active authorization reconciliation)** Given a booking's local `csmsSyncStatus = Authorized` but the CSMS no longer lists the idTag in `GET /api/auth/tags?active=true`, When the backend reconciliation runs, Then the discrepancy is recorded, an admin/security/workplace intervention alert is raised, and the booking is flagged for review.
12. **AC-OCPP-12 (privacy not acknowledged blocks CSMS call)** Given an eligible user has not acknowledged the current privacy notice version, When they attempt to create a booking, Then the request is rejected with HTTP 403 reason `PrivacyNotAcknowledged` and no `POST /api/auth/tags` call is issued to the CSMS.

### 4.4 Smart Reminders and Slot Release — Acceptance Criteria

1. **AC-REM-01** Given a Confirmed booking starts at 10:00, When the clock reaches 09:50, Then the booking owner sees an in-app pre-session reminder.
2. **AC-REM-02** Given a booking ends at 11:00, When the clock reaches 10:50, Then the owner sees an in-app session-ending reminder.
3. **AC-REM-03 (no-show)** Given a booking starts at 10:00 and the CSMS reports no active session for the booking's idTag, When clock reaches 10:15, Then the booking moves to `NoShow`, the CSMS authorization is revoked via `DELETE /api/auth/tags/:idTag`, the charger returns to `Available`, and the user receives a no-show notification.
4. **AC-REM-04** Given an admin/security/workplace user releases a user's booking with reason "operational", When released, Then the user sees an in-app notification with the reason.
5. **AC-REM-05** Given a session has `Completed` and the booking is still `Active`, When the system processes the stop event, Then the user receives a release prompt notification.
6. **AC-REM-06** Given I open the notifications list, When the page loads, Then I see all my notifications ordered by most recent first.
7. **AC-REM-07 (booking confirmation)** Given I create a booking that passes all validations, When the booking is created, Then I immediately see a "Booking confirmation" in-app notification AND the notification audit/history contains one email payload and one Teams Adaptive Card payload for the same trigger, each linked to my bookingId.
8. **AC-REM-08 (grace period warning)** Given my booking starts at 10:00 with grace period 15 min and the CSMS reports no active session for my idTag, When the clock reaches 10:05, Then I receive a "Booking grace period warning" in-app notification with severity Warning, and the message states the slot will be auto-released in 10 minutes.
9. **AC-REM-09 (intervention alert — repeated no-shows)** Given user U has accumulated 2 NoShow bookings within the past 7 days, When the second NoShow is recorded, Then Security, Workplace, and Admin users receive an "Admin/security/workplace intervention alert" in-app notification referencing user U and the no-show count.
10. **AC-REM-10 (intervention alert — charger fault)** Given a session is Charging on charger C, When the CSMS reports the connector as Faulted (via `GET /api/stations` or session detail) during the active session, Then Security, Workplace, and Admin users receive an intervention alert with severity Critical referencing charger C, in addition to the user-facing fault notification (AC-DASH-07).
11. **AC-REM-11 (email preview fallback)** Given the email channel is not configured for live delivery, When a notification trigger fires, Then a realistic email payload (recipient, subject, body) is generated and stored in the notification audit with deliveryStatus="Previewed", and is viewable from the admin notification audit/history view.
12. **AC-REM-12 (Teams Adaptive Card preview fallback)** Given the Teams channel is not configured for live delivery, When a notification trigger fires, Then a valid Adaptive Card JSON payload is generated and stored in the notification audit with deliveryStatus="Previewed", and the JSON parses against the Adaptive Card schema.
13. **AC-REM-13 (Adaptive Card actions)** Given a generated Adaptive Card for a "Session ending soon" reminder, When inspected, Then it contains the actions "View booking" and "Release slot", and each action's target URL deep-links to the corresponding page in the web application.
14. **AC-REM-14 (notification center)** Given I have 3 unread in-app notifications across booking confirmation, pre-session reminder, and session ended, When I open the notification center, Then I see all 3 notifications listed with channel indicator, timestamp, linked booking/session/charger, and an unread badge count of 3.
15. **AC-REM-15 (mark read)** Given I have an unread in-app notification, When I mark it read, Then its readState becomes true, the unread badge decrements by 1, and the change is persisted.
16. **AC-REM-16 (notification audit endpoint — admin)** Given I am Admin and 5 notifications were generated in the last hour across in-app, email, and Teams channels, When I call the notification audit/history endpoint, Then I receive 5 records each with triggerEvent, audienceUserId, channel, timing, payload reference, and deliveryStatus.
17. **AC-REM-17 (cross-channel consistency)** Given a "Session ending soon" trigger fires for my booking, When the resulting notification records are inspected across the in-app, email, and Teams channels, Then all three records share the same triggerEvent, the same audienceUserId, the same linked bookingId, and timing within ±2 seconds.
18. **AC-REM-18 (nine reminder templates exist)** Given the reminder template registry is queried, When listed, Then it returns exactly the nine templates from FR-REM-017 (Booking confirmation, Session starting soon, Booking grace period warning, Charging session ending soon, Charging session ended, Move vehicle prompt, Slot release prompt, Auto-release/no-show notification, Admin/security/workplace intervention alert).
19. **AC-REM-19 (Adaptive Card preview is retrievable)** Given a Teams Adaptive Card payload is persisted with deliveryStatus="Previewed", When an Admin opens the notification audit entry, Then the stored JSON can be rendered as a preview and exported (copied) without modification.

### 4.5 Reporting and Sustainability Dashboard — Acceptance Criteria

1. **AC-REP-01** Given 5 completed sessions totalling 32.5 kWh exist, When the reporting dashboard loads, Then "Total energy consumed" = 32.5 kWh and "Total sessions" = 5.
2. **AC-REP-02** Given total kWh = 32.5 and emission factor = 0.85, When the dashboard loads, Then "Estimated CO₂ savings" = 27.625 kg and the factor 0.85 is visible.
3. **AC-REP-03** Given some sessions are simulator-sourced, When the dashboard loads, Then a "Based on simulated demo data" label is visible on the affected widgets.
4. **AC-REP-04** Given I filter by NEX Tower for last 24h, When the filter applies, Then only NEX Tower data within 24h is shown.
5. **AC-REP-05** Given there are zero sessions in the selected window, When the dashboard loads, Then each metric shows `0` (or "No data") without errors.
6. **AC-REP-06** Given chargers reported `Faulted` events via the CSMS station status feed, When the reporting dashboard loads, Then the count of faulted events is displayed and matches the CSMS-sourced station/connector state timeline.
7. **AC-REP-07 (vehicle aggregation)** Given at least 3 distinct users have sessions on vehicleMake="Tesla", When I view "Usage by vehicle category", Then a row for "Tesla" appears with aggregated session count and kWh; groups with fewer than 3 users are hidden or rolled up under "Other".

### 4.6 Responsible AI Layer — Acceptance Criteria

1. **AC-AI-01 (grounding)** Given the AI insight panel loads with data available, When it renders, Then each numeric mentioned in the NL summary matches a value returned by a reporting endpoint.
2. **AC-AI-02 (simulated label)** Given underlying data has at least one event with source=Simulator, When AI output is rendered, Then a "Based on simulated demo data" label is visible.
3. **AC-AI-03 (low confidence)** Given fewer than 10 sessions exist in the input window, When AI forecasting is requested, Then the response has confidence="Low" and contains no point forecasts.
4. **AC-AI-04 (no fabrication)** Given the AI response is parsed, When numerics are extracted, Then every numeric is present in the response's `grounding` block.
5. **AC-AI-05 (anomaly flagging)** Given a session has energy ≥ 3× average, When AI runs, Then it returns an anomaly entry referencing that session ID.
6. **AC-AI-06 (no data)** Given there are zero sessions in the system, When AI summary is requested, Then it returns "No charging activity recorded in the selected period." and no fabricated numbers.
7. **AC-AI-07 (fair-use grounding)** Given the AI recommends a fair-use adjustment, When the recommendation is read, Then it explicitly cites the 1h/day BR002 baseline and does not propose weakening it without admin authorisation.

### 4.7 Authentication and User Context — Acceptance Criteria

1. **AC-AUTH-01** Given I select user "Alice (Standard User)" on the login screen, When I sign in, Then I land on the user dashboard and my role context is set to Standard User.
2. **AC-AUTH-02** Given I am authenticated as Standard User, When I call an admin-only endpoint (e.g., charger status change), Then the response is HTTP 403.
3. **AC-AUTH-03** Given I am unauthenticated, When I try to access the dashboard, Then I am redirected to the login screen.
4. **AC-AUTH-04** Given I am authenticated as Security, When I view the dashboard, Then operational actions (manual release, status change) are visible in the UI.
5. **AC-AUTH-05** Given I am authenticated as Workplace, When I view the dashboard, Then operational actions (manual release, book on behalf) are visible in the UI.
6. **AC-AUTH-06 (eligibility & privacy gate)** Given I am authenticated but not on the eligible-EV-user registry OR I have not acknowledged the privacy notice, When I attempt to create a booking, Then the request is rejected with HTTP 403 and a machine-readable reason (`NotEligible` or `PrivacyNotAcknowledged`).

### 4.8 Privacy Acknowledgement — Acceptance Criteria

1. **AC-PRIV-01 (notice content)** Given I open the privacy notice, When it renders, Then it explains what data is stored, why, who can access it, and how booking/vehicle/badge/parking-slot/charging data are used.
2. **AC-PRIV-02 (acknowledgement required before first booking)** Given I have never acknowledged the privacy notice, When I try to create my first booking, Then the request is rejected with HTTP 403 reason `PrivacyNotAcknowledged` and the UI prompts me to acknowledge.
3. **AC-PRIV-03 (persistence)** Given I accept the privacy notice version v1, When I retrieve my own profile, Then I see privacyAcknowledgementStatus=Acknowledged, version=v1, and a non-empty acknowledgement timestamp.
4. **AC-PRIV-04 (re-acknowledge on version change)** Given I acknowledged v1 and the published version is now v2, When I attempt to create a booking, Then the request is rejected with reason `PrivacyNotAcknowledged` until I acknowledge v2.

### 4.9 Audit Log — Acceptance Criteria

1. **AC-AUDIT-01 (override audit)** Given Admin performs a 1h-cap override with reason "VIP visit", When the booking is created, Then an audit log entry exists with action=`BookingOverride`, actorUserId=Admin, entityType=`Booking`, entityId=<new bookingId>, reason="VIP visit", and a timestamp.
2. **AC-AUDIT-02 (CSMS authorization decisions)** Given a `POST /api/auth/tags` call to the CSMS fails for a booking, When the audit log is queried, Then an entry exists with action=`CsmsAuthorizationFailed`, the CSMS HTTP status / error reason, and references to the bookingId, userId, idTag, and stationId.
3. **AC-AUDIT-03 (immutability)** Given an audit log entry exists, When any role attempts to delete or modify it via the application, Then the request is rejected with HTTP 403/405 and the entry remains intact.

### 4.10 Admin Operations — Maintenance Block — Acceptance Criteria

1. **AC-ADMIN-01 (create maintenance block)** Given charger `NEX-TOWER-CH-01` is Available and has no Confirmed bookings in the next hour, When Admin creates a maintenance block for the next 60 minutes with reason "firmware update", Then the charger status becomes `Blocked for Maintenance`, new bookings on the charger in that window are rejected, and an audit log entry is created.
2. **AC-ADMIN-02 (remove maintenance block)** Given a maintenance block is active on `NEX-TOWER-CH-01`, When Admin removes it, Then the charger returns to `Available` (subject to other concurrent state events) and an audit log entry is created.

### 4.11 Eligible EV User Management — Acceptance Criteria

1. **AC-USER-01 (eligibility gate)** Given user U is NOT on the eligible-EV-user registry, When U attempts to create a booking, Then the request is rejected with HTTP 403 reason `NotEligible`.
2. **AC-USER-02 (admin CRUD)** Given I am Admin, When I create a new eligible EV user with EID, badge, vehicle make/model, eligibilityStatus=Active, Then the record is persisted and an audit log entry is created (action=`EligibleUserCreated`).
3. **AC-USER-03 (security/workplace read-only)** Given I am Security or Workplace, When I attempt to modify an eligible EV user record, Then the request is rejected with HTTP 403.
4. **AC-USER-04 (self-edit vehicle)** Given I am a Standard User on the registry, When I update my own vehicle make/model on my own record, Then the record is updated, an audit log entry is created with action=`VehicleSelfUpdate`, and subsequent bookings default to the new vehicle make/model.

---

## 11. Booking and Session State Reference

Aligned with brief Section 17.

### Booking States

| State | Meaning |
|---|---|
| Pending | Booking requested but not yet confirmed (reserved for future approval flow; in MVP most bookings transition directly to Confirmed). |
| Confirmed | Booking is valid and reserved. |
| Active | Booking window is currently active (start time reached). |
| Completed | Booking/session completed successfully. |
| Cancelled | User/admin cancelled the booking before it became Active. |
| Released | Slot was released before or after use. |
| NoShow | User did not start within the grace period. |
| Overridden | Admin/security/workplace user manually changed or released the booking; reason captured. |

### Charging Session States

| State | Meaning |
|---|---|
| NotStarted | Session has not started yet (booking confirmed, waiting for Authorize/Start). |
| Authenticating | CSMS RFID/idTag authorization in progress (booking → `POST /api/auth/tags` issued, awaiting CSMS confirmation or session start). |
| Charging | Charging is currently in progress. |
| Completed | Charging ended normally (CSMS reports session as completed via `GET /api/sessions/:id`). |
| StoppedByUser | User stopped/released the session before normal end. |
| StoppedByAdmin | Security/Workplace/Admin stopped/released the session. |
| Faulted | Session ended or paused due to charger fault. |
| Expired | Booking/session expired due to no-show or grace-period breach. |

### Charger Statuses

| Status | Meaning |
|---|---|
| Available | Charger is free and can be booked or used. |
| Reserved | Charger has an upcoming or current reservation. |
| Charging | A charging transaction is currently active. |
| Blocked for Maintenance | Charger is intentionally blocked by Admin. (Legacy term: `Maintenance` — treated as equivalent.) |
| Unavailable | Charger is temporarily unavailable. |
| Faulted | Charger reported an error/fault state. |

---

## 12. End-to-End MVP Demo Journey

The full system MUST satisfy the following end-to-end scenario (aligned with brief Section 11):

1. Standard User opens the dashboard on a mobile-sized viewport and signs in.
2. User acknowledges the privacy notice (if not already acknowledged).
3. User sees charger availability across NEX Tower and NEXTERACOM, colour-coded by status.
4. User filters availability by site/time and selects an `Available` charger.
5. User books a time slot of up to 1 hour with vehicle make/model; the 1h/day fair-use rule is visible.
6. The system validates fair-use rules (no overlap, ≤1h, no other active booking, eligible user, privacy acknowledged) and confirms the booking.
7. The selected charger transitions to `Reserved`.
8. The booking confirmation triggers `POST /api/auth/tags` on the provided CSMS, creating an RFID/idTag authorization window for the booked slot. The booking's `csmsSyncStatus` becomes `Authorized`. The user receives a booking confirmation and pre-session reminder.
9. The provided simulator (driven by the CSMS) starts a charging session at the station using the authorized idTag. The CSMS reports the active session via `GET /api/sessions/active`; the backend maps it to the local booking.
10. The dashboard reflects the connector transition to `Charging` within ≤5 seconds, driven by `GET /api/stations` and `GET /api/sessions/active` polling.
11. The application polls the CSMS for meter values via `GET /api/sessions/:id` and updates the energy display (cumulative `energyKWh`) on the dashboard.
12. The user receives an in-app end-of-session reminder before the booking endTime.
13. The CSMS closes the session; `GET /api/sessions/:id` returns the completed session with final `energyKWh`. The local ChargingSession is updated to `Completed`. The user receives a session-ended alert and a move-vehicle prompt.
14. The connector status returned by `GET /api/stations` transitions back to `Available` and is reflected on the dashboard.
15. Admin views bookings, sessions, charger status, maintenance blocks, the audit log, and notification audit/history.
16. The reporting and sustainability dashboard updates with the new session's energy, utilization, CO₂ estimate, and notification metrics, with "Based on simulated demo data" visible.
17. The AI insight panel generates a grounded NL summary, forecast, or recommendation referencing the new data, with a confidence label and (where applicable) the 1h/day baseline cited.
18. Management/jury view the dashboards and AI insights demonstrating fairness, automation, operational visibility, sustainability reporting, privacy/RBAC, and responsible AI.

---

## 13. Assumptions

1. Standard Users authenticate before booking; auth is simplified (mock login or role selector with seeded users).
2. Charger registry and IDs are fixed and seeded at start (NEX-TOWER-CH-01..N, NEXTERACOM-CH-01..M).
3. One connector per charger for the MVP; no compatibility matching.
4. Charging infrastructure data (station status, sessions, meter values, energy) is sourced from the provided NexLevel CSMS REST API. The custom application does NOT implement any OCPP server, OCPP WebSocket handlers, or raw OCPP message ingestion. The CSMS owns the OCPP 1.6J protocol layer with simulator-backed charge points.
5. Meter values and energy consumption are retrieved from the CSMS via `GET /api/sessions/:id`. A pre-recorded fallback session scenario (seeded local data) is available for demo fallback if the live CSMS/simulator cannot be started.
6. No payment or billing integration.
7. CO₂ savings use a fixed coefficient — provisional value **0.85 kgCO₂/kWh** (configurable, displayed alongside the metric).
8. Real-time updates use either polling (e.g., every 3–5s) or SignalR/WebSocket — final choice by Solution Architect.
9. AI layer may use accumulated MVP data and/or generated demo data; insights derived from simulator data are labelled.
10. Mobile usage is expected and prioritised in employee-facing UI.
11. **Default grace period for no-show = 15 minutes** (configurable).
12. **Default pre-session reminder lead time = 10 minutes**; **session-ending reminder = 10 minutes before end** (configurable).
13. **Default session duration on booking screen = 60 minutes**; the user cannot exceed 60 minutes per day (BR002). Admin override may extend, with reason captured.
14. Bookings can only be created for today (same-day forward booking) in the MVP — to be confirmed.
15. Simulated user identity for demo: a seeded set of users covering all six roles (Standard User, Security, Workplace, Admin, Reporting/ESG Viewer, Management).
16. All datetimes are stored in UTC and displayed in the local timezone (Mauritius, UTC+4).
17. Booking attempts that fail validation are logged for reporting (failed booking count).
18. In-app notifications appear via a persistent **notification center** (list with read/unread state) and may additionally surface as a transient toast/snackbar for high-severity events. Final UI pattern to be agreed with the Frontend Developer.
19. The MVP must demonstrate the multi-channel notification design even if live email/Teams delivery is not available; this is achieved through realistic payload generation persisted in the notification audit/history (BR-018, FR-REM-011, FR-REM-012, FR-REM-019).
20. The nine reminder templates from brief Section 19 are implemented as a single registry shared across all three channels (in-app, email, Teams) — see FR-REM-017.
21. Default grace period warning lead time = **5 minutes after booking start** (10 minutes before auto-release with the 15-minute grace period). Configurable.
22. Default thresholds for admin/security/workplace intervention alerts: repeated no-shows = **≥ 2 NoShow bookings in 7 days**; late release = session active beyond booking endTime + grace period; charger fault = immediate. Configurable.
23. Notification preferences (per-user opt-in/opt-out, quiet hours) are NOT in scope for the MVP — see Open Questions Q13.
24. Email delivery, if implemented, uses an SMTP/mock provider (e.g., MailHog, Ethereal, or local relay). Final choice by Solution Architect.
25. Teams delivery, if implemented, uses Incoming Webhooks, Power Automate, or Microsoft Graph — final choice by Solution Architect based on tenant access available on the day.
26. The eligible-EV-user registry is seeded with demo users covering at least: an eligible Standard User with vehicle make/model and privacy acknowledged, an eligible Standard User without privacy acknowledgement, a Suspended user, and an unknown EID (for negative Authorize test cases).
27. Privacy notice content for the MVP is a single agreed text (v1) seeded with the application. Re-acknowledgement on version change is supported (FR-PRIV-005) but not exercised by default in the demo.
28. The CSMS RFID/idTag authorization window (`validFrom`–`validUntil` sent to `POST /api/auth/tags`) is aligned to the booking window. The booking-to-CSMS sync is expected to complete in under **5 seconds**; otherwise the booking is flagged `AuthorizationPending` until the CSMS responds, after which it becomes `Authorized` or `AuthorizationFailed` (BR-027).
29. Vehicle aggregation reports apply a minimum group size of **3 users** to protect privacy (FR-REP-017).
30. The Audit Log is the primary source of truth for "who did what when" across overrides, releases, maintenance blocks, CSMS authorization outcomes (`Authorized`, `AuthorizationFailed`, `Revoked`), eligible-user changes, privacy acknowledgements, and CSMS-driven state changes.

---

## 14. Open Questions

- **Q1 — Grace period duration.** Why it matters: directly affects when auto-release triggers and impacts demo timing. Provisional answer: **15 minutes**.
- **Q2 — CO₂ emission factor value.** Why it matters: visible to ESG/management and used in headline sustainability metric. Provisional answer: **0.85 kgCO₂/kWh** (a commonly cited fossil-grid factor). Confirm preferred value with sustainability lead.
- **Q3 — Number of chargers per location.** Why it matters: drives seed data and dashboard layout. Provisional answer: **4 chargers per location** (8 total) to keep the dashboard demo-friendly.
- **Q4 — Same-day vs future-day bookings.** Why it matters: future-day booking adds calendar complexity and changes overlap-validation surface. Provisional answer: **same-day only for MVP**.
- **Q5 — Security/Workplace/Admin override of 1h limit without justification capture.** Why it matters: audit/fairness story. Provisional answer: **reason is mandatory** for any override.
- **Q6 — AI model/provider.** Why it matters: drives latency, cost, and grounding implementation. Provisional answer: **a hosted LLM via Azure OpenAI** wrapped in a grounded prompt that injects metric values; final choice by Solution Architect.
- **Q7 — Real-time mechanism (polling vs SignalR vs WebSocket).** Why it matters: complexity vs demo polish. Provisional answer: **3–5 second polling for MVP** as the safest demo path; SignalR optional if time permits.
- **Q8 — Can a user release a Confirmed (not yet Active) booking, or only cancel?** Provisional answer: **Confirmed → Cancel; Active → Release**.
- **Q9 — Does a booking-extension flow exist in the MVP, or only override?** Provisional answer: **admin/security/workplace override only; no self-service extension** in MVP.
- **Q10 — Are notifications retained after the session ends and for how long?** Provisional answer: **retained for the demo session; no purge logic implemented**.
- **Q11 — Does the simulator run continuously in the background or only on demand?** Provisional answer: **on-demand, triggered from a demo control panel**, plus a recorded fallback scenario.
- **Q12 — Are connector IDs surfaced in the UI or simplified away?** Provisional answer: **simplified — one connector per charger; connector ID exists in the data model but is not surfaced in the employee UI**.
- **Q13 — Notification preferences / opt-out / quiet hours.** Provisional answer: **not in MVP — all configured channels fire for all relevant users; preferences deferred post-hackathon.**
- **Q14 — Email delivery provider.** Provisional answer: **SMTP/mock provider (e.g., MailHog/Ethereal) if SMTP available; otherwise payload-only preview persisted in notification audit.** Final choice by Solution Architect.
- **Q15 — Notification retention period.** Provisional answer: **retained for the demo session; no purge logic implemented**. Long-term retention deferred post-hackathon.
- **Q16 — Microsoft Teams delivery mechanism.** Provisional answer: **Incoming Webhook for the demo if available; otherwise Adaptive Card JSON payload preview persisted in notification audit. Adaptive Card actions deep-link back to the web app per FR-REM-013.**
- **Q17 — Auto-dismiss / acknowledgment rules for in-app notifications.** Provisional answer: **manual mark-read only for MVP; no auto-dismiss timer; critical-severity notifications remain visible until acknowledged.**
- **Q18 — Rate limiting per user / per channel.** Provisional answer: **no rate limit in MVP; cross-channel consistency (BR-019) prevents duplicate intent within a single trigger but does not throttle distinct triggers.**
- **Q19 — Repeated no-show threshold value and window.** Provisional answer: **≥ 2 NoShow bookings within 7 days, configurable.** Confirm with operations.
- **Q20 — Pending booking state usage in MVP.** Why it matters: the brief lists Pending as a valid booking state but the MVP currently transitions bookings straight to Confirmed. Provisional answer: **persist Pending in the data model and state enum, but in the MVP path a booking transitions Pending → Confirmed atomically as part of a successful create. A separate approval flow is deferred post-hackathon.** Confirm with stakeholders if any approval gate is required for the demo.
- **Q21 — CSMS authorization window alignment.** Why it matters: the `validFrom`–`validUntil` window sent to `POST /api/auth/tags` must align with the booking window so the CSMS accepts the user's idTag at the right time. Provisional answer: **validFrom = booking.startTime − 5 minutes; validUntil = booking.endTime + grace period (15 minutes)**, configurable (BR-027). Confirm acceptable with the CSMS provider on the day.
- **Q22 — Vehicle aggregation minimum group size.** Why it matters: privacy protection for vehicle-segmented reports. Provisional answer: **3 users per group** below which the row is suppressed or rolled up under "Other" (FR-REP-017). Confirm with privacy/legal stakeholder.
- **Q23 — Workplace User override scope.** Why it matters: the brief allows Workplace users to support booking operations but does not state explicitly whether Workplace can override the 1h cap. Provisional answer: **Workplace can override the 1h cap and release bookings under the same audit/reason rules as Security; Admin retains the ability to revoke this permission via configuration.** Confirm with stakeholders.
- **Q24 — Privacy notice versioning ownership.** Why it matters: who publishes new versions, and when. Provisional answer: **Admin role can publish a new privacy notice version; previous acknowledgements are retained for audit; users must re-acknowledge before next booking (FR-PRIV-005).** Confirm with legal/privacy.
- **Q25 — CSMS base URL and authentication.** Why it matters: the backend needs to know how to connect to the provided NexLevel CSMS REST API. Provisional answer: **configured via environment variable `CSMS_BASE_URL`; auth scheme TBD based on what the provided NexLevel CSMS requires (API key header, Basic auth, or no auth for local dev).** Confirm with the NexLevel CSMS provider on the day.
- **Q26 — CSMS polling interval for dashboard.** Why it matters: drives the real-time feel of the charger dashboard versus load on the CSMS. Provisional answer: **5-second polling for the dashboard** (FR-OCPP-003, FR-DASH-004). Confirm with Solution Architect; consider SignalR/WebSocket only if CSMS exposes push.
- **Q27 — CSMS authorization idTag format.** Why it matters: the RFID/idTag sent to `POST /api/auth/tags` must match what the provided simulator/CSMS expects. Provisional answer: **derived from the user's workplace registry EID or a UUID generated per booking; persisted on the booking as `csmsIdTag`**. Confirm exact format with NexLevel CSMS documentation on the day.

---

## 15. Out of Scope (Confirmation)

Restated from the use-case brief, Section 12 — Out of Scope:

- **Custom OCPP WebSocket server implementation.** The provided NexLevel CSMS owns OCPP protocol handling.
- **Raw OCPP message handling (BootNotification, StatusNotification, Authorize, StartTransaction, MeterValues, StopTransaction).** All charging infrastructure data comes from the provided CSMS REST API; the custom application must not parse or emit raw OCPP messages.
- Custom OCPP-style telemetry ingestion endpoint in the custom backend (replaced by CSMS REST API consumption).
- Real OCPP protocol implementation against physical chargers.
- Physical charger hardware integration.
- SMS or mobile push notification delivery.
- Fully production-grade email or Microsoft Teams notification infrastructure. Live email/Teams delivery is recommended if feasible; otherwise the MVP demonstrates the design through realistic payload generation persisted in the notification audit/history (see FR-REM-011, FR-REM-012, FR-REM-019, BR-018).
- Notification preferences screen, opt-out, quiet hours, or per-user channel selection (see Q13).
- Payment processing or billing per charging session.
- Integration with HR systems or employee directories beyond basic authenticated identity / seeded eligible-EV-user registry.
- Native mobile application (iOS/Android).
- Multi-tenant or multi-organization support.
- Fleet or full vehicle management beyond storing make/model for charging eligibility and reporting.
- Real-time grid pricing.
- Dynamic tariff adjustment.
- Complex vehicle-to-charger compatibility matching.
- Smart queuing system for automatic booking reallocation.

---

## 16. Traceability

| Feature group | FR IDs | Brief sections |
|---|---|---|
| Slot Booking | FR-BOOK-001..013 | 7, 8, 9 (BR001, BR002, BR007, BR010, BR012), 10.1, 10.4, 13 |
| Real-Time Availability Dashboard | FR-DASH-001..007 | 7, 9 (BR003), 10.2, 20.1 |
| CSMS REST API Integration | FR-OCPP-001..014 | 6.1, 7, 9 (BR004, BR005), 10.3, 10.4, 13, 14, 17, 18 |
| Smart Reminders and Slot Release | FR-REM-001..019 | 7, 9 (BR008, BR009), 10.6, 13, 19, 20 |
| Reporting and Sustainability Dashboard | FR-REP-001..017 | 7, 10.4, 10.7, 16, 20 |
| Responsible AI Layer | FR-AI-001..011 | 7, 8, 10.8, 16, 20 |
| Authentication and User Context | FR-AUTH-001..006 | 7, 9 (BR011, BR013), 10.5, 10.9, 10.11 |
| Privacy Acknowledgement | FR-PRIV-001..005 | 9 (BR013), 10.11, 16, 20 |
| Audit Log | FR-AUDIT-001..005 | 10.3, 10.5, 10.10, 16, 17, 20 (Auditability) |
| Admin Operations — Maintenance Blocks | FR-ADMIN-001..003 | 9 (BR012), 10.2, 10.10 |
| Eligible EV User Management | FR-USER-001..006 | 7, 9 (BR006), 10.5 |
| Business Rules (cross-cutting) | BR-001..029 | 6.1, 7, 8, 9, 10, 13, 16, 17, 18, 19 |
| Booking and Session State Reference | Section 11 | 17 |
| Demo Journey | Section 12 | 11 |

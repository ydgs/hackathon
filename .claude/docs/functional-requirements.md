# Functional Requirements — AI-Powered EV Charging Orchestration Platform

## 1. Document Header

| Field | Value |
|---|---|
| **Title** | Functional Requirements — AI-Powered EV Charging Orchestration Platform |
| **Purpose** | Translate the use-case brief into concrete, testable functional requirements, business rules, validations, and acceptance criteria that drive backlog generation, implementation, QA, and demo for the 16-hour hackathon MVP. |
| **Source** | `.claude/docs/use-case-brief.md` (Accenture Mauritius NEXLevel — "Energizing the Future") |
| **Status** | Draft — Hackathon MVP |
| **Date** | 2026-05-22 |
| **Version** | v1.1 |
| **Author** | Product Analyst |
| **Audience** | Solution Architect, Backend Dev, Frontend Dev, QA, Scrum Master, Demo Coach |
| **Revision Notes** | v1.1 — Expanded notification scope to multi-channel (in-app, email, Microsoft Teams Adaptive Cards) following updates to `.claude/docs/use-case-brief.md` sections 7.4, 9, 14, 15, 16, 17, 19. Added FR-REM-008..018, FR-AI-011, FR-REP-014..016, FR-AUTH-006, BR-018..022, validation rows, Q13..Q19, and new notification-related role permissions. No existing IDs renumbered. |

---

## 2. Scope Summary

The MVP is a mobile-first responsive web application for fair EV charger reservation, real-time charger visibility, simulated OCPP-style telemetry capture, sustainability reporting, and responsible AI insights at NEX Tower and NEXTERACOM.

**In scope:** authenticated booking with 2h fair-use cap, live charger dashboard, simulated OCPP telemetry pipeline (BootNotification, StatusNotification, StartTransaction, MeterValues, StopTransaction), session/energy tracking, reporting and sustainability metrics, multi-channel reminders (in-app required; email and Microsoft Teams Adaptive Card delivery if feasible, otherwise realistic preview/generated payloads for demo), notification center and history, admin/security override and manual release, and a grounded AI insights panel.

**Out of scope:** real OCPP hardware integration, SMS or mobile push notification delivery, fully production-grade email/Teams notification infrastructure (preview/generated payloads acceptable for MVP if live delivery not feasible), payments, HR system integration, native mobile apps, multi-tenant support, fleet/vehicle management, grid pricing, dynamic tariffs, and vehicle-charger compatibility matching.

---

## 3. User Roles and Permissions

| Role | Description | Key Actions (CAN) | Restricted (CANNOT) |
|---|---|---|---|
| **Employee / EV Driver** | Authenticated employee who needs to charge a personal EV | View charger availability across both locations; create, view, cancel, or release own bookings (≤2h); receive in-app reminders across all reminder template types; view own notification history; mark own notifications read; preview email/Teams Adaptive Card payloads addressed to them; view own session status; view basic sustainability insights | Create overlapping bookings; book >2h; hold more than one active booking; override another user's booking; change charger status manually; access admin reports; bypass fair-use rules; dismiss or modify other users' notifications |
| **Security Desk User** | On-site staff responsible for operational order | View today's bookings and active sessions; mark charger Unavailable/Faulted/Maintenance; manually release a booking; override the 2h limit when operationally required (with reason); receive admin/security intervention alerts (repeated no-shows, late release, charger fault); view notification audit/history for operational triage | Run sustainability/ESG reports as a primary user; create bookings on behalf of employees outside operational need; alter historical telemetry records; suppress audit notifications |
| **Facilities / Admin User** | Operations owner for chargers and bookings | All Security Desk actions; manage charger registry; access utilization and consumption reports; manage business configuration (grace period, emission factor, notification lead times); admin override on any booking with reason; access full notification audit/history across users and channels; view email/Teams Adaptive Card generated payloads for demo verification | Modify raw telemetry events; impersonate an employee; bypass audit logging; delete notification audit records |
| **Sustainability / ESG Stakeholder** | Reporting and ESG persona | View sustainability and reporting dashboards (kWh, CO₂, utilization, trends, location comparison); export/screenshot reports | Create or modify bookings; change charger status; modify emission factor |
| **Management / Jury** | Hackathon evaluators | View dashboards, AI insights, and the demo journey | Perform any write action |

**Admin override:** Security and Facilities/Admin can release, cancel, or extend a booking beyond the 2h cap. Override actions MUST require a reason field and are audit-logged.

**Fair-use exceptions:** Only Security or Facilities/Admin roles can authorise an override of the 2h cap or the "one active booking per user" rule.

---

## 4. Functional Requirements Grouped by Feature

### 4.1 Slot Booking

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-BOOK-001** | List available chargers | The system shall list all chargers across NEX Tower and NEXTERACOM with current status and location filter. | P0 | Employee, Security, Admin |
| **FR-BOOK-002** | Create booking | An authenticated employee can create a booking for an Available charger by selecting start time and end time (duration ≤ 2h). | P0 | Employee |
| **FR-BOOK-003** | Enforce 2h max duration | The system shall reject any booking creation or update where end − start > 120 minutes for non-admin users. | P0 | Employee |
| **FR-BOOK-004** | Prevent overlapping bookings on same charger | The system shall reject a booking whose time window overlaps an existing Confirmed/Active booking on the same charger. | P0 | Employee, Security, Admin |
| **FR-BOOK-005** | One active booking per user | The system shall reject a booking when the requesting user already holds a Confirmed or Active booking. | P0 | Employee |
| **FR-BOOK-006** | Display 2h fair-use rule pre-confirmation | The booking confirmation screen shall display the 2h max duration rule before submission. | P0 | Employee |
| **FR-BOOK-007** | Cancel booking | A user can cancel their own Confirmed (not yet Active) booking. State moves to Cancelled. | P0 | Employee |
| **FR-BOOK-008** | Release booking | A user can release an Active booking before its scheduled end. State moves to Released, charger returns to Available. | P1 | Employee |
| **FR-BOOK-009** | Admin manual release | Security or Admin can release any booking; state moves to Overridden; reason captured. | P1 | Security, Admin |
| **FR-BOOK-010** | Admin 2h override | Security or Admin can create or extend a booking beyond 2h; reason captured; audit-logged. | P1 | Security, Admin |
| **FR-BOOK-011** | View my bookings | An employee can list and view detail of their bookings (Confirmed, Active, Completed, Cancelled, Released, NoShow). | P0 | Employee |
| **FR-BOOK-012** | View today's bookings (admin) | Security/Admin can view a list of all bookings for today across both locations. | P1 | Security, Admin |

### 4.2 Real-Time Availability Dashboard

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-DASH-001** | Show all chargers with status | Display each charger with status (Available, Reserved, Charging, Unavailable, Faulted, Maintenance), location, and connector. | P0 | All |
| **FR-DASH-002** | Filter by location | Allow filtering by NEX Tower or NEXTERACOM. | P0 | All |
| **FR-DASH-003** | Mobile-first layout | Charger cards readable on mobile (≥320px) with large touch targets, no horizontal scroll. | P0 | Employee |
| **FR-DASH-004** | Real-time / near-real-time updates | Charger status reflects backend telemetry changes within 5 seconds (polling, SignalR, or WebSocket — TBD by architect). | P0 | All |
| **FR-DASH-005** | Show active session info | When a charger is Charging, show transactionId, user (masked for non-admin), elapsed time, and energyKWh. | P1 | All (admin sees user) |
| **FR-DASH-006** | Admin charger status control | Security/Admin can mark a charger Unavailable, Faulted, or Maintenance with reason. | P1 | Security, Admin |
| **FR-DASH-007** | Status driven by backend only | UI shall not modify charger status locally; status comes from backend events. | P0 | System |

### 4.3 OCPP-Style Consumption Capture (simulated telemetry)

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-OCPP-001** | Telemetry ingestion endpoint | The backend shall expose an ingestion endpoint that accepts simulated OCPP-style events (BootNotification, StatusNotification, StartTransaction, MeterValues, StopTransaction). | P0 | System (Simulator) |
| **FR-OCPP-002** | Normalize raw events | Inbound events shall be normalized into the internal `TelemetryEvent` model with `chargerId, connectorId, eventType, transactionId, userId, status, energyKWh, powerKW, timestamp, source`. | P0 | System |
| **FR-OCPP-003** | Update charger state from StatusNotification | On a StatusNotification event, the corresponding charger's status shall be updated. | P0 | System |
| **FR-OCPP-004** | Start charging session | On StartTransaction (with valid bookingId/userId/chargerId), a ChargingSession row shall be created in Charging state. | P0 | System |
| **FR-OCPP-005** | Record meter values | MeterValues events shall be persisted and the active ChargingSession's cumulative `energyKWh` updated. | P0 | System |
| **FR-OCPP-006** | Stop charging session | StopTransaction shall set the ChargingSession to Completed, finalize energyKWh, and return the charger to Available. | P0 | System |
| **FR-OCPP-007** | Lifecycle: Available → Reserved → Charging → Completed → Available | The simulator must support the full lifecycle for demo. | P0 | System |
| **FR-OCPP-008** | Fallback recorded scenario | A pre-recorded telemetry scenario shall be available for demo fallback. | P0 | System |
| **FR-OCPP-009** | Label simulated source | Every stored telemetry event shall carry `source = "Simulator"` (or equivalent) so downstream layers can label simulated data. | P0 | System |
| **FR-OCPP-010** | Reject unknown chargerId | The ingestion endpoint shall reject events for chargers not in the registry (HTTP 400). | P0 | System |

### 4.4 Smart Reminders and Slot Release

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-REM-001** | Pre-session reminder | Generate an in-app reminder N minutes before booking start time (default 10 minutes). | P1 | Employee |
| **FR-REM-002** | Session-ending reminder | Generate an in-app reminder N minutes before booking end (default 10 minutes). | P1 | Employee |
| **FR-REM-003** | Session-ended alert | When a ChargingSession reaches Completed, generate an in-app alert to the user. | P1 | Employee |
| **FR-REM-004** | Release prompt | If a session ends but the booking is still Active, prompt the user to release the charger. | P1 | Employee |
| **FR-REM-005** | Auto-release on no-show | If the user has not started charging within the grace period (default 15 minutes) after booking start, the booking is moved to NoShow and the charger returns to Available. | P1 | System |
| **FR-REM-006** | Admin manual release confirmation | When Security/Admin manually releases, the affected user receives an in-app notification with the reason. | P1 | Employee, Security, Admin |
| **FR-REM-007** | List notifications | Employees can view a list of their in-app notifications. | P1 | Employee |
| **FR-REM-008** | Booking confirmation reminder | On successful booking creation, generate an in-app notification confirming the booking (charger, time window, location). | P1 | Employee |
| **FR-REM-009** | Booking grace period warning | After booking startTime if no StartTransaction has been received, send an in-app warning to the user before the grace period expires (default: 5 minutes after start, i.e. 10 minutes before auto-release). | P1 | Employee |
| **FR-REM-010** | Admin/security intervention alert | Generate an in-app alert to Security/Admin when operational intervention may be needed: repeated no-shows by a user (threshold configurable, default ≥ 2 in 7 days), late release (session continues past booking end + grace), or charger Faulted during active session. | P1 | Security, Admin |
| **FR-REM-011** | Email notification delivery or preview | For every reminder template, the system shall either send a real email (if SMTP/mock provider configured) or generate and persist a realistic email payload (subject, body, recipient) viewable in the notification audit/history for demo purposes. | P1 | Employee, Security, Admin |
| **FR-REM-012** | Microsoft Teams Adaptive Card delivery or preview | For every reminder template, the system shall either deliver an Adaptive Card via Incoming Webhook / Power Automate / Microsoft Graph (if available) or generate and persist a valid Adaptive Card JSON payload viewable in the notification audit/history for demo purposes. | P1 | Employee, Security, Admin |
| **FR-REM-013** | Teams Adaptive Card actions | Generated Adaptive Cards shall support the following actions where feasible: View booking, Release slot, Confirm session started, Acknowledge end-of-session reminder. For the MVP these actions may deep-link back to the web application rather than execute inside Teams. | P1 | Employee |
| **FR-REM-014** | Notification center / persistent in-app history | The in-app notification center shall display all notifications addressed to the current user across all channels (in-app, email payload, Teams Adaptive Card payload), with read/unread state, timestamp, channel indicator, and the linked booking/session/charger context. | P1 | Employee, Security, Admin |
| **FR-REM-015** | Mark notification read | Users can mark an individual in-app notification as read; the unread count badge updates accordingly. | P1 | Employee, Security, Admin |
| **FR-REM-016** | Notification audit/history endpoint | The backend shall expose a notification audit/history endpoint listing every notification generated (in-app, email payload, Teams payload) with trigger event, audience, channel, timing, payload reference, and delivery status (Sent, Previewed, Failed). | P1 | Security, Admin |
| **FR-REM-017** | Reminder template registry | The system shall implement the eight reminder templates listed in the brief Section 15: Booking confirmation, Session starting soon, Booking grace period warning, Charging session ending soon, Charging session ended, Slot release prompt, Auto-release/no-show notification, Admin/security intervention alert. Each template shall be available across in-app, email, and Teams channels. | P1 | System |
| **FR-REM-018** | Cross-channel consistency | A single trigger event shall produce one logical notification record with the same message intent across all enabled channels (in-app, email, Teams). The user must not receive contradictory wording or timing across channels for the same event. | P1 | System |

### 4.5 Reporting and Sustainability Dashboard

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-REP-001** | Total charging sessions | Display total count of ChargingSessions over a selected date range. | P0 | Facilities, ESG, Admin, Management |
| **FR-REP-002** | Total energy consumed (kWh) | Display sum of energyKWh across all completed sessions. | P0 | Facilities, ESG, Admin |
| **FR-REP-003** | Average session duration | Display avg(StopTransaction − StartTransaction) for completed sessions. | P1 | Facilities, Admin |
| **FR-REP-004** | Average energy per session | Display avg(energyKWh) per completed session. | P1 | Facilities, ESG, Admin |
| **FR-REP-005** | Charger utilization rate | Display % of operating hours a charger spent in Reserved or Charging state. | P1 | Facilities, Admin |
| **FR-REP-006** | Peak charging hours | Display distribution of charging starts by hour-of-day. | P1 | Facilities, Admin |
| **FR-REP-007** | Most-used chargers | Ranked list of chargers by session count. | P1 | Facilities, Admin |
| **FR-REP-008** | Location comparison | Side-by-side metrics for NEX Tower vs NEXTERACOM. | P1 | Facilities, ESG, Management |
| **FR-REP-009** | Estimated CO₂ savings | Display total estimated kgCO₂ avoided using formula `kWh * fixedEmissionFactor`. Display the emission factor value used. | P0 | ESG, Management |
| **FR-REP-010** | Failed / cancelled / released bookings | Display counts of failed booking attempts, cancellations, and releases. | P1 | Facilities, Admin |
| **FR-REP-011** | Faulted / unavailable charger events | Display count and timeline of charger fault and unavailable events. | P1 | Facilities, Admin |
| **FR-REP-012** | Label simulated data | All report widgets shall include a visible "Based on simulated demo data" label when any of the underlying telemetry is from the Simulator source. | P0 | System |
| **FR-REP-013** | Date range and location filters | Reporting dashboard shall support date range and location filtering. | P1 | Facilities, ESG, Admin |
| **FR-REP-014** | Notification delivery metrics | Display counts of notifications generated by channel (in-app, email, Teams) and by delivery status (Sent, Previewed, Failed) over the selected date range. | P1 | Facilities, Admin |
| **FR-REP-015** | Notification acknowledgment rate | Display the percentage of in-app notifications marked read by users over the selected date range. | P2 | Facilities, Admin |
| **FR-REP-016** | No-show rate after reminders | Display the rate of NoShow bookings as a percentage of total bookings, segmented by whether the pre-session reminder was generated. | P1 | Facilities, Admin |

### 4.6 Responsible AI Layer

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-AI-001** | Demand forecasting | Provide a forecast of likely peak charging windows for the next 24h based on booking and session history. | P2 | Facilities, Management |
| **FR-AI-002** | Pattern detection | Detect underused chargers, high-demand periods, and repeated late releases. | P2 | Facilities, Admin |
| **FR-AI-003** | Intelligent natural-language reporting | Generate a short natural-language daily summary of charging activity. | P2 | Facilities, ESG, Management |
| **FR-AI-004** | Operational recommendations | Suggest fair-use adjustments (e.g., reduce slot duration in peak windows, encourage off-peak booking). | P2 | Facilities, Admin |
| **FR-AI-005** | Anomaly flagging | Flag unexpected energy spikes, unusually long sessions, and repeated no-shows. | P2 | Facilities, Admin |
| **FR-AI-006** | NL insight generation | Generate management-friendly NL insights linked to underlying metrics. | P2 | Management, ESG |
| **FR-AI-007** | Grounding rule | AI outputs must reference at least one underlying metric, charger, session, or booking record from the system. | P2 | System |
| **FR-AI-008** | Simulated data disclosure | When insights are derived from simulator-sourced data, the output must include a "Based on simulated data" label. | P2 | System |
| **FR-AI-009** | Low-confidence disclosure | When supporting data is insufficient (e.g., < 10 sessions in the window), the AI must state that confidence is limited and not produce point forecasts. | P2 | System |
| **FR-AI-010** | No fabricated metrics | AI must not invent metrics that do not exist in the data store; outputs shall be cross-checkable against reporting endpoints. | P2 | System |
| **FR-AI-011** | AI-assisted notification phrasing (optional) | When generating the natural-language body for an admin/security intervention alert or daily summary notification, the AI shall ground the wording in the same metrics/records it cites in its `grounding` block; AI-generated wording must follow the same simulated-data labelling and low-confidence rules as FR-AI-007..010. | P2 | System |

### 4.7 Authentication and User Context

| ID | Title | Description | Priority | Role(s) |
|---|---|---|---|---|
| **FR-AUTH-001** | Simplified login | The system shall provide a simplified authentication flow (mock login, role selector, or seeded users) sufficient to identify a user and their role. | P0 | All |
| **FR-AUTH-002** | Session context | Authenticated requests shall carry a userId and role used by all booking, dashboard, and reporting actions. | P0 | System |
| **FR-AUTH-003** | Role-based UI | The UI shall show or hide admin/security capabilities based on the authenticated role. | P0 | System |
| **FR-AUTH-004** | Role-based API authorization | The backend shall reject role-restricted actions (override, release of others' bookings, charger status writes, report-only views) for unauthorised roles (HTTP 403). | P0 | System |
| **FR-AUTH-005** | Logout | The user can end their session and return to login. | P1 | All |

---

## 5. Business Rules

1. **BR-001** A booking's duration MUST be > 0 and ≤ 120 minutes for non-admin users.
2. **BR-002** Two Confirmed or Active bookings on the same charger MUST NOT overlap in time (closed-open interval `[start, end)`).
3. **BR-003** A user MUST NOT hold more than one Confirmed or Active booking at any time.
4. **BR-004** A booking can only be created against a charger whose current status is `Available` or that is `Reserved`/`Charging` for a non-overlapping later slot.
5. **BR-005** Charger status transitions follow this lifecycle: `Available → Reserved → Charging → Available`. Side transitions to `Faulted`, `Unavailable`, or `Maintenance` are allowed from any state and recovery back to `Available` requires admin action or a BootNotification.
6. **BR-006** A no-show grace period of **15 minutes** (configurable) applies after booking start. After the grace period with no StartTransaction, the booking moves to `NoShow` and the charger returns to `Available`.
7. **BR-007** Admin/Security override of the 2h cap or another user's booking REQUIRES a non-empty reason and creates an audit-log entry.
8. **BR-008** CO₂ savings are estimated using a fixed emission factor of **0.85 kgCO₂/kWh** (provisional — see Open Questions) and the value used MUST be visible alongside the metric.
9. **BR-009** All telemetry events stored with `source = "Simulator"` are considered simulated; any metric or AI insight derived from at least one simulated event MUST be visibly labelled "Based on simulated demo data".
10. **BR-010** A user cannot cancel a booking that is already `Active`; they must use **Release** instead.
11. **BR-011** A user cannot release a booking that is not `Active` (or `Confirmed`, if release-before-start is enabled — provisional, see Open Questions).
12. **BR-012** A ChargingSession is uniquely linked to one Booking, one Charger, one Connector, and one User; StartTransaction without a matching Confirmed/Active booking is rejected unless triggered by an admin override path.
13. **BR-013** Booking start time MUST be in the future or current (within a small tolerance, e.g., 1 minute) at the moment of submission.
14. **BR-014** All booking state changes (Confirmed, Active, Completed, Cancelled, Released, NoShow, Overridden) MUST be persisted and timestamped.
15. **BR-015** When a charger transitions to `Faulted` during an Active session, the session moves to `Faulted`, the booking moves to `Released` (or `Overridden`), and the user is notified.
16. **BR-016** A booking can be created **only for today** in the MVP (provisional — see Open Questions). Same-day forward booking only.
17. **BR-017** Fair-use enforcement (BR-001, BR-002, BR-003) is enforced server-side and cannot be bypassed by client manipulation.
18. **BR-018** In-app reminders are mandatory for the MVP. Email and Microsoft Teams Adaptive Card channels are recommended; if live delivery is not feasible at demo time, the system MUST still generate and persist a realistic payload viewable in the notification audit/history so the multi-channel design is demonstrable.
19. **BR-019** A single trigger event produces exactly one logical notification record. That record may fan out to multiple channels (in-app, email, Teams) but the message intent and timing MUST be consistent across channels.
20. **BR-020** Notification delivery status MUST be persisted per channel as one of: `Sent` (real delivery acknowledged), `Previewed` (payload generated, no live delivery), or `Failed` (delivery attempted and failed). The notification audit/history reflects this status.
21. **BR-021** Admin/security intervention alerts (FR-REM-010) are triggered by: repeated no-shows by the same user (default threshold ≥ 2 NoShow bookings within 7 days), late release (session active beyond booking end + grace), or any charger transitioning to `Faulted` during an Active session. Thresholds are configurable.
22. **BR-022** Notifications generated for a booking/session MUST link back to the originating bookingId/sessionId/chargerId for traceability, and MUST be retained at least for the duration of the demo session (see Q15).

---

## 6. Validation Rules

| Entity | Field | Rule | Error condition | Client | Server |
|---|---|---|---|---|---|
| Booking | startTime | Required, ISO 8601 | Missing or invalid format | Yes | Yes |
| Booking | endTime | Required, ISO 8601, > startTime | Missing, invalid, or ≤ startTime | Yes | Yes |
| Booking | duration | `endTime − startTime ≤ 120 minutes` | Duration > 2h for non-admin | Yes | Yes |
| Booking | startTime | ≥ now − 1 minute | Booking start in the past | Yes | Yes |
| Booking | startTime | Same calendar day as now (MVP) | Future-day booking attempted | Yes | Yes |
| Booking | chargerId | Required, exists in registry | Missing/unknown charger | No | Yes |
| Booking | chargerId | Charger status `Available` for window | Charger not available / overlap | No | Yes |
| Booking | userId | No existing Confirmed/Active booking by user | User already has active booking | No | Yes |
| Booking | reasonForOverride | Required when role=admin/security and rule bypass invoked | Empty reason on override | Yes | Yes |
| Charger | chargerId | Required, unique | Duplicate or missing | No | Yes |
| Charger | locationId | Required, one of `NEX-TOWER`, `NEXTERACOM` | Unknown location | No | Yes |
| Charger | status | One of enum (Available, Reserved, Charging, Unavailable, Faulted, Maintenance) | Invalid value | No | Yes |
| TelemetryEvent | eventType | One of BootNotification, StatusNotification, StartTransaction, MeterValues, StopTransaction | Unknown eventType | No | Yes |
| TelemetryEvent | chargerId | Required, exists | Unknown charger | No | Yes |
| TelemetryEvent | timestamp | Required, ISO 8601, not in far future | Missing/invalid | No | Yes |
| TelemetryEvent | energyKWh | ≥ 0 when present (MeterValues / StopTransaction) | Negative or non-numeric | No | Yes |
| TelemetryEvent | transactionId | Required for Start/Stop/MeterValues | Missing on those events | No | Yes |
| User | userId | Required, exists | Missing or unknown | No | Yes |
| User | role | One of Employee, Security, Facilities/Admin, ESG, Management | Invalid role | No | Yes |
| Notification | triggerEvent | One of: BookingConfirmation, SessionStartingSoon, BookingGracePeriodWarning, ChargingSessionEndingSoon, ChargingSessionEnded, SlotReleasePrompt, AutoReleaseNoShow, AdminSecurityInterventionAlert | Unknown trigger | No | Yes |
| Notification | channel | One of: InApp, Email, Teams | Invalid channel | No | Yes |
| Notification | deliveryStatus | One of: Sent, Previewed, Failed | Invalid status | No | Yes |
| Notification | audienceUserId | Required, exists | Missing or unknown | No | Yes |
| Notification | linkedBookingId / sessionId / chargerId | At least one MUST be present | All three null | No | Yes |
| Notification | payload (email) | When channel=Email: subject and body non-empty | Missing subject or body | No | Yes |
| Notification | payload (Teams) | When channel=Teams: valid Adaptive Card JSON (parseable, schema-conformant) | Invalid Adaptive Card JSON | No | Yes |
| Notification | timestamp | Required, ISO 8601 | Missing/invalid | No | Yes |
| Notification | readState (in-app only) | Boolean; defaults to false | Invalid type | Yes | Yes |

---

## 7. Notifications and Reminders

The table below lists every reminder template required by the MVP. The MVP requires in-app delivery; email and Microsoft Teams Adaptive Card delivery are recommended, with payload preview/generation as a fallback (see BR-018, FR-REM-011, FR-REM-012). Severity drives UI styling (Info / Warning / Critical). Action buttons map to the Adaptive Card actions in FR-REM-013 where applicable. Persistence "Yes" means the notification is retained in the notification center / audit history (FR-REM-014, FR-REM-016).

| Trigger | Audience | Channels | Timing | Severity | Action Buttons | Persistence | Message Intent |
|---|---|---|---|---|---|---|---|
| Pre-session reminder (Session starting soon) | Booking owner | In-app + Email + Teams | 10 min before booking startTime | Info | View booking | Yes | "Your charging slot at {charger} starts in 10 minutes." |
| Session-ending reminder (Charging session ending soon) | Booking owner | In-app + Email + Teams | 10 min before booking endTime | Warning | View booking, Release slot | Yes | "Your charging session ends in 10 minutes. Please prepare to release the charger." |
| Session-ended alert (Charging session ended) | Booking owner | In-app + Email + Teams | On StopTransaction received | Info | View booking, Acknowledge end-of-session reminder | Yes | "Your charging session has ended. {energyKWh} kWh delivered." |
| Release prompt (Slot release prompt) | Booking owner | In-app + Email + Teams | If session ends but booking still Active | Warning | Release slot | Yes | "Charging complete. Please release the charger for the next user." |
| Auto-release on no-show (Auto-release/no-show notification) | Booking owner | In-app + Email + Teams | At booking.startTime + 15 min if no StartTransaction | Warning | View booking | Yes | "Your booking on {charger} was released because charging did not start in time." |
| Admin manual release confirmation | Affected user + acting admin | In-app + Email + Teams | Immediately on admin release/override action | Warning | View booking | Yes | "An admin released your booking on {charger}. Reason: {reason}." |
| Charger fault during session | Booking owner | In-app + Email + Teams | On Faulted StatusNotification during Active session | Critical | View booking | Yes | "Your charger reported a fault. Session stopped. Please contact security." |
| Booking confirmation (FR-REM-008) | Booking owner | In-app + Email + Teams | Immediately on successful booking creation | Info | View booking, Confirm session started | Yes | "Your booking on {charger} at {location} is confirmed for {startTime}–{endTime}." |
| Booking grace period warning (FR-REM-009) | Booking owner | In-app + Email + Teams | booking.startTime + 5 min, if no StartTransaction received | Warning | View booking, Confirm session started | Yes | "Your booking on {charger} starts soon and charging has not begun. The slot will be auto-released in {N} minutes." |
| Admin/security intervention alert — repeated no-shows (FR-REM-010) | Security, Admin | In-app + Email + Teams | When a user accumulates ≥ 2 NoShow bookings in 7 days | Warning | View booking | Yes | "User {userId} has {N} no-shows in the last 7 days. Consider operational review." |
| Admin/security intervention alert — late release (FR-REM-010) | Security, Admin | In-app + Email + Teams | When a session continues past booking endTime + grace | Warning | Release slot | Yes | "Charger {charger} session is past its booking window. Manual release may be needed." |
| Admin/security intervention alert — charger faulted (FR-REM-010) | Security, Admin | In-app + Email + Teams | On Faulted StatusNotification | Critical | View booking | Yes | "Charger {charger} reported a fault during an active session. Operational intervention required." |

---

## 8. Reporting Needs

| Metric | Definition | Data Source | Aggregation | Filter Dimensions | Audience |
|---|---|---|---|---|---|
| Total charging sessions | Count of ChargingSession in date range | session | count | location, charger, date range | Facilities, ESG, Mgmt |
| Total energy consumed (kWh) | Sum of session.energyKWh | session / telemetry (MeterValues) | sum | location, charger, date range | Facilities, ESG |
| Average session duration | avg(stopTs − startTs) per completed session | session | avg | location, charger, date range | Facilities |
| Average energy per session | avg(energyKWh) per completed session | session | avg | location, charger, date range | Facilities, ESG |
| Charger utilization rate | (time in Reserved+Charging) / operating window | charger state timeline (derived from telemetry) | % | location, charger, date range | Facilities |
| Peak charging hours | Distribution of StartTransaction by hour-of-day | telemetry | count by bucket | location, date range | Facilities |
| Most-used chargers | Ranked list by session count | session | count grouped by charger | location, date range | Facilities |
| Location comparison | Same metrics split by NEX Tower vs NEXTERACOM | derived | grouped | date range | Facilities, ESG, Mgmt |
| Estimated CO₂ savings (kg) | `total kWh × 0.85 kgCO₂/kWh` (provisional) | derived | sum | location, date range | ESG, Mgmt |
| Failed bookings | Count of booking attempts rejected by validation | booking-attempt log | count | location, date range | Facilities |
| Cancelled bookings | Count of bookings in Cancelled state | booking | count | location, date range | Facilities |
| Released bookings | Count in Released state | booking | count | location, date range | Facilities |
| Faulted / Unavailable charger events | Count of StatusNotification transitions to Faulted/Unavailable | telemetry | count | location, charger, date range | Facilities |
| Notifications generated by channel | Count of notifications grouped by channel (InApp/Email/Teams) | notification audit | count | channel, trigger, date range | Facilities, Admin |
| Notification delivery status mix | Count of notifications grouped by deliveryStatus (Sent/Previewed/Failed) | notification audit | count | channel, date range | Facilities, Admin |
| Notification acknowledgment rate | % of in-app notifications marked read by audience | notification audit + readState | % | trigger, date range | Facilities, Admin |
| No-show rate after reminders | NoShow bookings / total bookings, segmented by whether pre-session reminder was generated | booking + notification audit | % | location, date range | Facilities, Admin |
| Admin/security intervention alerts triggered | Count of intervention alerts by sub-type (repeated no-shows / late release / charger fault) | notification audit | count by sub-type | date range | Security, Admin |

**CO₂ formula (stub):** `estimatedCO2SavingsKg = sum(energyKWh) * EMISSION_FACTOR_KG_PER_KWH` where `EMISSION_FACTOR_KG_PER_KWH = 0.85` (provisional, configurable).

---

## 9. AI-Related Functional Requirements

Each AI capability MUST satisfy: input source = system data; output explicit; grounded in metrics; labelled when based on simulated data; declares low confidence when data thin; no fabrication.

### FR-AI-001 — Demand Forecasting
- **Purpose:** Predict likely peak charging windows for the next 24h to inform fair-use adjustments.
- **Input sources:** Booking history, ChargingSession history, telemetry timeline.
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
- **Purpose:** Suggest fair-use adjustments.
- **Input sources:** Utilization, peak hour, no-show data.
- **Output shape:** Ranked list of recommendations with rationale and the metric that triggered them.
- **Grounding rules:** Each recommendation must cite the metric and threshold.
- **Acceptance behavior:** No recommendations if no metric exceeds threshold.

### FR-AI-005 — Anomaly Flagging
- **Purpose:** Flag unexpected energy spikes, unusually long sessions, repeated no-shows.
- **Input sources:** Telemetry (MeterValues), Session, Booking.
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

---

## 10. Acceptance Criteria per Feature

All acceptance criteria below are testable by QA without further clarification. Format: Given / When / Then.

### 4.1 Slot Booking — Acceptance Criteria

1. **AC-BOOK-01 (happy path)**
   Given I am authenticated as an Employee and charger `NEX-TOWER-CH-01` is Available,
   When I submit a booking with startTime = now+5min, endTime = now+65min (60-minute slot),
   Then the booking is created with state `Confirmed`, the charger transitions to `Reserved`, and I see a confirmation.

2. **AC-BOOK-02 (overlap conflict)**
   Given a Confirmed booking exists on `NEX-TOWER-CH-01` from 09:00 to 10:30,
   When another Employee submits a booking on the same charger from 10:00 to 11:00,
   Then the request is rejected with HTTP 409 and an error: "Time slot overlaps an existing booking."

3. **AC-BOOK-03 (2h cap)**
   Given I am authenticated as an Employee,
   When I submit a booking with duration of 121 minutes,
   Then the request is rejected with HTTP 400 and an error: "Maximum booking duration is 2 hours."

4. **AC-BOOK-04 (one active booking)**
   Given I already have a Confirmed booking,
   When I attempt to create another Confirmed booking on any charger,
   Then the request is rejected with HTTP 409 and an error: "You already have an active booking."

5. **AC-BOOK-05 (cancel)**
   Given I have a Confirmed booking that has not yet started,
   When I cancel it,
   Then the booking state becomes `Cancelled` and the charger returns to `Available`.

6. **AC-BOOK-06 (release active)**
   Given my booking is `Active` and a session is `Charging`,
   When I release the booking,
   Then the session is stopped (StoppedByUser), the booking moves to `Released`, and the charger becomes `Available`.

7. **AC-BOOK-07 (admin override 2h)**
   Given I am Security/Admin and provide a non-empty reason,
   When I create a 150-minute booking,
   Then the booking is accepted, marked Overridden, and the audit log records the reason and acting user.

8. **AC-BOOK-08 (admin override without reason)**
   Given I am Security/Admin,
   When I attempt a 2h override with empty reason,
   Then the request is rejected with HTTP 400 and an error: "Reason is required for override."

### 4.2 Real-Time Availability Dashboard — Acceptance Criteria

1. **AC-DASH-01** Given the dashboard is open, When I load it, Then I see every registered charger with its current status colour-coded and labelled.
2. **AC-DASH-02** Given a backend StatusNotification updates `NEX-TOWER-CH-01` to `Charging`, When the dashboard refresh interval elapses (≤5s), Then the charger card updates to `Charging` without a manual reload.
3. **AC-DASH-03** Given I filter by NEXTERACOM, When the filter is applied, Then only NEXTERACOM chargers are shown.
4. **AC-DASH-04** Given I view the dashboard on a 360px-wide mobile viewport, When I scroll vertically, Then all charger cards are readable with no horizontal scroll.
5. **AC-DASH-05** Given I am an Employee, When I view a `Charging` charger, Then the user identity field is masked or hidden.
6. **AC-DASH-06** Given I am Security/Admin, When I mark `NEXTERACOM-CH-02` Unavailable with reason "cable damaged", Then its status updates and the change is audit-logged.
7. **AC-DASH-07 (charger faulted mid-session — failure path)** Given a session is `Charging` and the charger reports `Faulted`, When the StatusNotification is ingested, Then the dashboard shows `Faulted`, the session moves to `Faulted`, and the user receives a fault notification.

### 4.3 OCPP-Style Consumption Capture — Acceptance Criteria

1. **AC-OCPP-01 (boot)** Given the simulator sends a `BootNotification` for `NEX-TOWER-CH-01`, When ingestion processes it, Then the charger is registered/known and status set to `Available`.
2. **AC-OCPP-02 (start)** Given a Confirmed booking exists, When a `StartTransaction` event references its bookingId/chargerId/userId, Then a ChargingSession is created in `Charging` and charger status moves to `Charging`.
3. **AC-OCPP-03 (meter values)** Given a session is `Charging`, When three sequential `MeterValues` events are received with cumulative energy 2.0, 4.0, 6.4 kWh, Then session.energyKWh is updated to 6.4 kWh.
4. **AC-OCPP-04 (stop)** Given a session is `Charging`, When a `StopTransaction` is received, Then the session moves to `Completed`, charger returns to `Available`, and final energyKWh is persisted.
5. **AC-OCPP-05 (unknown charger)** Given an event references `UNKNOWN-CH-99`, When it is sent to ingestion, Then it is rejected with HTTP 400 and not persisted.
6. **AC-OCPP-06 (source label)** Given any event ingested from the simulator, When stored, Then `source = "Simulator"` is persisted.
7. **AC-OCPP-07 (lifecycle)** Given the demo simulator runs the full scenario, When executed end to end, Then the charger flows Available → Reserved → Charging → Available within the demo window.
8. **AC-OCPP-08 (failure path — fault during charging)** Given a session is `Charging`, When a `StatusNotification` with status=Faulted is received, Then the session moves to `Faulted` and the booking to `Released`/`Overridden` per BR-015.

### 4.4 Smart Reminders and Slot Release — Acceptance Criteria

1. **AC-REM-01** Given a Confirmed booking starts at 10:00, When the clock reaches 09:50, Then the booking owner sees an in-app pre-session reminder.
2. **AC-REM-02** Given a booking ends at 11:00, When the clock reaches 10:50, Then the owner sees an in-app session-ending reminder.
3. **AC-REM-03 (no-show)** Given a booking starts at 10:00 and no StartTransaction is received, When clock reaches 10:15, Then the booking moves to `NoShow`, the charger returns to `Available`, and the user receives a no-show notification.
4. **AC-REM-04** Given an admin releases a user's booking with reason "operational", When released, Then the user sees an in-app notification with the reason.
5. **AC-REM-05** Given a session has `Completed` and the booking is still `Active`, When the system processes the stop event, Then the user receives a release prompt notification.
6. **AC-REM-06** Given I open the notifications list, When the page loads, Then I see all my notifications ordered by most recent first.
7. **AC-REM-07 (booking confirmation)** Given I create a booking that passes all validations, When the booking is created, Then I immediately see a "Booking confirmation" in-app notification AND the notification audit/history contains one email payload and one Teams Adaptive Card payload for the same trigger, each linked to my bookingId.
8. **AC-REM-08 (grace period warning)** Given my booking starts at 10:00 with grace period 15 min and no StartTransaction is received, When the clock reaches 10:05, Then I receive a "Booking grace period warning" in-app notification with severity Warning, and the message states the slot will be auto-released in 10 minutes.
9. **AC-REM-09 (intervention alert — repeated no-shows)** Given user U has accumulated 2 NoShow bookings within the past 7 days, When the second NoShow is recorded, Then Security and Admin users receive an "Admin/security intervention alert" in-app notification referencing user U and the no-show count.
10. **AC-REM-10 (intervention alert — charger fault)** Given a session is Charging on charger C, When a StatusNotification with status=Faulted is ingested, Then Security and Admin users receive an intervention alert with severity Critical referencing charger C, in addition to the user-facing fault notification (AC-DASH-07).
11. **AC-REM-11 (email preview fallback)** Given the email channel is not configured for live delivery, When a notification trigger fires, Then a realistic email payload (recipient, subject, body) is generated and stored in the notification audit with deliveryStatus="Previewed", and is viewable from the admin notification audit/history view.
12. **AC-REM-12 (Teams Adaptive Card preview fallback)** Given the Teams channel is not configured for live delivery, When a notification trigger fires, Then a valid Adaptive Card JSON payload is generated and stored in the notification audit with deliveryStatus="Previewed", and the JSON parses against the Adaptive Card schema.
13. **AC-REM-13 (Adaptive Card actions)** Given a generated Adaptive Card for a "Session ending soon" reminder, When inspected, Then it contains the actions "View booking" and "Release slot", and each action's target URL deep-links to the corresponding page in the web application.
14. **AC-REM-14 (notification center)** Given I have 3 unread in-app notifications across booking confirmation, pre-session reminder, and session ended, When I open the notification center, Then I see all 3 notifications listed with channel indicator, timestamp, linked booking/session/charger, and an unread badge count of 3.
15. **AC-REM-15 (mark read)** Given I have an unread in-app notification, When I mark it read, Then its readState becomes true, the unread badge decrements by 1, and the change is persisted.
16. **AC-REM-16 (notification audit endpoint — admin)** Given I am Admin and 5 notifications were generated in the last hour across in-app, email, and Teams channels, When I call the notification audit/history endpoint, Then I receive 5 records each with triggerEvent, audienceUserId, channel, timing, payload reference, and deliveryStatus.
17. **AC-REM-17 (cross-channel consistency)** Given a "Session ending soon" trigger fires for my booking, When the resulting notification records are inspected across the in-app, email, and Teams channels, Then all three records share the same triggerEvent, the same audienceUserId, the same linked bookingId, and timing within ±2 seconds.
18. **AC-REM-18 (eight reminder templates exist)** Given the reminder template registry is queried, When listed, Then it returns exactly the eight templates from FR-REM-017 (Booking confirmation, Session starting soon, Booking grace period warning, Charging session ending soon, Charging session ended, Slot release prompt, Auto-release/no-show notification, Admin/security intervention alert).

### 4.5 Reporting and Sustainability Dashboard — Acceptance Criteria

1. **AC-REP-01** Given 5 completed sessions totalling 32.5 kWh exist, When the reporting dashboard loads, Then "Total energy consumed" = 32.5 kWh and "Total sessions" = 5.
2. **AC-REP-02** Given total kWh = 32.5 and emission factor = 0.85, When the dashboard loads, Then "Estimated CO₂ savings" = 27.625 kg and the factor 0.85 is visible.
3. **AC-REP-03** Given some sessions are simulator-sourced, When the dashboard loads, Then a "Based on simulated demo data" label is visible on the affected widgets.
4. **AC-REP-04** Given I filter by NEX Tower for last 24h, When the filter applies, Then only NEX Tower data within 24h is shown.
5. **AC-REP-05** Given there are zero sessions in the selected window, When the dashboard loads, Then each metric shows `0` (or "No data") without errors.
6. **AC-REP-06** Given chargers reported `Faulted` events, When the dashboard loads, Then the count of faulted events is displayed and matches telemetry count.

### 4.6 Responsible AI Layer — Acceptance Criteria

1. **AC-AI-01 (grounding)** Given the AI insight panel loads with data available, When it renders, Then each numeric mentioned in the NL summary matches a value returned by a reporting endpoint.
2. **AC-AI-02 (simulated label)** Given underlying data has at least one event with source=Simulator, When AI output is rendered, Then a "Based on simulated demo data" label is visible.
3. **AC-AI-03 (low confidence)** Given fewer than 10 sessions exist in the input window, When AI forecasting is requested, Then the response has confidence="Low" and contains no point forecasts.
4. **AC-AI-04 (no fabrication)** Given the AI response is parsed, When numerics are extracted, Then every numeric is present in the response's `grounding` block.
5. **AC-AI-05 (anomaly flagging)** Given a session has energy ≥ 3× average, When AI runs, Then it returns an anomaly entry referencing that session ID.
6. **AC-AI-06 (no data)** Given there are zero sessions in the system, When AI summary is requested, Then it returns "No charging activity recorded in the selected period." and no fabricated numbers.

### 4.7 Authentication and User Context — Acceptance Criteria

1. **AC-AUTH-01** Given I select user "Alice (Employee)" on the login screen, When I sign in, Then I land on the Employee dashboard and my role context is set to Employee.
2. **AC-AUTH-02** Given I am authenticated as Employee, When I call an admin-only endpoint (e.g., charger status change), Then the response is HTTP 403.
3. **AC-AUTH-03** Given I am unauthenticated, When I try to access the dashboard, Then I am redirected to the login screen.
4. **AC-AUTH-04** Given I am authenticated as Security, When I view the dashboard, Then admin actions (manual release, status change) are visible in the UI.

---

## 11. End-to-End MVP Demo Journey

The full system MUST satisfy the following 15-step end-to-end scenario:

1. Employee opens the dashboard on a mobile-sized viewport.
2. Employee sees charger availability across NEX Tower and NEXTERACOM, colour-coded by status.
3. Employee selects an `Available` charger.
4. Employee books a time slot of up to 2 hours; the 2h fair-use rule is visible.
5. The system validates fair-use rules (no overlap, ≤2h, no other active booking) and confirms the booking.
6. The selected charger transitions to `Reserved`.
7. A simulated `StartTransaction` OCPP-style event is ingested and starts the charging transaction.
8. The charger transitions to `Charging` on the dashboard within 5 seconds.
9. Simulated `MeterValues` events update the session's cumulative energy consumption, visible on the dashboard.
10. The user receives an in-app end-of-session reminder before the booking endTime.
11. A `StopTransaction` event ends the charging session; session moves to `Completed`.
12. The charger transitions back to `Available`.
13. The reporting and sustainability dashboard updates with the new session's energy, utilization, and CO₂ estimate, with "Based on simulated demo data" visible.
14. The AI insight panel generates a grounded NL summary, forecast, or recommendation referencing the new data, with a confidence label.
15. Management/jury view the dashboards and AI insights demonstrating fairness, automation, operational visibility, sustainability reporting, and responsible AI.

---

## 12. Assumptions

1. Employees authenticate before booking; auth is simplified (mock login or role selector with seeded users).
2. Charger registry and IDs are fixed and seeded at start (NEX-TOWER-CH-01..N, NEXTERACOM-CH-01..M).
3. One connector per charger for the MVP; no compatibility matching.
4. OCPP-style telemetry is simulated; telemetry follows realistic charger lifecycle concepts.
5. MeterValues are produced by the simulator or a pre-recorded fallback script.
6. No payment or billing integration.
7. CO₂ savings use a fixed coefficient — provisional value **0.85 kgCO₂/kWh** (configurable, displayed alongside the metric).
8. Real-time updates use either polling (e.g., every 3–5s) or SignalR/WebSocket — final choice by Solution Architect.
9. AI layer may use accumulated MVP data and/or generated demo data; insights derived from simulator data are labelled.
10. Mobile usage is expected and prioritised in employee-facing UI.
11. **Default grace period for no-show = 15 minutes** (configurable).
12. **Default pre-session reminder lead time = 10 minutes**; **session-ending reminder = 10 minutes before end** (configurable).
13. **Default session duration on booking screen = 60 minutes**; user can adjust up to 120 minutes.
14. Bookings can only be created for today (same-day forward booking) in the MVP — to be confirmed.
15. Simulated user identity for demo: a small set of seeded users covering all five roles (Employee, Security, Facilities/Admin, ESG, Management).
16. All datetimes are stored in UTC and displayed in the local timezone (Mauritius, UTC+4).
17. Booking attempts that fail validation are logged for reporting (failed booking count).
18. In-app notifications appear via a persistent **notification center** (list with read/unread state) and may additionally surface as a transient toast/snackbar for high-severity events. Final UI pattern to be agreed with the Frontend Developer.
19. The MVP must demonstrate the multi-channel notification design even if live email/Teams delivery is not available; this is achieved through realistic payload generation persisted in the notification audit/history (BR-018, FR-REM-011, FR-REM-012).
20. The eight reminder templates from brief Section 15 are implemented as a single registry shared across all three channels (in-app, email, Teams) — see FR-REM-017.
21. Default grace period warning lead time = **5 minutes after booking start** (10 minutes before auto-release with the 15-minute grace period). Configurable.
22. Default thresholds for admin/security intervention alerts: repeated no-shows = **≥ 2 NoShow bookings in 7 days**; late release = session active beyond booking endTime + grace period; charger fault = immediate. Configurable.
23. Notification preferences (per-user opt-in/opt-out, quiet hours) are NOT in scope for the MVP — see Open Questions Q13.
24. Email delivery, if implemented, uses an SMTP/mock provider (e.g., MailHog, Ethereal, or local relay). Final choice by Solution Architect.
25. Teams delivery, if implemented, uses Incoming Webhooks, Power Automate, or Microsoft Graph — final choice by Solution Architect based on tenant access available on the day.

---

## 13. Open Questions

- **Q1 — Grace period duration.** Why it matters: directly affects when auto-release triggers and impacts demo timing. Provisional answer: **15 minutes**.
- **Q2 — CO₂ emission factor value.** Why it matters: visible to ESG/management and used in headline sustainability metric. Provisional answer: **0.85 kgCO₂/kWh** (a commonly cited fossil-grid factor). Confirm preferred value with sustainability lead.
- **Q3 — Number of chargers per location.** Why it matters: drives seed data and dashboard layout. Provisional answer: **4 chargers per location** (8 total) to keep the dashboard demo-friendly.
- **Q4 — Same-day vs future-day bookings.** Why it matters: future-day booking adds calendar complexity and changes overlap-validation surface. Provisional answer: **same-day only for MVP**.
- **Q5 — Security override of 2h limit without justification capture.** Why it matters: audit/fairness story. Provisional answer: **reason is mandatory** for any override.
- **Q6 — AI model/provider.** Why it matters: drives latency, cost, and grounding implementation. Provisional answer: **a hosted LLM via Azure OpenAI** wrapped in a grounded prompt that injects metric values; final choice by Solution Architect.
- **Q7 — Real-time mechanism (polling vs SignalR vs WebSocket).** Why it matters: complexity vs demo polish. Provisional answer: **3–5 second polling for MVP** as the safest demo path; SignalR optional if time permits.
- **Q8 — Can a user release a Confirmed (not yet Active) booking, or only cancel?** Provisional answer: **Confirmed → Cancel; Active → Release**.
- **Q9 — Does a booking-extension flow exist in the MVP, or only override?** Provisional answer: **admin override only; no self-service extension** in MVP.
- **Q10 — Are notifications retained after the session ends and for how long?** Provisional answer: **retained for the demo session; no purge logic implemented**.
- **Q11 — Does the simulator run continuously in the background or only on demand?** Provisional answer: **on-demand, triggered from a demo control panel**, plus a recorded fallback scenario.
- **Q12 — Are connector IDs surfaced in the UI or simplified away?** Provisional answer: **simplified — one connector per charger; connector ID exists in the data model but is not surfaced in the employee UI**.
- **Q13 — Notification preferences / opt-out / quiet hours.** Why it matters: the brief lists notification channels but does not state whether users can opt out, mute, or set quiet hours. This affects whether a preferences screen is needed. Provisional answer: **not in MVP — all configured channels fire for all relevant users; preferences deferred post-hackathon.**
- **Q14 — Email delivery provider.** Why it matters: drives configuration and demo reliability. Provisional answer: **SMTP/mock provider (e.g., MailHog/Ethereal) if SMTP available; otherwise payload-only preview persisted in notification audit.** Final choice by Solution Architect.
- **Q15 — Notification retention period.** Why it matters: data lifecycle and notification center scroll length. Provisional answer: **retained for the demo session; no purge logic implemented** (consistent with prior Q10 — superseded for clarity). Long-term retention deferred post-hackathon.
- **Q16 — Microsoft Teams delivery mechanism.** Why it matters: webhook vs Power Automate vs Graph affect setup time and what actions are executable inside Teams vs deep-linking back to the app. Provisional answer: **Incoming Webhook for the demo if available; otherwise Adaptive Card JSON payload preview persisted in notification audit. Adaptive Card actions deep-link back to the web app per FR-REM-013.**
- **Q17 — Auto-dismiss / acknowledgment rules for in-app notifications.** Why it matters: UX behavior and "Notification acknowledgment rate" metric (FR-REP-015). Provisional answer: **manual mark-read only for MVP; no auto-dismiss timer; critical-severity notifications remain visible until acknowledged.**
- **Q18 — Rate limiting per user / per channel (max one notification per minute).** Why it matters: avoids spamming users when multiple triggers fire in close succession. The brief does not specify a rate limit. Provisional answer: **no rate limit in MVP; cross-channel consistency (BR-019) prevents duplicate intent within a single trigger but does not throttle distinct triggers.**
- **Q19 — Repeated no-show threshold value and window.** Why it matters: triggers admin intervention alert (FR-REM-010, BR-021). Provisional answer: **≥ 2 NoShow bookings within 7 days, configurable.** Confirm with operations.

---

## 14. Out of Scope (Confirmation)

Restated from the use-case brief, section 9 — Out of Scope:

- Real OCPP protocol implementation.
- Physical charger hardware integration.
- SMS or mobile push notification delivery.
- Fully production-grade email or Microsoft Teams notification infrastructure. Live email/Teams delivery is recommended if feasible; otherwise the MVP demonstrates the design through realistic payload generation persisted in the notification audit/history (see FR-REM-011, FR-REM-012, BR-018).
- Notification preferences screen, opt-out, quiet hours, or per-user channel selection (see Q13).
- Payment processing or billing per charging session.
- Integration with HR systems or employee directories beyond basic authenticated identity.
- Native mobile application (iOS/Android).
- Multi-tenant or multi-organization support.
- Fleet or vehicle management.
- Real-time grid pricing.
- Dynamic tariff adjustment.
- Complex vehicle-to-charger compatibility matching.

---

## 15. Traceability

| Feature group | FR IDs | Brief sections |
|---|---|---|
| Slot Booking | FR-BOOK-001..012 | 7.1, 9, 10, 13 |
| Real-Time Availability Dashboard | FR-DASH-001..007 | 7.2, 9, 15.1 |
| OCPP-Style Consumption Capture | FR-OCPP-001..010 | 7.3, 12, 13 |
| Smart Reminders and Slot Release | FR-REM-001..018 | 7.4, 9, 14, 15, 16, 17, 19 |
| Reporting and Sustainability Dashboard | FR-REP-001..016 | 7.5, 9, 16 |
| Responsible AI Layer | FR-AI-001..011 | 7.6, 10, 16 |
| Authentication and User Context | FR-AUTH-001..005 | 5, 9, 11, 15 |
| Business Rules (cross-cutting) | BR-001..022 | 7.1, 7.2, 7.3, 7.4, 10, 15, 16 |
| Demo Journey | Section 11 | 8 |

# Requirements Traceability Matrix (RTM) — AI-Powered EV Charging Orchestration Platform

| Field | Value |
|---|---|
| **Document purpose** | Trace business goals → functional requirements → user stories → acceptance criteria → test coverage for the hackathon MVP, with priority and status. Single scannable artifact for PMs, leads, QA, and jury. |
| **Source documents** | `.claude/docs/use-case-brief.md` (BRD), `.claude/docs/functional-requirements.md` (FRs / BRs / ACs), `.claude/docs/backlog-structure.md` (Epics / Features / User Stories). |
| **Date** | 2026-05-22 |
| **Owner** | Product Analyst |
| **Status** | Draft v1.0 — Hackathon MVP |

---

## How to use this matrix

- Start with the consolidated table at the bottom ("Full Traceability Matrix") for the at-a-glance view used by PMs/jury.
- Use Section 1 to confirm every business goal has at least one FR; Section 2 to confirm every FR has at least one user story; Section 3 to confirm every user story has explicit acceptance criteria.
- QA fills the "Test Case IDs" column in Section 4 / Full table with real TC IDs (placeholders use the pattern `TC-US-###-NN`).
- Status starts as "Not Started" for every story; update as work moves through New → Active → Resolved → Done on the Azure DevOps board.

---

## 1. Business Goals → Functional Requirements

Source: use-case-brief Section 8 (Main Business Goals); functional-requirements Sections 4.1–4.11.

| Goal ID | Business Goal | Supporting FR IDs | Priority |
|---|---|---|---|
| BG-1 | Replace manual/informal charger coordination with a transparent digital system | FR-BOOK-001, FR-BOOK-002, FR-BOOK-007, FR-BOOK-011, FR-DASH-001, FR-DASH-002, FR-AUTH-001 | P0 |
| BG-2 | Ensure equitable access and maximize charger availability | FR-BOOK-003, FR-BOOK-004, FR-BOOK-005, FR-BOOK-006, FR-BOOK-008, FR-REM-005 | P0 |
| BG-3 | Enforce maximum 1 hour per user per day (BR002) | FR-BOOK-002, FR-BOOK-003, FR-BOOK-005, FR-BOOK-006 | P0 |
| BG-4 | Reduce operational burden on Workplace and Security teams | FR-BOOK-009, FR-BOOK-010, FR-BOOK-012, FR-DASH-006, FR-REM-010, FR-ADMIN-001, FR-ADMIN-002 | P1 |
| BG-5 | Provide real-time visibility into charger status across both locations | FR-DASH-001, FR-DASH-002, FR-DASH-003, FR-DASH-004, FR-DASH-005, FR-DASH-007, FR-OCPP-001, FR-OCPP-002, FR-OCPP-003 | P0 |
| BG-6 | Capture structured charging session and energy consumption data | FR-OCPP-004, FR-OCPP-005, FR-OCPP-006, FR-BOOK-013, FR-OCPP-014 | P0 |
| BG-7 | Map usage to eligible EV users and vehicle make/model | FR-USER-001, FR-USER-005, FR-USER-006, FR-BOOK-013, FR-OCPP-014, FR-REP-017 | P1 |
| BG-8 | Provide ESG-ready sustainability and usage reporting | FR-REP-001 through FR-REP-017 | P0/P1 |
| BG-9 | Demonstrate practical, explainable, responsible AI | FR-AI-001 through FR-AI-011 | P2 |
| BG-10 | Establish OCPP-ready foundation for future real charger integration | FR-OCPP-001 through FR-OCPP-014 | P0 |
| BG-11 | Deliver a polished end-to-end MVP demo within the hackathon timeline | All P0 FRs (see priority columns below) | P0 |
| BG-12 | Privacy & RBAC governance | FR-PRIV-001..005, FR-AUTH-003, FR-AUTH-004, FR-AUTH-006, FR-USER-002, FR-AUDIT-001..005 | P0 |

---

## 2. Functional Requirements → User Stories

Source: functional-requirements Section 4; backlog-structure Section 3.

| FR ID | FR Title | Priority | User Story ID(s) |
|---|---|---|---|
| FR-BOOK-001 | List available chargers | P0 | US-014 |
| FR-BOOK-002 | Create booking | P0 | US-007 |
| FR-BOOK-003 | Enforce 1h max duration per day | P0 | US-007 |
| FR-BOOK-004 | Prevent overlapping bookings on same charger | P0 | US-007 |
| FR-BOOK-005 | One active booking per user | P0 | US-007 |
| FR-BOOK-006 | Display 1h fair-use rule pre-confirmation | P0 | US-007 |
| FR-BOOK-007 | Cancel booking | P0 | US-009 |
| FR-BOOK-008 | Release booking | P1 | US-010 |
| FR-BOOK-009 | Admin/Security/Workplace manual release | P1 | US-011 |
| FR-BOOK-010 | Admin/Security/Workplace 1h override | P1 | US-012 |
| FR-BOOK-011 | View my bookings | P0 | US-008 |
| FR-BOOK-012 | View today's bookings (operational) | P1 | US-013 |
| FR-BOOK-013 | Capture vehicle make/model on booking | P1 | US-007, US-004 |
| FR-DASH-001 | Show all chargers with status | P0 | US-014 |
| FR-DASH-002 | Filter by location | P0 | US-014 |
| FR-DASH-003 | Mobile-first layout | P0 | US-014 |
| FR-DASH-004 | Real-time / near-real-time updates | P0 | US-014, US-016 |
| FR-DASH-005 | Show active session info | P1 | US-014 |
| FR-DASH-006 | Admin charger status control | P1 | US-015 |
| FR-DASH-007 | Status driven by backend only | P0 | US-014 |
| FR-OCPP-001 | Station status retrieval | P0 | US-016 |
| FR-OCPP-002 | Single station retrieval | P0 | US-016 |
| FR-OCPP-003 | Charger status synchronization | P0 | US-016 |
| FR-OCPP-004 | Active session retrieval | P0 | US-017 |
| FR-OCPP-005 | Session details and meter values | P0 | US-017 |
| FR-OCPP-006 | Historical session retrieval | P0 | US-017 |
| FR-OCPP-007 | Booking-to-RFID/tag authorization | P0 | US-018 |
| FR-OCPP-008 | Authorization revocation | P0 | US-019 |
| FR-OCPP-009 | Active authorization listing | P0 | US-019 |
| FR-OCPP-010 | CSMS sync failure handling | P0 | US-018 |
| FR-OCPP-011 | Maintenance block via CSMS | P1 | US-020 |
| FR-OCPP-012 | Optional remote start | P2 | TBD |
| FR-OCPP-013 | Optional remote stop | P2 | TBD |
| FR-OCPP-014 | Capture vehicle make/model on session | P1 | US-017 |
| FR-REM-001 | Pre-session reminder | P1 | US-022 |
| FR-REM-002 | Session-ending reminder | P1 | US-022 |
| FR-REM-003 | Session-ended alert | P1 | US-022 |
| FR-REM-004 | Release prompt | P1 | US-022 |
| FR-REM-005 | Auto-release on no-show | P1 | US-022 |
| FR-REM-006 | Admin manual release confirmation | P1 | US-011, US-022 |
| FR-REM-007 | List notifications | P1 | US-021 |
| FR-REM-008 | Booking confirmation reminder | P1 | US-021, US-022 |
| FR-REM-009 | Booking grace period warning | P1 | US-022 |
| FR-REM-010 | Admin/security/workplace intervention alert | P1 | US-023 |
| FR-REM-011 | Email notification delivery or preview | P1 | US-024 |
| FR-REM-012 | Microsoft Teams Adaptive Card delivery or preview | P1 | US-024 |
| FR-REM-013 | Teams Adaptive Card actions | P1 | US-024 |
| FR-REM-014 | Notification center / persistent in-app history | P1 | US-021 |
| FR-REM-015 | Mark notification read | P1 | US-021 |
| FR-REM-016 | Notification audit/history endpoint | P1 | US-025 |
| FR-REM-017 | Reminder template registry | P1 | US-022 |
| FR-REM-018 | Cross-channel consistency | P1 | US-022, US-024 |
| FR-REM-019 | Adaptive Card preview persistence | P1 | US-024, US-025 |
| FR-REP-001 | Total charging sessions | P0 | US-026 |
| FR-REP-002 | Total energy consumed (kWh) | P0 | US-026 |
| FR-REP-003 | Average session duration | P1 | US-027 |
| FR-REP-004 | Average energy per session | P1 | US-027 |
| FR-REP-005 | Charger utilization rate | P1 | US-027 |
| FR-REP-006 | Peak charging hours | P1 | US-027 |
| FR-REP-007 | Most-used chargers | P1 | US-027 |
| FR-REP-008 | Location comparison | P1 | US-027 |
| FR-REP-009 | Estimated CO2 savings | P0 | US-026 |
| FR-REP-010 | Failed / cancelled / released bookings | P1 | US-027 |
| FR-REP-011 | Faulted / unavailable charger events | P1 | US-027 |
| FR-REP-012 | Label simulated data | P0 | US-026 |
| FR-REP-013 | Date range and location filters | P1 | US-026, US-027 |
| FR-REP-014 | Notification delivery metrics | P1 | US-028 |
| FR-REP-015 | Notification acknowledgment rate | P2 | US-028 |
| FR-REP-016 | No-show rate after reminders | P1 | US-028 |
| FR-REP-017 | Usage by vehicle category | P2 | US-027 |
| FR-AI-001 | Demand forecasting | P2 | US-029 |
| FR-AI-002 | Pattern detection | P2 | US-029 |
| FR-AI-003 | Intelligent NL reporting | P2 | US-029 |
| FR-AI-004 | Operational recommendations | P2 | US-029 |
| FR-AI-005 | Anomaly flagging | P2 | US-029 |
| FR-AI-006 | NL insight generation | P2 | US-029 |
| FR-AI-007 | Grounding rule | P2 | US-029 |
| FR-AI-008 | Simulated data disclosure | P2 | US-029 |
| FR-AI-009 | Low-confidence disclosure | P2 | US-029 |
| FR-AI-010 | No fabricated metrics | P2 | US-029 |
| FR-AI-011 | AI-assisted notification phrasing | P2 | US-029 |
| FR-AUTH-001 | Simplified login | P0 | US-001 |
| FR-AUTH-002 | Session context | P0 | US-001 |
| FR-AUTH-003 | Role-based UI | P0 | US-006 |
| FR-AUTH-004 | Role-based API authorization | P0 | US-006 |
| FR-AUTH-005 | Logout | P1 | US-001 |
| FR-AUTH-006 | Eligibility & privacy gate on protected actions | P0 | US-002, US-005 |
| FR-PRIV-001 | Privacy notice retrieval | P0 | US-005 |
| FR-PRIV-002 | Required content of privacy notice | P0 | US-005 |
| FR-PRIV-003 | Acknowledgement before first booking | P0 | US-005 |
| FR-PRIV-004 | Persist acknowledgement status and timestamp | P0 | US-005 |
| FR-PRIV-005 | Re-acknowledgement on version change | P1 | US-005 |
| FR-AUDIT-001 | Record critical actions | P0 | US-032 |
| FR-AUDIT-002 | Audit entry shape | P0 | US-032 |
| FR-AUDIT-003 | Audit log read access | P0 | US-032 |
| FR-AUDIT-004 | Immutability | P0 | US-032 |
| FR-AUDIT-005 | Audit log filtering | P1 | US-032 |
| FR-ADMIN-001 | Create maintenance block | P1 | US-020 |
| FR-ADMIN-002 | Remove maintenance block | P1 | US-020 |
| FR-ADMIN-003 | Maintenance block conflict handling | P1 | US-030 |
| FR-USER-001 | Eligible EV user registry | P0 | US-002 |
| FR-USER-002 | Eligibility gate on booking | P0 | US-002 |
| FR-USER-003 | Admin CRUD on eligible EV users | P1 | US-003 |
| FR-USER-004 | Read-only access for operational roles | P1 | US-003 |
| FR-USER-005 | Self-view of own eligibility | P1 | US-004 |
| FR-USER-006 | Editable vehicle make/model | P1 | US-004 |

---

## 3. User Stories → Acceptance Criteria

One row per acceptance criterion. AC IDs follow the pattern `AC-US-###-NN` (assigned here for traceability).

| US ID | US Title | AC ID | Acceptance Criterion (summary) |
|---|---|---|---|
| US-001 | Simplified login + role | AC-US-001-01 | Seeded user login stores userId and role in session |
| US-001 | | AC-US-001-02 | Authenticated requests carry userId and role server-side |
| US-001 | | AC-US-001-03 | Standard User attempting admin override returns HTTP 403 |
| US-001 | | AC-US-001-04 | Logout ends session and returns to login screen |
| US-002 | Eligible EV user registry | AC-US-002-01 | Registry query returns userId, EID, badgeId, eligibilityStatus, vehicleMake, vehicleModel, role, siteContext |
| US-002 | | AC-US-002-02 | User not on registry attempting to book returns HTTP 403 `NotEligible` |
| US-002 | | AC-US-002-03 | Inactive/Suspended user booking attempt returns HTTP 403 `NotEligible` |
| US-003 | Admin CRUD eligible users | AC-US-003-01 | Admin create new eligible user persists record and audit-logs |
| US-003 | | AC-US-003-02 | Admin update/suspend persists change and audit-logs |
| US-003 | | AC-US-003-03 | Security/Workplace see read-only data |
| US-003 | | AC-US-003-04 | Standard User CRUD attempt returns HTTP 403 |
| US-004 | Self vehicle make/model | AC-US-004-01 | Standard User profile shows eligibility, EID, badge, vehicle make/model, privacy ack |
| US-004 | | AC-US-004-02 | Edit vehicle make/model persists and audit-logs |
| US-005 | Privacy acknowledgement | AC-US-005-01 | Unacknowledged user booking attempt returns HTTP 403 `PrivacyNotAcknowledged` and redirects to notice |
| US-005 | | AC-US-005-02 | Acknowledge action persists userId, version, timestamp |
| US-005 | | AC-US-005-03 | Already-acknowledged user is not prompted again |
| US-005 | | AC-US-005-04 | Privacy notice version change forces re-acknowledgement on next booking |
| US-005 | | AC-US-005-05 | Displayed notice explains data stored, why, who accesses it, how it is used |
| US-006 | RBAC enforcement | AC-US-006-01 | Standard User releasing another user's booking returns HTTP 403 |
| US-006 | | AC-US-006-02 | Operator release with reason succeeds and audit-logs |
| US-006 | | AC-US-006-03 | Non-Admin mutating eligible-user registry returns HTTP 403 |
| US-006 | | AC-US-006-04 | Standard User audit-log access denied |
| US-006 | | AC-US-006-05 | UI hides admin/security capabilities for Standard User |
| US-007 | Create booking 1h fair-use | AC-US-007-01 | Eligible, privacy-acknowledged user selecting Available charger with end-start <= 60 min today creates Confirmed booking |
| US-007 | | AC-US-007-02 | Duration > 60 min rejected with duration error |
| US-007 | | AC-US-007-03 | Overlapping window on same charger rejected with overlap error |
| US-007 | | AC-US-007-04 | Existing Pending/Confirmed/Active booking by user rejected with `AlreadyHasActiveBooking` |
| US-007 | | AC-US-007-05 | Vehicle make/model captured (pre-filled from eligible-user record, editable) |
| US-007 | | AC-US-007-06 | Booking form displays 1h-per-user-per-day rule before submission |
| US-007 | | AC-US-007-07 | startTime in the past rejected |
| US-008 | View my bookings | AC-US-008-01 | My Bookings shows state (Pending/Confirmed/Active/Completed/Cancelled/Released/NoShow/Overridden) |
| US-008 | | AC-US-008-02 | Booking detail shows charger, location, start/end, state, vehicle, csmsSyncStatus |
| US-009 | Cancel booking | AC-US-009-01 | Confirmed booking cancel moves to Cancelled and triggers CSMS revoke |
| US-009 | | AC-US-009-02 | Active booking cancel attempt rejected (must use Release) |
| US-010 | Release Active booking | AC-US-010-01 | Active booking release moves to Released, charger Available, CSMS revoke called |
| US-010 | | AC-US-010-02 | Release attempt on non-Active booking rejected per BR-011 |
| US-011 | Operator manual release | AC-US-011-01 | Operator release with reason moves to Overridden, charger Available, CSMS revoke called, audit-logged |
| US-011 | | AC-US-011-02 | Empty reason rejected |
| US-011 | | AC-US-011-03 | Affected user receives notification with reason |
| US-012 | Operator 1h override | AC-US-012-01 | Operator extending/creating > 1h with reason accepted and audit-logged |
| US-012 | | AC-US-012-02 | Standard User attempt returns HTTP 403 |
| US-013 | Today's bookings | AC-US-013-01 | Operator sees today's bookings across both locations with state, charger, user, time, vehicle |
| US-013 | | AC-US-013-02 | Standard User access returns HTTP 403 |
| US-014 | Real-time dashboard | AC-US-014-01 | Dashboard shows each charger with status, location, connector |
| US-014 | | AC-US-014-02 | Mobile (>=320px) cards readable, no horizontal scroll, large touch targets |
| US-014 | | AC-US-014-03 | Location filter scopes display correctly |
| US-014 | | AC-US-014-04 | Backend status change reflects in dashboard within 5 seconds |
| US-014 | | AC-US-014-05 | Charging charger shows transactionId, elapsed, energyKWh, vehicle (masked for non-admin) |
| US-014 | | AC-US-014-06 | Status comes from backend only (no local UI-only changes) |
| US-015 | Charger status control | AC-US-015-01 | Operator setting status with reason updates registry and audit-logs |
| US-015 | | AC-US-015-02 | Blocked for Maintenance triggers `PUT /api/stations/:id/connectors/:n/block` |
| US-015 | | AC-US-015-03 | Standard User attempt returns HTTP 403 |
| US-016 | CSMS station status | AC-US-016-01 | `GET /api/stations` poll at default 5s updates local charger registry |
| US-016 | | AC-US-016-02 | `GET /api/stations/:identity` maps connector status onto local registry |
| US-016 | | AC-US-016-03 | CSMS unreachable: error logged, last-known status kept, surfaced for admin |
| US-017 | CSMS sessions/meter | AC-US-017-01 | `GET /api/sessions/active` maps session to local booking by idTag/station/connector |
| US-017 | | AC-US-017-02 | `GET /api/sessions/:id` persists energyKWh and final timestamps on ChargingSession |
| US-017 | | AC-US-017-03 | `GET /api/sessions?from=&to=&...` returns historical sessions for reports |
| US-017 | | AC-US-017-04 | CSMS session not mappable to booking flagged for operational review |
| US-018 | CSMS RFID/tag auth on confirm | AC-US-018-01 | `POST /api/auth/tags` 2xx -> csmsSyncStatus `Authorized` |
| US-018 | | AC-US-018-02 | Non-2xx/timeout -> csmsSyncStatus `AuthorizationFailed`, user error banner, intervention alert |
| US-018 | | AC-US-018-03 | AuthorizationFailed not counted as Reserved/Available capacity until resolved |
| US-019 | CSMS auth revoke | AC-US-019-01 | `DELETE /api/auth/tags/:idTag` 2xx -> csmsSyncStatus `Revoked` |
| US-019 | | AC-US-019-02 | Revoke failure surfaced and audit-logged; admin reconciles via `GET /api/auth/tags?active=true` |
| US-020 | Maintenance block via CSMS | AC-US-020-01 | Block create calls `PUT .../block`, charger becomes Blocked for Maintenance |
| US-020 | | AC-US-020-02 | Block remove calls `DELETE .../block`, charger returns to Available |
| US-020 | | AC-US-020-03 | Block overlapping Confirmed/Active booking requires explicit override with reason and notifies user |
| US-021 | In-app notification center | AC-US-021-01 | Booking confirmation notification appears with charger, location, time, vehicle |
| US-021 | | AC-US-021-02 | Notifications listed with timestamp, channel, read state |
| US-021 | | AC-US-021-03 | Mark Read updates unread badge |
| US-021 | | AC-US-021-04 | Notification links back to bookingId/sessionId/chargerId |
| US-022 | Reminder templates lifecycle | AC-US-022-01 | Booking confirmation triggers notification |
| US-022 | | AC-US-022-02 | 10 min before start triggers Pre-session reminder |
| US-022 | | AC-US-022-03 | start+5 min with no active CSMS session triggers Grace-period warning |
| US-022 | | AC-US-022-04 | start+15 min with no active session -> NoShow, session Expired, CSMS revoke, charger Available, Auto-release notification |
| US-022 | | AC-US-022-05 | 10 min before end triggers Session-ending reminder |
| US-022 | | AC-US-022-06 | CSMS session Completed triggers Session-ended alert and Move-vehicle prompt |
| US-022 | | AC-US-022-07 | Session past end+grace triggers Slot-release prompt |
| US-022 | | AC-US-022-08 | Charger fault during Active session triggers Critical notification |
| US-023 | Intervention alerts | AC-US-023-01 | >=2 NoShow in 7 days triggers Intervention alert |
| US-023 | | AC-US-023-02 | Session past booking end+grace triggers Late-release alert |
| US-023 | | AC-US-023-03 | Charger Faulted during active session triggers Critical alert |
| US-024 | Email + Teams preview/live | AC-US-024-01 | Reminder trigger creates logical notification with channels in-app/email/Teams |
| US-024 | | AC-US-024-02 | Live delivery configured -> Sent; otherwise payload persisted and Previewed |
| US-024 | | AC-US-024-03 | Delivery failure -> Failed and visible in audit/history |
| US-024 | | AC-US-024-04 | Teams payload is valid Adaptive Card JSON parseable in admin view |
| US-025 | Notification audit/history view | AC-US-025-01 | Operator sees every notification with trigger, audience, channel, timing, payload ref, status |
| US-025 | | AC-US-025-02 | Preview shows persisted Teams/email payload exactly as generated |
| US-025 | | AC-US-025-03 | Standard User access returns HTTP 403 |
| US-026 | Core reporting (sessions/kWh/CO2) | AC-US-026-01 | Dashboard shows Total sessions, Total kWh, Estimated CO2 (factor visible) |
| US-026 | | AC-US-026-02 | Simulator-sourced data tiles show "Based on simulated demo data" label |
| US-026 | | AC-US-026-03 | Date range/location filters recompute metrics |
| US-027 | Additional reporting metrics | AC-US-027-01 | At least 8 metrics rendered and accurate from seeded/CSMS data |
| US-027 | | AC-US-027-02 | Reporting/ESG Viewer sees read-only metrics; write controls hidden |
| US-028 | Notification + no-show metrics | AC-US-028-01 | Notification metrics shows counts by channel and delivery status |
| US-028 | | AC-US-028-02 | No-show metrics shows rate segmented by whether pre-session reminder was generated |
| US-029 | Responsible AI Insights | AC-US-029-01 | AI panel shows at least one insight per category with grounding block citing records/metrics |
| US-029 | | AC-US-029-02 | Simulator-sourced insights carry "Based on simulated demo data" label |
| US-029 | | AC-US-029-03 | <10 sessions in window -> low-confidence disclosure, no point forecasts |
| US-029 | | AC-US-029-04 | Grounding click links to underlying metric in reporting dashboard |
| US-029 | | AC-US-029-05 | No metric fabricated outside reporting endpoints |
| US-030 | Maintenance block conflict override | AC-US-030-01 | Block overlapping booking requires explicit override with reason before save |
| US-030 | | AC-US-030-02 | Override confirms: booking released, user notified, action audit-logged |
| US-031 | Admin booking on behalf | AC-US-031-01 | Admin/Workplace creates booking for eligible user with reason; user is owner; audit-logged |
| US-031 | | AC-US-031-02 | Cap-exceeded with reason allowed and audit-logged |
| US-031 | | AC-US-031-03 | User receives Booking-confirmation notification |
| US-032 | Audit log | AC-US-032-01 | Critical actions persist audit entry with id, timestamp, actor, role, action, entity, before/after, reason, source |
| US-032 | | AC-US-032-02 | Admin filters by date, actor, action type, entity type |
| US-032 | | AC-US-032-03 | Standard User access returns HTTP 403 |
| US-032 | | AC-US-032-04 | Edit/delete attempt rejected for any role |

---

## 4. User Stories → Test Coverage Placeholders

QA owns this column. Placeholder pattern: `TC-US-###-NN` (one TC per AC at minimum; QA may add edge-case TCs).

| US ID | # of ACs | Placeholder Test Case IDs |
|---|---|---|
| US-001 | 4 | TC-US-001-01 .. TC-US-001-04 |
| US-002 | 3 | TC-US-002-01 .. TC-US-002-03 |
| US-003 | 4 | TC-US-003-01 .. TC-US-003-04 |
| US-004 | 2 | TC-US-004-01 .. TC-US-004-02 |
| US-005 | 5 | TC-US-005-01 .. TC-US-005-05 |
| US-006 | 5 | TC-US-006-01 .. TC-US-006-05 |
| US-007 | 7 | TC-US-007-01 .. TC-US-007-07 |
| US-008 | 2 | TC-US-008-01 .. TC-US-008-02 |
| US-009 | 2 | TC-US-009-01 .. TC-US-009-02 |
| US-010 | 2 | TC-US-010-01 .. TC-US-010-02 |
| US-011 | 3 | TC-US-011-01 .. TC-US-011-03 |
| US-012 | 2 | TC-US-012-01 .. TC-US-012-02 |
| US-013 | 2 | TC-US-013-01 .. TC-US-013-02 |
| US-014 | 6 | TC-US-014-01 .. TC-US-014-06 |
| US-015 | 3 | TC-US-015-01 .. TC-US-015-03 |
| US-016 | 3 | TC-US-016-01 .. TC-US-016-03 |
| US-017 | 4 | TC-US-017-01 .. TC-US-017-04 |
| US-018 | 3 | TC-US-018-01 .. TC-US-018-03 |
| US-019 | 2 | TC-US-019-01 .. TC-US-019-02 |
| US-020 | 3 | TC-US-020-01 .. TC-US-020-03 |
| US-021 | 4 | TC-US-021-01 .. TC-US-021-04 |
| US-022 | 8 | TC-US-022-01 .. TC-US-022-08 |
| US-023 | 3 | TC-US-023-01 .. TC-US-023-03 |
| US-024 | 4 | TC-US-024-01 .. TC-US-024-04 |
| US-025 | 3 | TC-US-025-01 .. TC-US-025-03 |
| US-026 | 3 | TC-US-026-01 .. TC-US-026-03 |
| US-027 | 2 | TC-US-027-01 .. TC-US-027-02 |
| US-028 | 2 | TC-US-028-01 .. TC-US-028-02 |
| US-029 | 5 | TC-US-029-01 .. TC-US-029-05 |
| US-030 | 2 | TC-US-030-01 .. TC-US-030-02 |
| US-031 | 3 | TC-US-031-01 .. TC-US-031-03 |
| US-032 | 4 | TC-US-032-01 .. TC-US-032-04 |

---

## 5. Coverage Gaps

- **FR-OCPP-012 (Optional remote start)** and **FR-OCPP-013 (Optional remote stop)** — no dedicated user story in `backlog-structure.md`. Marked TBD. These are P2/optional gating in the brief and may be folded into US-011/US-022 operationally; create a dedicated story only if the demo journey requires remote control.
- All other business goals, FRs, and user stories have at least one downstream artifact identified.
- All listed user stories have explicit acceptance criteria sourced from `backlog-structure.md`.

No further gaps identified at this time.

---

## 6. Full Traceability Matrix (consolidated)

Columns: Business Goal | FR ID | FR Title | US ID | US Title | AC Count | Test Case IDs (placeholder) | Priority | Status

| Business Goal | FR ID | FR Title | US ID | US Title | AC Count | Test Case IDs (placeholder) | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| BG-1, BG-11, BG-12 | FR-AUTH-001 | Simplified login | US-001 | Simplified login + role | 4 | TC-US-001-01..04 | P0 | Not Started |
| BG-11, BG-12 | FR-AUTH-002 | Session context | US-001 | Simplified login + role | 4 | TC-US-001-01..04 | P0 | Not Started |
| BG-12 | FR-AUTH-003 | Role-based UI | US-006 | RBAC enforcement | 5 | TC-US-006-01..05 | P0 | Not Started |
| BG-12 | FR-AUTH-004 | Role-based API authorization | US-006 | RBAC enforcement | 5 | TC-US-006-01..05 | P0 | Not Started |
| BG-1 | FR-AUTH-005 | Logout | US-001 | Simplified login + role | 4 | TC-US-001-01..04 | P1 | Not Started |
| BG-12 | FR-AUTH-006 | Eligibility & privacy gate | US-002, US-005 | Eligible registry / Privacy ack | 3 / 5 | TC-US-002-01..03, TC-US-005-01..05 | P0 | Not Started |
| BG-7, BG-12 | FR-USER-001 | Eligible EV user registry | US-002 | Eligible EV user registry | 3 | TC-US-002-01..03 | P0 | Not Started |
| BG-2, BG-12 | FR-USER-002 | Eligibility gate on booking | US-002 | Eligible EV user registry | 3 | TC-US-002-01..03 | P0 | Not Started |
| BG-4, BG-7 | FR-USER-003 | Admin CRUD eligible users | US-003 | Admin CRUD eligible users | 4 | TC-US-003-01..04 | P1 | Not Started |
| BG-4 | FR-USER-004 | Read-only access (ops roles) | US-003 | Admin CRUD eligible users | 4 | TC-US-003-01..04 | P1 | Not Started |
| BG-7 | FR-USER-005 | Self-view of own eligibility | US-004 | Self vehicle make/model | 2 | TC-US-004-01..02 | P1 | Not Started |
| BG-7 | FR-USER-006 | Editable vehicle make/model | US-004 | Self vehicle make/model | 2 | TC-US-004-01..02 | P1 | Not Started |
| BG-12 | FR-PRIV-001 | Privacy notice retrieval | US-005 | Privacy acknowledgement | 5 | TC-US-005-01..05 | P0 | Not Started |
| BG-12 | FR-PRIV-002 | Required content of notice | US-005 | Privacy acknowledgement | 5 | TC-US-005-01..05 | P0 | Not Started |
| BG-12 | FR-PRIV-003 | Ack before first booking | US-005 | Privacy acknowledgement | 5 | TC-US-005-01..05 | P0 | Not Started |
| BG-12 | FR-PRIV-004 | Persist ack status/timestamp | US-005 | Privacy acknowledgement | 5 | TC-US-005-01..05 | P0 | Not Started |
| BG-12 | FR-PRIV-005 | Re-ack on version change | US-005 | Privacy acknowledgement | 5 | TC-US-005-01..05 | P1 | Not Started |
| BG-1, BG-11 | FR-BOOK-001 | List available chargers | US-014 | Real-time dashboard | 6 | TC-US-014-01..06 | P0 | Not Started |
| BG-1, BG-2, BG-3 | FR-BOOK-002 | Create booking | US-007 | Create booking 1h fair-use | 7 | TC-US-007-01..07 | P0 | Not Started |
| BG-2, BG-3 | FR-BOOK-003 | Enforce 1h max per day | US-007 | Create booking 1h fair-use | 7 | TC-US-007-01..07 | P0 | Not Started |
| BG-2 | FR-BOOK-004 | Prevent overlapping bookings | US-007 | Create booking 1h fair-use | 7 | TC-US-007-01..07 | P0 | Not Started |
| BG-2, BG-3 | FR-BOOK-005 | One active booking per user | US-007 | Create booking 1h fair-use | 7 | TC-US-007-01..07 | P0 | Not Started |
| BG-2, BG-3 | FR-BOOK-006 | Display 1h rule pre-confirm | US-007 | Create booking 1h fair-use | 7 | TC-US-007-01..07 | P0 | Not Started |
| BG-1 | FR-BOOK-007 | Cancel booking | US-009 | Cancel booking | 2 | TC-US-009-01..02 | P0 | Not Started |
| BG-2 | FR-BOOK-008 | Release booking | US-010 | Release Active booking | 2 | TC-US-010-01..02 | P1 | Not Started |
| BG-4 | FR-BOOK-009 | Operator manual release | US-011 | Operator manual release | 3 | TC-US-011-01..03 | P1 | Not Started |
| BG-4 | FR-BOOK-010 | Operator 1h override | US-012 | Operator 1h override | 2 | TC-US-012-01..02 | P1 | Not Started |
| BG-1 | FR-BOOK-011 | View my bookings | US-008 | View my bookings | 2 | TC-US-008-01..02 | P0 | Not Started |
| BG-4 | FR-BOOK-012 | View today's bookings (ops) | US-013 | Today's bookings | 2 | TC-US-013-01..02 | P1 | Not Started |
| BG-7 | FR-BOOK-013 | Capture vehicle on booking | US-007, US-004 | Booking / Self vehicle | 7 / 2 | TC-US-007-01..07, TC-US-004-01..02 | P1 | Not Started |
| BG-5 | FR-DASH-001 | Show chargers with status | US-014 | Real-time dashboard | 6 | TC-US-014-01..06 | P0 | Not Started |
| BG-5 | FR-DASH-002 | Filter by location | US-014 | Real-time dashboard | 6 | TC-US-014-01..06 | P0 | Not Started |
| BG-5 | FR-DASH-003 | Mobile-first layout | US-014 | Real-time dashboard | 6 | TC-US-014-01..06 | P0 | Not Started |
| BG-5 | FR-DASH-004 | Real-time updates | US-014, US-016 | Dashboard / CSMS stations | 6 / 3 | TC-US-014-01..06, TC-US-016-01..03 | P0 | Not Started |
| BG-5 | FR-DASH-005 | Active session info | US-014 | Real-time dashboard | 6 | TC-US-014-01..06 | P1 | Not Started |
| BG-4, BG-5 | FR-DASH-006 | Admin charger status control | US-015 | Charger status control | 3 | TC-US-015-01..03 | P1 | Not Started |
| BG-5 | FR-DASH-007 | Status driven by backend only | US-014 | Real-time dashboard | 6 | TC-US-014-01..06 | P0 | Not Started |
| BG-5, BG-10 | FR-OCPP-001 | Station status retrieval | US-016 | CSMS station status | 3 | TC-US-016-01..03 | P0 | Not Started |
| BG-5, BG-10 | FR-OCPP-002 | Single station retrieval | US-016 | CSMS station status | 3 | TC-US-016-01..03 | P0 | Not Started |
| BG-5, BG-10 | FR-OCPP-003 | Charger status sync | US-016 | CSMS station status | 3 | TC-US-016-01..03 | P0 | Not Started |
| BG-6, BG-10 | FR-OCPP-004 | Active session retrieval | US-017 | CSMS sessions/meter | 4 | TC-US-017-01..04 | P0 | Not Started |
| BG-6, BG-10 | FR-OCPP-005 | Session details & meter values | US-017 | CSMS sessions/meter | 4 | TC-US-017-01..04 | P0 | Not Started |
| BG-6, BG-8 | FR-OCPP-006 | Historical session retrieval | US-017 | CSMS sessions/meter | 4 | TC-US-017-01..04 | P0 | Not Started |
| BG-1, BG-10 | FR-OCPP-007 | Booking-to-RFID/tag auth | US-018 | CSMS auth on confirm | 3 | TC-US-018-01..03 | P0 | Not Started |
| BG-1, BG-10 | FR-OCPP-008 | Authorization revocation | US-019 | CSMS auth revoke | 2 | TC-US-019-01..02 | P0 | Not Started |
| BG-10 | FR-OCPP-009 | Active authorization listing | US-019 | CSMS auth revoke | 2 | TC-US-019-01..02 | P0 | Not Started |
| BG-10 | FR-OCPP-010 | CSMS sync failure handling | US-018 | CSMS auth on confirm | 3 | TC-US-018-01..03 | P0 | Not Started |
| BG-4, BG-10 | FR-OCPP-011 | Maintenance block via CSMS | US-020 | Maintenance block via CSMS | 3 | TC-US-020-01..03 | P1 | Not Started |
| BG-10 | FR-OCPP-012 | Optional remote start | TBD | TBD | TBD | TBD | P2 | Not Started |
| BG-10 | FR-OCPP-013 | Optional remote stop | TBD | TBD | TBD | TBD | P2 | Not Started |
| BG-7 | FR-OCPP-014 | Vehicle make/model on session | US-017 | CSMS sessions/meter | 4 | TC-US-017-01..04 | P1 | Not Started |
| BG-2 | FR-REM-001 | Pre-session reminder | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-2 | FR-REM-002 | Session-ending reminder | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-2 | FR-REM-003 | Session-ended alert | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-2 | FR-REM-004 | Release prompt | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-2 | FR-REM-005 | Auto-release on no-show | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-4 | FR-REM-006 | Admin manual release confirm | US-011, US-022 | Operator release / Reminders | 3 / 8 | TC-US-011-01..03, TC-US-022-01..08 | P1 | Not Started |
| BG-1 | FR-REM-007 | List notifications | US-021 | In-app notification center | 4 | TC-US-021-01..04 | P1 | Not Started |
| BG-1 | FR-REM-008 | Booking confirmation reminder | US-021, US-022 | Notif center / Reminders | 4 / 8 | TC-US-021-01..04, TC-US-022-01..08 | P1 | Not Started |
| BG-2 | FR-REM-009 | Grace period warning | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-4 | FR-REM-010 | Intervention alert | US-023 | Intervention alerts | 3 | TC-US-023-01..03 | P1 | Not Started |
| BG-1 | FR-REM-011 | Email delivery/preview | US-024 | Email + Teams preview/live | 4 | TC-US-024-01..04 | P1 | Not Started |
| BG-1 | FR-REM-012 | Teams Adaptive Card delivery/preview | US-024 | Email + Teams preview/live | 4 | TC-US-024-01..04 | P1 | Not Started |
| BG-1 | FR-REM-013 | Teams card actions | US-024 | Email + Teams preview/live | 4 | TC-US-024-01..04 | P1 | Not Started |
| BG-1 | FR-REM-014 | Notification center / history | US-021 | In-app notification center | 4 | TC-US-021-01..04 | P1 | Not Started |
| BG-1 | FR-REM-015 | Mark notification read | US-021 | In-app notification center | 4 | TC-US-021-01..04 | P1 | Not Started |
| BG-4 | FR-REM-016 | Notification audit endpoint | US-025 | Notif audit/history view | 3 | TC-US-025-01..03 | P1 | Not Started |
| BG-1 | FR-REM-017 | Reminder template registry | US-022 | Reminder templates lifecycle | 8 | TC-US-022-01..08 | P1 | Not Started |
| BG-1 | FR-REM-018 | Cross-channel consistency | US-022, US-024 | Reminders / Email-Teams | 8 / 4 | TC-US-022-01..08, TC-US-024-01..04 | P1 | Not Started |
| BG-1 | FR-REM-019 | Adaptive Card persistence | US-024, US-025 | Email-Teams / Notif audit | 4 / 3 | TC-US-024-01..04, TC-US-025-01..03 | P1 | Not Started |
| BG-8 | FR-REP-001 | Total charging sessions | US-026 | Core reporting | 3 | TC-US-026-01..03 | P0 | Not Started |
| BG-8 | FR-REP-002 | Total energy kWh | US-026 | Core reporting | 3 | TC-US-026-01..03 | P0 | Not Started |
| BG-8 | FR-REP-003 | Average session duration | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-004 | Average energy per session | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-005 | Charger utilization rate | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-006 | Peak charging hours | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-007 | Most-used chargers | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-008 | Location comparison | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-009 | Estimated CO2 savings | US-026 | Core reporting | 3 | TC-US-026-01..03 | P0 | Not Started |
| BG-8 | FR-REP-010 | Failed/cancelled/released bookings | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-011 | Faulted/unavailable events | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-012 | Label simulated data | US-026 | Core reporting | 3 | TC-US-026-01..03 | P0 | Not Started |
| BG-8 | FR-REP-013 | Date range / location filters | US-026, US-027 | Core / Additional reporting | 3 / 2 | TC-US-026-01..03, TC-US-027-01..02 | P1 | Not Started |
| BG-8 | FR-REP-014 | Notification delivery metrics | US-028 | Notif + no-show metrics | 2 | TC-US-028-01..02 | P1 | Not Started |
| BG-8 | FR-REP-015 | Notification ack rate | US-028 | Notif + no-show metrics | 2 | TC-US-028-01..02 | P2 | Not Started |
| BG-8 | FR-REP-016 | No-show rate after reminders | US-028 | Notif + no-show metrics | 2 | TC-US-028-01..02 | P1 | Not Started |
| BG-7, BG-8 | FR-REP-017 | Usage by vehicle category | US-027 | Additional reporting | 2 | TC-US-027-01..02 | P2 | Not Started |
| BG-9 | FR-AI-001 | Demand forecasting | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-002 | Pattern detection | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-003 | NL reporting | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-004 | Operational recommendations | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-005 | Anomaly flagging | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-006 | NL insight generation | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-007 | Grounding rule | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-008 | Simulated data disclosure | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-009 | Low-confidence disclosure | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-010 | No fabricated metrics | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-9 | FR-AI-011 | AI-assisted notification phrasing | US-029 | Responsible AI Insights | 5 | TC-US-029-01..05 | P2 | Not Started |
| BG-12 | FR-AUDIT-001 | Record critical actions | US-032 | Audit log | 4 | TC-US-032-01..04 | P0 | Not Started |
| BG-12 | FR-AUDIT-002 | Audit entry shape | US-032 | Audit log | 4 | TC-US-032-01..04 | P0 | Not Started |
| BG-12 | FR-AUDIT-003 | Audit log read access | US-032 | Audit log | 4 | TC-US-032-01..04 | P0 | Not Started |
| BG-12 | FR-AUDIT-004 | Audit immutability | US-032 | Audit log | 4 | TC-US-032-01..04 | P0 | Not Started |
| BG-12 | FR-AUDIT-005 | Audit log filtering | US-032 | Audit log | 4 | TC-US-032-01..04 | P1 | Not Started |
| BG-4 | FR-ADMIN-001 | Create maintenance block | US-020 | Maintenance block via CSMS | 3 | TC-US-020-01..03 | P1 | Not Started |
| BG-4 | FR-ADMIN-002 | Remove maintenance block | US-020 | Maintenance block via CSMS | 3 | TC-US-020-01..03 | P1 | Not Started |
| BG-4 | FR-ADMIN-003 | Block conflict handling | US-030 | Maint. block conflict override | 2 | TC-US-030-01..02 | P1 | Not Started |
| BG-4 | (cross-cutting) | Admin booking on behalf of user | US-031 | Admin booking on behalf | 3 | TC-US-031-01..03 | P2 | Not Started |

---

*End of RTM.*

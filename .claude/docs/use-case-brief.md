# Use Case Brief: AI-Powered EV Charging Orchestration Platform

**Document type:** Business Requirements Document (BRD) / Hackathon product brief / implementation source of truth  
**Event:** Hackathon 2026 | Accenture Mauritius NEXLevel Reinvented  
**Theme:** “Energising the Future, Reinvented”  
**Primary host / stakeholder:** Accenture Mauritius  
**Locations:** NEX Tower and NEXTERACOM  
**Confidentiality:** Confidential – For Company Internal Use Only  
**Status:** MVP scope for hackathon delivery  
**Primary purpose:** This document is the official use-case brief to guide Functional Analysis, Solution Architecture, Backend, Frontend, QA, Azure DevOps backlog creation, demo preparation, and implementation.

---

## 1. Executive Summary

EV charging at NEX Tower and NEXTERACOM is currently manual, opaque, and difficult to manage fairly. Employees do not have a reliable way to see charger availability, reserve a charging slot, or know when a charger will become free. Workplace and Security teams handle access manually, while facilities and sustainability stakeholders lack structured usage, energy, and audit data.

The proposed solution is an **AI-powered EV charging orchestration platform**. It is not only a booking application. It connects reservation management, real-time charger availability, OCPP-enabled virtual charger integration, charging session tracking, energy consumption capture, sustainability reporting, RBAC, privacy acknowledgement, notifications, and responsible AI insights into one coherent platform.

The web application must be **mobile-first and responsive**, because employee-facing actions such as checking availability, booking slots, receiving reminders, and releasing chargers are expected to be used heavily from mobile devices. Admin, Workplace, Security, and reporting views should also remain responsive, but may be optimized for tablet or desktop layouts where larger dashboards are useful.

For the hackathon MVP, testing will be performed using **virtual OCPP chargers / simulator-based charging stations**. The solution should be OCPP-ready and simulator-friendly. OCPP data should flow through a backend ingestion/integration layer, update charger/session state, store energy consumption, power dashboards, and enable AI-generated operational and sustainability insights.

---

## 2. Event and Strategic Context

The hackathon theme is **“Energising the Future, Reinvented.”** The initiative uses EV chargers as a lens to establish an intelligent, data-driven, sustainable energy management platform.

The use case sits at the convergence of four major forces:

- Artificial Intelligence.
- Sustainability regulation.
- Talent engagement.
- Energy economics.

Key 2026 drivers:

- EV registrations on the island are growing by more than **40% year-on-year**.
- 2026 is the year when government EV energy targets and binding compliance/audit obligations take effect.
- The same underlying AI energy platform should be reusable for **3x+ energy systems** in the future.
- Project outcomes should be traceable to ESG and net-zero commitments.

This means the solution should not be presented as a small internal booking tool only. It should be positioned as the first version of a broader **AI-powered sustainable energy management platform**.

---

## 3. Problem Statement

EV charging at NEX Tower and NEXTERACOM currently operates without a formal digital reservation, monitoring, or reporting system.

Employees have no clear way to:

- Check which chargers are available.
- Reserve a charger for a specific time slot.
- Know who is using a charger.
- Know when a charger will become free.
- Trust that access is being managed fairly.

Workplace and Security teams must manually coordinate access. This creates:

- Operational overhead.
- Unfair or unclear charger access.
- Confusion for employees.
- Poor user experience.
- Extended or unmanaged charging sessions.
- No reliable record of bookings or sessions.

There is also no reliable energy consumption tracking. Energy usage is not captured automatically, charging sessions are not properly recorded, and there is no strong reporting foundation for facilities management, sustainability, ESG, governance, or audit obligations.

The result is a process that is **manual, opaque, unfair, unmeasured, and unscalable**.

---

## 4. Current As-Is Workflow

The current manual workflow is:

1. The user emails the Workplace team to request access to the EV cable.
2. If approved, the user collects the cable from Security.
3. The user signs a physical booking sheet/register.
4. The user charges the vehicle.
5. The current requested manual limit is up to 3 hours or until a sufficient charge is reached.
6. The user returns the cable to Security.

Current issues with this workflow:

- It depends heavily on manual coordination.
- It does not provide transparent availability.
- It does not actively monitor session start/end.
- It does not enforce fair access automatically.
- It does not capture energy usage.
- It does not produce analytics-ready data.
- It does not support reliable ESG or sustainability reporting.

The future system must digitize and control this process.

---

## 5. Product Vision

The product should provide a future-ready EV charging platform that supports:

- Fair access to chargers.
- Real-time operational visibility.
- Structured reservation and session management.
- OCPP-enabled virtual charger integration.
- Contactless authentication via OCPP-style handshake.
- Energy consumption capture.
- Eligible EV user management.
- Privacy acknowledgement and data transparency.
- ESG-ready sustainability reporting.
- Responsible AI-powered operational intelligence.
- A mobile-first responsive experience for employee-facing flows.

The solution must be positioned as an **EV charging orchestration platform**, not simply as a charger booking app.

The platform should be designed so that simulator/virtual charger testing can later be replaced by real OCPP charger integration without rewriting the booking, reporting, or AI layers.

---

## 6. Product Positioning Statement

> An intelligent EV charging orchestration platform for fair access, real-time operational visibility, OCPP-enabled consumption capture, ESG-ready sustainability reporting, and responsible AI-powered energy insights.

This positioning should be used consistently in demos, documentation, presentation material, and jury-facing explanations.

---

## 7. Target Users and Personas

| Persona | Primary Needs | Key Value Delivered |
|---|---|---|
| **Eligible EV User / Employee** | Check charger availability, reserve a one-hour slot, manage own bookings, receive reminders, release/cancel bookings, understand privacy/data usage | Transparent and fair access to EV chargers |
| **Workplace Team** | Reduce manual booking coordination, manage operational exceptions, view usage and reports | Less manual effort and better process control |
| **Security Desk User** | View today’s bookings, validate who has a slot, monitor active sessions, support manual release/override where authorized | Reduced manual register/cable coordination and better operational visibility |
| **Facilities / Admin User** | Manage chargers, eligible EV users, rules, maintenance blocks, bookings, reports, and operational dashboards | Better charger utilization, control, and governance |
| **Sustainability / ESG Stakeholder** | Track energy usage, usage trends, reporting-ready data, and sustainability impact | Reliable ESG and net-zero reporting foundation |
| **Management / Hackathon Jury** | Evaluate innovation, business value, fairness, sustainability impact, AI credibility, and scalability | Clear demonstration of operational excellence and responsible AI |

---

## 8. Main Business Goals

The platform should:

1. Replace manual and informal charger coordination with a transparent digital system.
2. Ensure equitable access and maximize availability of charging stations.
3. Enforce a maximum charging duration of **one hour per user per day**.
4. Reduce the operational burden on Workplace and Security teams.
5. Provide real-time visibility into charger status across both locations.
6. Capture structured charging session and energy consumption data.
7. Map usage to eligible EV users and vehicle make/model.
8. Provide ESG-ready sustainability and usage reporting.
9. Demonstrate practical, explainable, and responsible AI.
10. Establish an OCPP-ready foundation for future real charger integration.
11. Deliver a polished end-to-end MVP demo within the hackathon timeline.

---

## 9. Functional Requirements Summary

The application must satisfy the following BRD requirements:

| BR ID | Requirement |
|---|---|
| **BR001** | Provide both a user interface and an administrator interface. |
| **BR002** | Enforce a maximum charging time of one hour per user per day. |
| **BR003** | Show real-time charger availability filtered by site/location and time slot. |
| **BR004** | Integrate with virtual chargers using OCPP to retrieve session and energy data and create contactless authentications using Workplace registry EID, Parking Slot, and Badge. |
| **BR005** | Record energy consumption and usage data mapped to each specific user and to the make/model of the car. |
| **BR006** | Maintain and manage a database of eligible EV users. |
| **BR007** | Deliver a user-friendly reservation system across the two sites. |
| **BR008** | Send automated reminder notifications to users before their session begins. |
| **BR009** | Send notifications when a charging session ends, prompting users to move their vehicle. |
| **BR010** | Allow admins to configure booking rules such as slot durations, booking windows, and per-user limits. |
| **BR011** | Implement RBAC so standard users manage only their bookings and authorized admins manage settings and reports. |
| **BR012** | Allow admins to create, modify, and cancel bookings, including on behalf of users, and block chargers for maintenance. |
| **BR013** | Incorporate a privacy acknowledgement explaining what personal data is stored and who has access to it. |

---

## 10. Core Functional Capabilities

The MVP must support six core product capabilities plus privacy/RBAC/admin foundations.

---

### 10.1 Slot Booking and Fair Access

Authenticated eligible EV users should be able to reserve an available EV charger for a specific time slot.

The booking system should remove the need for email queues, informal coordination, physical booking registers, and manual Security-desk handling.

#### Expected Behaviors

- Eligible EV users can view available chargers and select a charger/time slot.
- Eligible EV users can create a booking for a valid available slot.
- Eligible EV users can view, cancel, or release their own bookings.
- The system prevents overlapping bookings for the same charger.
- The system prevents a user from exceeding the daily one-hour limit.
- The system prevents a user from holding conflicting active bookings.
- Admin/Security/Workplace users can manually release or override a booking when operationally required, depending on role permissions.

#### Fair-Use Rules

- A charger cannot be booked by two users for overlapping time periods.
- A user can book a maximum of **one hour of charging per day**.
- A user cannot create multiple bookings that exceed the daily one-hour limit.
- A user cannot extend a booking beyond the allowed daily one-hour limit.
- The one-hour-per-user-per-day rule must be clearly displayed before booking confirmation.
- Admins can configure slot durations, booking windows, and per-user limits, but the BRD baseline is one hour per user per day.
- Any admin override should be recorded for auditability.

#### Important Clarification

The governing rule from the BRD is **maximum one hour per user per day**. Older assumptions about 2-hour limits or 3-hour manual usage should not be used as the MVP rule. The old 3-hour value describes the current manual process only, not the target system rule.

---

### 10.2 Real-Time Availability Dashboard

Users should have a live or near-real-time view of every charger across both locations:

- NEX Tower.
- NEXTERACOM.

Availability should be filterable by:

- Site/location.
- Charger.
- Date.
- Time slot.

Each charger should display a clear current status.

#### Charger Statuses

| Status | Meaning |
|---|---|
| **Available** | Charger is free and can be booked or used. |
| **Reserved** | Charger has an upcoming or current reservation. |
| **Charging** | A charging transaction is currently active. |
| **Blocked for Maintenance** | Charger is intentionally blocked by admin. |
| **Unavailable** | Charger is temporarily unavailable for use. |
| **Faulted** | Charger has reported an error/fault state. |

#### Expected Dashboard Behavior

- Users can quickly see which chargers are free, reserved, charging, blocked, unavailable, or faulted.
- Security/admin users can view active sessions and today’s bookings.
- Facilities users can monitor charger state across both locations.
- Charger status should update from backend events, not from manual UI-only changes.
- The dashboard should support real-time or near-real-time updates for demo purposes.
- Employee-facing availability views should be optimized for mobile screens.
- Admin/facilities dashboard views should remain responsive but can use wider layouts on tablet or desktop.

---

### 10.3 OCPP Virtual Charger Integration and Consumption Capture

The platform must integrate with **virtual chargers using OCPP — Open Charge Point Protocol**.

The OCPP integration should retrieve:

- Charging session data.
- Energy consumption data.
- Charger status updates.
- Start and end of charging transactions.

Testing is expected to be conducted using a simulator or virtual charging stations.

#### Contactless Authentication / OCPP Handshake

The solution should support a contactless authentication concept using an OCPP-style handshake based on:

- Workplace registry EID.
- Parking slot.
- Badge.

The handshake should validate that the user is eligible and has a valid booking before a charging session is started.

#### OCPP-Ready Integration Architecture

```text
OCPP virtual charger / simulator
→ OCPP or OCPP-style telemetry ingestion layer
→ Contactless authentication / authorization validation
→ Normalized charging event model
→ Charging session service
→ Energy consumption storage
→ Real-time availability update
→ Reporting and AI insights
```

#### Supported OCPP-Style Events

| Event | Purpose |
|---|---|
| **BootNotification** | Charger comes online and announces itself. |
| **StatusNotification** | Charger status changes, such as Available, Reserved, Charging, Faulted, or Unavailable. |
| **Authorize / Authentication Handshake** | Validates EID, badge, parking slot, and eligibility/booking context. |
| **StartTransaction** | A charging session starts. |
| **MeterValues** | Energy consumption values are received during an active session. |
| **StopTransaction** | A charging session ends. |

#### Architecture Rules

- The UI must not directly fake charger state transitions.
- Virtual charger/simulator events should flow through a backend ingestion or integration layer.
- Raw OCPP or simulated telemetry should be converted into an internal normalized event structure.
- Booking, reporting, and AI layers should depend on normalized data, not raw OCPP payloads.
- The virtual charger/simulator should be replaceable by real OCPP integration in a future version.
- If real OCPP endpoints/credentials are not available during implementation, a simulator/fallback scenario must be used.

#### Example Normalized Telemetry Event

```json
{
  "chargerId": "NEX-TOWER-CH-01",
  "connectorId": 1,
  "eventType": "MeterValues",
  "transactionId": "TX-1001",
  "userEid": "E12345",
  "badgeId": "B98765",
  "parkingSlot": "P-12",
  "status": "Charging",
  "energyKWh": 4.8,
  "powerKW": 7.2,
  "timestamp": "2026-05-21T09:30:00Z",
  "source": "OCPP-Simulator"
}
```

#### Required Demo Lifecycle

The simulator/virtual charger scenario should support the following full charging lifecycle:

```text
Available
→ Reserved
→ Authentication handshake
→ Charging started
→ Meter values received
→ Charging stopped
→ Available
```

A fallback pre-recorded telemetry scenario should be prepared for demo reliability.

---

### 10.4 Energy Consumption, Session, and Vehicle Data Capture

The platform must record energy consumption and usage data mapped to each specific user and vehicle.

Data to capture includes:

- User identity.
- Workplace registry EID.
- Badge identifier, where applicable.
- Parking slot, where applicable.
- Vehicle make.
- Vehicle model.
- Charger used.
- Connector used.
- Location.
- Booking reference.
- Charging session reference.
- Start time.
- End time.
- Session duration.
- Energy consumed in kWh.
- Power values where available.
- Session status.
- Source of data, such as OCPP simulator or virtual charger.

This data should support auditability, reporting, sustainability analysis, and responsible AI insights.

---

### 10.5 Eligible EV User Management

The platform must maintain and manage a database of eligible EV users.

The eligible EV user database should include relevant information such as:

- User identity.
- Workplace registry EID.
- Badge details, if required.
- Eligibility status.
- Associated vehicle make.
- Associated vehicle model.
- Role.
- Site or workplace context, if needed.
- Privacy acknowledgement status.

Only eligible EV users should be able to book charging slots.

Admins should be able to manage eligibility records, subject to RBAC permissions.

---

### 10.6 Smart Reminders and Slot Release

The platform should support reminder and release mechanisms to avoid charger misuse, improve fairness, and reduce manual follow-up from Workplace and Security teams.

Reminders should be delivered through multiple channels where possible:

- In-app notifications/reminders inside the web application.
- Email notifications.
- Microsoft Teams notifications using Adaptive Cards.

#### Expected Reminder Events

- Notify the user before their booked session starts.
- Notify the user if their booking window has started but the charging session has not begun.
- Notify the user before their charging session ends.
- Alert the user when their charging session has ended.
- Prompt the user to move their vehicle after the session ends.
- Prompt the user to release the charger if charging is complete.
- Notify the user when a slot is automatically released due to no-show or grace-period expiry.
- Notify admin/security users when manual intervention may be needed, such as repeated no-shows, late release, or charger fault.

#### Release Behaviors

- Automatically release the slot if the user does not start within a configurable grace period.
- Allow users to manually release their own booking/session.
- Allow admin/security users to manually release a slot, depending on RBAC.
- Record release actions for auditability and reporting.

#### MVP Notification Scope

For the hackathon MVP, the notification feature should support **in-app reminders as the minimum requirement**. Email and Microsoft Teams Adaptive Card notifications should be included if feasible within the implementation timeline.

If full email or Teams delivery cannot be completed during the hackathon, the system should still demonstrate the intended notification design by showing:

- In-app notification history.
- Email notification preview or generated email payload.
- Microsoft Teams Adaptive Card preview or generated Adaptive Card JSON.

This keeps the MVP credible while avoiding demo failure if live email or Teams integration is not fully available.

---

### 10.7 Reporting and Sustainability Dashboard

The platform should provide reporting and sustainability dashboards using booking, session, charger, vehicle, and energy consumption data.

#### Expected Metrics

- Total charging sessions.
- Total energy consumed in kWh.
- Average session duration.
- Average energy consumed per session.
- Charger utilization rate.
- Peak charging hours.
- Most-used chargers.
- Usage by location.
- Usage by charger.
- No-show or late-start sessions.
- Cancelled bookings.
- Released bookings.
- Maintenance blocks.
- Faulted or unavailable charger events.
- Energy consumption by user or vehicle category, where appropriate and privacy-compliant.
- Estimated sustainability impact.
- ESG-ready summaries.

#### Sustainability Notes

- CO₂ savings or sustainability impact should be estimated using a fixed emission factor for the MVP.
- The emission factor should be clearly documented.
- Reports based on simulated data must be labelled as demo/simulated data.
- External BI tools may be used for final reporting if needed.

The reporting layer should support facilities management, operational monitoring, sustainability storytelling, governance, auditability, and ESG-ready reporting.

---

### 10.8 Responsible AI Layer

The platform should include a responsible AI layer built on top of the collected operational, booking, session, vehicle, and energy data.

The AI features should be practical, explainable, and grounded in system data. The AI must not be decorative or gimmicky.

Only Accenture-authorized AI tools should be used under the provided licenses, such as:

- Claude.
- GitHub Copilot.
- Microsoft Copilot.
- Gemini.
- Amethyst.

Teams are responsible for managing their allocated AI tool credits.

#### Recommended AI Capabilities

| Capability | Description |
|---|---|
| **Demand forecasting** | Predict likely peak charging windows based on historical bookings and charging sessions. |
| **Pattern detection** | Identify underused chargers, high-demand periods, repeated late releases, abnormal sessions, or monopolization behavior. |
| **Intelligent reporting** | Generate daily or weekly natural-language summaries for Workplace, Facilities, Sustainability, or Management users. |
| **Operational recommendations** | Suggest fair-use adjustments such as adjusting slot windows, reminder timing, or operational interventions. |
| **Anomaly flagging** | Detect unexpected energy spikes, repeated no-shows, unusual sessions, or abnormal charger behavior. |
| **Natural-language insight generation** | Summarize charging activity in simple management-friendly language. |

#### Responsible AI Rules

- AI outputs must be grounded in available system data.
- AI must not invent unsupported metrics.
- If data is limited, the AI should state that confidence is limited.
- If data is simulated, the AI should clearly label insights as based on demo/simulated data.
- AI recommendations should be explainable and connected to visible metrics.
- AI should support decision-making, not replace admin/facilities judgment.

---

### 10.9 Role-Based Access Control

The platform must implement RBAC.

Expected roles:

- Standard User / Eligible EV User.
- Security User.
- Workplace User.
- Admin.
- Reporting / ESG Viewer, if needed.

Access rules:

- Standard users can only view and manage their own bookings.
- Standard users cannot access admin settings or reports unless explicitly authorized.
- Security users can view operational booking/session information and perform authorized operational actions.
- Workplace users can support booking operations and view operational data.
- Admins can manage settings, reports, users, chargers, bookings, and maintenance blocks.
- Reporting/ESG viewers may access reporting dashboards but should not necessarily manage bookings.

---

### 10.10 Admin Operations and Configuration

Admins must be able to:

- Create bookings.
- Modify bookings.
- Cancel bookings.
- Create bookings on behalf of users.
- Block chargers for maintenance.
- Unblock chargers after maintenance.
- Manage eligible EV users.
- Configure booking rules.
- Configure slot durations.
- Configure booking windows.
- Configure per-user limits.
- Configure grace periods and reminder timing, if included.
- View operational charger status.
- Access reports and analytics.

The BRD baseline booking rule is **maximum one hour per user per day**.

Configuration should not weaken the core fairness objective unless explicitly authorized.

---

### 10.11 Privacy Acknowledgement

The platform must include a privacy acknowledgement.

The acknowledgement must explain:

- What personal data is stored.
- Why the data is stored.
- Who can access the data.
- How booking, vehicle, badge, parking slot, and charging data are used.
- That the data supports charging access, operational tracking, reporting, governance, and sustainability reporting.

Users should acknowledge this before using the reservation system or before first booking.

The system should store the acknowledgement status and timestamp where feasible.

---

## 11. Suggested MVP Demo Journey

The MVP should support a clear end-to-end story that can be shown to the hackathon jury.

1. An eligible EV user logs in.
2. The user acknowledges the privacy notice if required.
3. The user views charger availability across NEX Tower and NEXTERACOM.
4. The user filters availability by site and time slot.
5. The user books a valid one-hour charging slot.
6. The system enforces the one-hour-per-user-per-day rule.
7. The user receives a reminder before the session begins.
8. The user starts the charging session through a simulated OCPP/contactless authentication handshake using EID, parking slot, and badge.
9. The charger status changes to Charging.
10. OCPP simulator/virtual charger sends MeterValues during the session.
11. The system records energy consumption against the user and vehicle.
12. The session ends through StopTransaction.
13. The user receives a notification to move the vehicle.
14. The charger becomes available again.
15. Admins can view bookings, sessions, charger status, maintenance blocks, and reports.
16. The reporting dashboard updates usage, energy, and sustainability metrics.
17. The AI layer generates a usage insight, demand forecast, operational recommendation, or sustainability summary.
18. Management/jury sees the full value: fairness, automation, operational visibility, sustainability reporting, OCPP-readiness, and responsible AI.

---

## 12. MVP Scope

The MVP should prioritize a polished, working product over unnecessary infrastructure complexity.

### In Scope

- Mobile-first responsive web application, with employee-facing flows optimized for mobile usage.
- Authenticated employee experience, even if authentication is mocked or simplified.
- Eligible EV user management.
- Privacy acknowledgement.
- Role-based access control.
- User interface and administrator interface.
- Charger availability dashboard.
- Slot booking with fair-use validation.
- One-hour maximum charging time per user per day.
- Admin/security/workplace manual release or override based on role permissions.
- Admin booking creation, modification, cancellation, and booking on behalf of users.
- Admin charger blocking for maintenance.
- OCPP virtual charger / simulator integration.
- Contactless authentication concept using Workplace registry EID, parking slot, and badge.
- Backend ingestion/normalization of OCPP or OCPP-style telemetry.
- Charger/session state updates.
- Consumption tracking through MeterValues.
- Vehicle make/model capture.
- Reporting and sustainability dashboard.
- Responsible AI insights based on collected or simulated data.
- In-app reminders.
- Email notification support or email preview/generation for demo.
- Microsoft Teams Adaptive Card notification support or Adaptive Card preview/generation for demo.
- Demo-ready data and fallback telemetry scenario.

### Out of Scope / Future Iterations

- Installation of physical charging stations.
- Hardware maintenance of chargers.
- Smart queuing system for automatic booking reallocation.
- Native mobile application development.
- SMS or mobile push notification delivery.
- Fully production-grade email/Teams notification infrastructure, unless feasible within the hackathon timeline.
- Payment processing or billing per charging session.
- Complex HR system integration beyond basic identity/eligible user assumptions.
- Multi-tenant or multi-organization support.
- Fleet or full vehicle management beyond storing vehicle make/model for EV charging eligibility and reporting.
- Real-time grid pricing.
- Dynamic tariff adjustment.
- Complex vehicle-to-charger compatibility matching.

---

## 13. Constraints

- The system must enforce the one-hour-per-user-per-day limit for normal users.
- Real-time availability must be filterable by site/location and time slot.
- Standard users must only manage their own bookings.
- Authorized admins must manage settings and reports.
- Admins must be able to create, modify, and cancel bookings, including on behalf of users.
- Admins must be able to block chargers for maintenance.
- The system must include a privacy acknowledgement.
- The system must store energy consumption and usage data mapped to the user and vehicle make/model.
- In-app notifications are required for the MVP reminder experience.
- Email and Microsoft Teams Adaptive Card notifications should be implemented where feasible; otherwise, the MVP should provide realistic preview/generated payloads for demo purposes.
- AI insights must be grounded in system data.
- Any simulated data used for metrics or AI must be clearly labelled.
- Scope is limited to NEX Tower and NEXTERACOM.
- The MVP must be polished, demonstrable, and implementation-focused within the hackathon timeline.
- The solution must be delivered as a responsive web application optimized for mobile employee usage; a native mobile app is out of scope.

---

## 14. Assumptions

The solution should consider these assumptions:

- OCPP endpoints and credentials will be made available.
- Access to virtual OCPP charging stations will be provided to teams.
- EV user data already exists and is ready for integration.
- Application testing will be conducted using a simulator.
- External BI tools may be used for final reporting.
- Only Accenture-authorized AI tools should be used.
- Teams must manage their own allocated AI tool credits.
- Employees authenticate before accessing the booking system.
- Authentication may be simplified for the MVP.
- The number of chargers and charger IDs at each location are known and fixed for the MVP.
- Charger capacity and connector types are uniform enough not to require complex compatibility rules.
- Meter values are generated by the simulator/virtual charger or fallback script.
- No payment or billing integration is required.
- CO₂ savings estimates use a fixed kgCO₂/kWh coefficient.
- Real-time dashboard updates may be implemented using SignalR, polling, WebSockets, or another suitable mechanism.
- Email notifications may use a simple SMTP/mock provider or generated email payload for the MVP.
- Microsoft Teams notifications may use Incoming Webhooks, Power Automate, Microsoft Graph, or generated Adaptive Card JSON depending on available access and time.
- The AI layer can use either generated demo data or accumulated MVP data, but must disclose when insights are based on simulated data.
- Employees are likely to access the system frequently from mobile devices, especially for quick availability checks, bookings, reminders, and slot release actions.

---

## 15. Key Dependencies

The main dependencies are:

- Access to virtual OCPP charging stations or a simulator.
- OCPP endpoints and credentials.
- EV user data / eligible user registry.
- Availability of authorized AI tools and credits.
- Access to any required notification channels if implementing real email or Teams delivery.
- Access to external BI tools, if used for final reporting.

The system should be designed so that the simulator can be used during development and demo, while the architecture remains compatible with future real OCPP charger integration.

---

## 16. Suggested Domain Concepts

The following domain concepts should guide analysis, architecture, database design, API design, and testing.

| Concept | Description |
|---|---|
| **User** | Authenticated person using the system, such as employee, security user, workplace user, admin, facilities user, or ESG/management stakeholder. |
| **Eligible EV User** | User authorized to book chargers, linked to eligibility data, EID, badge, and vehicle make/model where applicable. |
| **Location** | Physical site such as NEX Tower or NEXTERACOM. |
| **Charger** | EV charging station at a location. |
| **Connector** | Charging connector/port associated with a charger; may be simplified to one connector per charger in the MVP. |
| **Parking Slot** | Parking space associated with charger access and OCPP/contactless authentication context. |
| **Badge** | Physical/digital identifier used in the authentication handshake. |
| **Vehicle** | EV associated with a user, including make and model. |
| **Booking** | User reservation for a charger during a defined one-hour slot. |
| **Charging Session** | Actual charging transaction linked to a booking, charger, connector, user, vehicle, and telemetry events. |
| **OCPP Event / Telemetry Event** | Event generated by a virtual charger/simulator and normalized internally. |
| **Meter Reading** | Energy/power reading received during a charging session. |
| **Notification** | In-app, email, or Microsoft Teams Adaptive Card reminder/alert related to booking/session lifecycle. |
| **AI Insight** | Forecast, pattern, summary, anomaly, or recommendation generated from platform data. |
| **Sustainability Metric** | ESG-related metric such as total kWh, estimated CO₂ savings, utilization, or usage trend. |
| **Privacy Acknowledgement** | User acknowledgement explaining stored personal data and access rights. |
| **Audit Log** | Record of important actions such as booking changes, admin overrides, releases, and maintenance blocks. |

---

## 17. Suggested Booking and Session States

### Booking States

| State | Meaning |
|---|---|
| **Pending** | Booking was requested but not yet confirmed, if approval is used. |
| **Confirmed** | Booking is valid and reserved. |
| **Active** | Booking window is currently active. |
| **Completed** | Booking/session completed successfully. |
| **Cancelled** | User/admin cancelled the booking. |
| **Released** | Slot was released before or after use. |
| **NoShow** | User did not start within the grace period. |
| **Overridden** | Admin/security/workplace user manually changed or released the booking. |

### Charging Session States

| State | Meaning |
|---|---|
| **NotStarted** | Session has not started yet. |
| **Authenticating** | Contactless/OCPP-style authentication is being validated. |
| **Charging** | Charging is currently in progress. |
| **Completed** | Charging ended normally. |
| **StoppedByUser** | User stopped/released the session. |
| **StoppedByAdmin** | Admin/security/workplace user stopped/released the session. |
| **Faulted** | Session ended or paused due to charger fault. |
| **Expired** | Booking/session expired due to no-show or grace-period breach. |

---

## 18. Suggested API and Integration Areas

The implementation should consider APIs or service operations for:

- User/session context.
- Privacy acknowledgement retrieval and acceptance.
- Eligible EV user management.
- Vehicle make/model management.
- Charger listing and status retrieval.
- Charger status updates.
- Availability filtering by site/location and time slot.
- Booking creation, update, cancellation, and release.
- Booking conflict validation.
- One-hour-per-user-per-day validation.
- Admin/security/workplace override.
- Admin booking on behalf of users.
- Maintenance block creation/removal.
- OCPP/virtual charger integration.
- Contactless authentication handshake validation using EID, parking slot, and badge.
- Telemetry ingestion.
- Charging session lifecycle management.
- Meter value storage.
- Dashboard metrics retrieval.
- Reporting metrics retrieval.
- AI insight generation.
- Notification/reminder retrieval.
- In-app notification creation and read status.
- Email notification generation or delivery.
- Microsoft Teams Adaptive Card generation or delivery.
- Notification audit/history.
- Audit logging for critical actions.

The exact API contract should be produced later by the Functional Analyst/Solution Architect/Backend Developer based on this brief.

---

## 19. Suggested Notification Channels

The reminder capability should be treated as a cross-channel notification feature, not only as UI text.

| Channel | MVP Expectation | Notes |
|---|---|---|
| **In-app** | Required | Show reminders, alerts, and notification history inside the responsive web application. |
| **Email** | Recommended | Send real emails if time/access allows; otherwise generate and preview realistic email content/payloads. |
| **Microsoft Teams Adaptive Card** | Recommended | Send to Teams if webhook/Graph/Power Automate access is available; otherwise generate and preview Adaptive Card JSON. |
| **SMS / Mobile Push** | Out of scope | Not required for the hackathon MVP. |

Recommended reminder templates should cover:

- Booking confirmation.
- Session starting soon.
- Booking grace period warning.
- Charging session ending soon.
- Charging session ended.
- Move vehicle prompt.
- Slot release prompt.
- Auto-release/no-show notification.
- Admin/security/workplace intervention alert.

---

## 20. Suggested Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Usability** | The booking and availability flow must be simple enough for employees to understand quickly. |
| **Responsive Design** | The application must be mobile-first for employee-facing flows and responsive across mobile, tablet, and desktop. |
| **Performance** | Availability and booking validation should respond quickly during the demo. |
| **Reliability** | A fallback telemetry script/scenario should be available for demo safety. |
| **Scalability** | Architecture should allow future real OCPP integration and broader energy-management expansion. |
| **Maintainability** | OCPP integration/simulation, normalized events, booking logic, reporting, notifications, privacy, RBAC, and AI should be separated cleanly. |
| **Auditability** | Booking changes, overrides, releases, privacy acknowledgements, and telemetry events should be traceable. |
| **Security** | Users should only perform actions allowed by their role. |
| **Data Integrity** | Overlapping bookings, daily-limit breaches, and invalid session states must be prevented. |
| **Transparency** | Simulated data and AI-generated insights must be clearly labelled. |
| **Demo Quality** | The MVP should feel polished, coherent, and business-ready rather than experimental only. |
| **Notification Delivery** | In-app reminders are required; email and Teams Adaptive Card delivery should be implemented or realistically previewed/generated for the demo. |
| **Privacy** | The system must clearly explain personal data usage and access through a privacy acknowledgement. |

### 20.1 Responsive and Mobile-First Design

The MVP should be implemented as a responsive web application, with a **mobile-first priority for employee-facing flows**. This is important because employees will likely use the platform from their phones when arriving at work, checking charger availability, booking slots, receiving reminders, or releasing chargers.

Core mobile actions must work smoothly on small screens:

- View charger availability by location.
- Book a charging slot.
- Cancel or release a booking.
- View active session status.
- Receive and view in-app reminders.
- Understand that important reminders may also be sent by email or Microsoft Teams.
- View privacy acknowledgement.
- See basic usage or sustainability insights where relevant.

Design expectations:

- Touch targets should be large enough for mobile use.
- Forms should be simple and quick to complete.
- Navigation should work well on small screens.
- Charger cards/status indicators should be readable without horizontal scrolling.
- Employee flows should be optimized for mobile.
- Admin, facilities, Workplace, Security, and reporting views should remain responsive but may prioritize tablet/desktop layouts for larger dashboards.
- The MVP remains a web application; native mobile app development is out of scope.

---

## 21. Success Criteria

| Criterion | Description |
|---|---|
| **End-to-end demo journey** | A user can acknowledge privacy, book a slot, trigger an OCPP/virtual charger session, receive reminders, and see reporting and AI insights update in one coherent flow. |
| **Fair access enforcement** | The system prevents double-booking, enforces the one-hour-per-user-per-day limit, prevents invalid user bookings, and supports slot release. |
| **Real-time visibility** | Charger status updates reflect backend/OCPP-style events without requiring manual UI-only changes. |
| **Eligible user control** | Only eligible EV users can book charging slots. |
| **Mobile usability** | Employee-facing flows are usable on mobile devices, including availability checks, booking, reminders, privacy acknowledgement, and slot release. |
| **Notification channels** | The MVP demonstrates in-app reminders and either implements or previews/generated outputs for email and Microsoft Teams Adaptive Card notifications. |
| **OCPP-ready architecture** | Virtual charger/simulator telemetry flows through backend ingestion, normalization, state update, storage, dashboard, reporting, and AI layers. |
| **Contactless authentication** | The demo shows or explains the EID, parking slot, and badge handshake concept. |
| **Reporting completeness** | At least 8 defined reporting metrics are populated and displayed correctly. |
| **Sustainability value** | Energy usage and estimated sustainability impact are visible and understandable. |
| **AI credibility** | AI insights are grounded in available data, do not fabricate metrics, and disclose simulated data where applicable. |
| **Operational value** | Workplace/Security/Facilities users can monitor sessions and manually release/override slots when needed. |
| **Privacy and RBAC** | Users understand data usage, and roles restrict what each user can view or change. |
| **Jury positioning** | The product is clearly presented as an orchestration platform that delivers fairness, sustainability, operational excellence, OCPP-readiness, and responsible AI. |
| **Demo reliability** | A fallback pre-recorded telemetry scenario is available if live simulation fails. |

---

## 22. Key Business Value

The solution delivers:

- Fair and transparent charger access for employees.
- Reduced manual coordination for Workplace and Security teams.
- Better operational visibility for Facilities and Admin teams.
- Structured energy consumption tracking.
- Mapping of charging usage to eligible users and vehicle make/model.
- Sustainability and ESG-ready reporting.
- Auditability for compliance and governance.
- AI-assisted decision-making for demand, usage patterns, anomalies, and reporting.
- A scalable foundation for future real OCPP integration and broader energy management.
- A strong hackathon story combining business value, technical credibility, responsible AI, sustainability, and operational excellence.

---

## 23. Implementation Guidance for Agents and Team Members

This brief should be treated as the source of truth for all downstream implementation work.

### Functional Analyst Should Produce

- Functional requirements.
- User journeys.
- Role/action matrix.
- Business rules.
- Acceptance criteria.
- Initial backlog/user story breakdown.
- Privacy acknowledgement requirements.
- OCPP virtual charger / simulator interaction requirements.
- Clarified MVP scope and assumptions.

### Solution Architect Should Produce

- High-level architecture.
- Backend/frontend integration flow.
- OCPP virtual charger / simulator architecture.
- Contactless authentication flow using EID, parking slot, and badge.
- Data model proposal.
- API boundary proposal.
- Real-time update strategy.
- RBAC/security approach.
- AI/reporting integration approach.
- Demo fallback strategy.

### Backend Developer Should Produce

- Booking validation logic.
- One-hour-per-user-per-day enforcement.
- Eligible EV user management.
- Privacy acknowledgement storage.
- Charger/session state handling.
- OCPP/virtual charger telemetry ingestion API.
- Authentication handshake validation support.
- Normalized event processing.
- Database schema/migrations.
- Reporting endpoints.
- Notification generation/delivery support for in-app, email, and Teams Adaptive Cards.
- AI insight support endpoints.
- Audit logging for important actions.

### Frontend Developer Should Produce

- Employee booking flow.
- Privacy acknowledgement flow.
- Real-time charger dashboard.
- Security/Workplace/Admin operational view.
- Eligible EV user management view, if in MVP scope.
- Reporting and sustainability dashboard.
- AI insights panel.
- In-app notification/reminder experience.
- Email reminder UI/payload handling where relevant.
- Microsoft Teams Adaptive Card preview or integration flow where relevant.

### QA/Test Engineer Should Produce

- Booking conflict test cases.
- One-hour-per-user-per-day limit test cases.
- Eligible EV user access test cases.
- Privacy acknowledgement test cases.
- OCPP/virtual charger lifecycle test cases.
- Contactless authentication test cases using EID, parking slot, and badge.
- Role-based action test cases.
- Reporting validation test cases.
- AI grounding/transparency test cases.
- Notification test cases for in-app, email, and Teams Adaptive Card reminders.
- End-to-end demo test script.

### Demo Coach Should Produce

- Jury-facing storyline.
- Demo script.
- Backup demo path.
- Value proposition talking points.
- Responsible AI explanation.
- OCPP-readiness explanation.
- Sustainability impact explanation.
- Privacy/RBAC explanation.

---

## 24. Final MVP Narrative

The final demo should tell this story:

> We transformed EV charging from a manual, unfair, and unmeasured process into a transparent, controlled, data-driven, and AI-assisted orchestration platform. Employees can book chargers fairly for one-hour daily slots, Workplace and Security teams gain operational control, virtual OCPP charger integration captures realistic session and energy data, sustainability dashboards provide ESG-ready metrics, RBAC and privacy acknowledgement support responsible governance, and AI turns charging data into practical insights and recommendations.

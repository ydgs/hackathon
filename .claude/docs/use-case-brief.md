# Use Case Brief: AI-Powered EV Charging Orchestration Platform

**Challenge:** Accenture Mauritius NEXLevel Reinvented — “Energizing the Future”  
**Locations:** NEX Tower and NEXTERACOM  
**Document type:** Hackathon product brief / implementation source of truth  
**Status:** MVP scope  
**Primary purpose:** This document is the official use-case brief to guide Functional Analysis, Solution Architecture, Backend, Frontend, QA, Azure DevOps backlog creation, demo preparation, and implementation.

---

## 1. Executive Summary

EV charging at NEX Tower and NEXTERACOM is currently manual, opaque, and difficult to manage fairly. Employees do not have a reliable way to see charger availability, reserve a slot, or know when a charger will become free. Security teams are involved in manual coordination, while facilities and sustainability stakeholders lack structured usage and energy data.

The proposed solution is an **AI-powered EV charging orchestration platform**. It is not only a booking application. It connects charger reservation, real-time availability, simulated OCPP-style telemetry, charging session tracking, sustainability reporting, and responsible AI insights into one coherent platform.

The web application must be **mobile-first and responsive**, because employee-facing actions such as checking availability, booking slots, releasing chargers, and viewing reminders are expected to be used heavily from mobile devices. Admin, facilities, and reporting views should also remain responsive, but may be optimized for tablet or desktop layouts where larger dashboards are useful.

For the hackathon MVP, real charger hardware and full OCPP protocol implementation are out of scope. Instead, the product will use a clean OCPP-style telemetry simulation that flows through the backend, updates charger/session state, stores energy consumption, powers dashboards, and enables AI-generated operational insights.

---

## 2. Problem Statement

EV charging at NEX Tower and NEXTERACOM currently operates without a formal digital reservation or monitoring system.

Employees have no clear way to:

- Check which chargers are available.
- Reserve a charger for a specific time slot.
- Know who is using a charger.
- Know when a charger will become free.
- Trust that access is being managed fairly.

Coordination is handled manually, mainly through the security desk or informal communication. This creates:

- Operational overhead for security staff.
- Unfair or unclear charger access.
- Confusion for employees.
- Poor user experience.
- No reliable record of bookings or charging sessions.

There is also no reliable consumption tracking. Energy usage is not captured automatically, charging sessions are not properly recorded, and there is no strong reporting foundation for facilities management, sustainability, ESG, or operational decision-making.

The result is a process that is **manual, opaque, unfair, unmeasured, and unscalable**.

---

## 3. Product Vision

The product should provide a future-ready EV charging platform that supports:

- Fair access to chargers.
- Real-time operational visibility.
- Structured booking and session management.
- OCPP-ready consumption capture.
- ESG-ready sustainability reporting.
- Responsible AI-powered operational intelligence.
- A mobile-first responsive experience for employee-facing flows.

The solution must be positioned as an **EV charging orchestration platform**, not simply as a charger booking app.

The platform should be designed so that the hackathon simulator can later be replaced by real OCPP charger integration without rewriting the booking, reporting, or AI layers.

---

## 4. Product Positioning Statement

> An intelligent EV charging orchestration platform for fair access, real-time operational visibility, OCPP-ready consumption capture, ESG-ready sustainability reporting, and responsible AI-powered insights.

This positioning should be used consistently in demos, documentation, presentation material, and jury-facing explanations.

---

## 5. Target Users and Personas

| Persona | Primary Needs | Key Value Delivered |
|---|---|---|
| **Employee / EV Driver** | Check charger availability, reserve a slot, receive session reminders, release/cancel bookings, trust that access is fair | Transparent and fair access to EV chargers |
| **Security Desk User** | View today’s bookings, monitor active sessions, manually release or override a slot, mark chargers unavailable | Reduced manual coordination and better operational control |
| **Facilities / Admin User** | Monitor charger usage, manage chargers/bookings, access utilization and consumption reports | Better visibility, control, and operational reporting |
| **Sustainability / ESG Stakeholder** | Track energy usage, access ESG-ready metrics, view estimated CO₂ savings and usage trends | Reliable sustainability reporting foundation |
| **Management / Hackathon Jury** | Evaluate innovation, business value, fairness, sustainability impact, AI credibility, and architecture scalability | Clear demonstration of operational excellence and responsible AI |

---

## 6. Main Business Goals

The platform should:

1. Replace manual and informal charger coordination with a transparent digital system.
2. Enforce fair access so chargers are not monopolized by a small group of users.
3. Reduce the operational burden on the security desk.
4. Provide real-time visibility into charger status across both locations.
5. Capture structured charging session and energy consumption data.
6. Provide ESG-ready sustainability and usage reporting.
7. Demonstrate practical, explainable, and responsible AI.
8. Establish an OCPP-ready foundation for future real charger integration.
9. Deliver a polished end-to-end MVP demo within the hackathon timeline.

---

## 7. Core Functional Capabilities

The MVP must support six core capabilities.

---

### 7.1 Slot Booking

Authenticated employees should be able to reserve an available EV charger for a specific time slot.

The booking system should remove the need for email queues, informal coordination, and manual security-desk handling.

#### Expected Behaviors

- Employees can view available chargers and select a charger/time slot.
- Employees can create a booking for a future or current available slot.
- Employees can cancel or release their booking.
- The system prevents overlapping bookings for the same charger.
- The system prevents a user from holding multiple active bookings at the same time.
- Admin/security users can manually release or override a booking when operationally required.

#### Fair-Use Rules

- A charger cannot be booked by two users for overlapping time periods.
- A user cannot have multiple active bookings at the same time.
- A booking has a maximum duration of **2 hours**.
- The 2-hour fair-use limit must be clearly displayed before booking confirmation.
- Users cannot create or update a booking longer than 2 hours.
- Users cannot extend an active booking beyond the 2-hour limit.
- Admin/security users may override the 2-hour limit only when required for operational reasons.

#### Important Clarification

The 2-hour rule is a **maximum booking duration**, not a minimum. It exists to prevent charger monopolization and ensure fair access for all EV users.

---

### 7.2 Real-Time Availability Dashboard

Users should have a live view of every charger across both locations:

- NEX Tower
- NEXTERACOM

Each charger should display a clear current status.

#### Charger Statuses

| Status | Meaning |
|---|---|
| **Available** | Charger is free and can be booked or used |
| **Reserved** | Charger has an upcoming or current reservation |
| **Charging** | A charging transaction is currently active |
| **Unavailable** | Charger is temporarily unavailable for use |
| **Faulted** | Charger has reported an error/fault state |
| **Maintenance** | Charger is intentionally offline for maintenance |

#### Expected Dashboard Behavior

- Users can quickly see which chargers are free, reserved, or charging.
- Security/admin users can view active sessions and today’s bookings.
- Facilities users can monitor charger state across both locations.
- Charger status should update from backend events, not from manual UI-only changes.
- The dashboard should support real-time or near-real-time updates for demo purposes.
- The employee-facing dashboard should be optimized for mobile screens so users can quickly check charger availability, booking status, and active session updates from a phone.
- Admin/facilities dashboard views should remain responsive, but can use wider layouts on tablet or desktop for monitoring and reporting.

---

### 7.3 OCPP-Style Consumption Capture

The platform should be designed to support OCPP-based consumption capture in the future.

For the hackathon MVP, real charger hardware integration and full OCPP protocol implementation are out of scope. The solution should use a **clean OCPP-style telemetry simulation** approach.

The simulated telemetry must flow through the backend instead of directly updating the UI. This is important because it makes the architecture credible and future-ready.

#### Supported Simulated OCPP-Style Events

| Event | Purpose |
|---|---|
| **BootNotification** | Charger comes online and announces itself |
| **StatusNotification** | Charger status changes, such as Available, Reserved, Charging, Faulted, or Unavailable |
| **StartTransaction** | A charging session starts |
| **MeterValues** | Energy consumption values are received during an active session |
| **StopTransaction** | A charging session ends |

#### Recommended MVP Telemetry Architecture

```text
OCPP-style telemetry simulator
→ Telemetry ingestion API
→ Normalized charging event model
→ Charger/session state update
→ Database storage
→ Real-time dashboard update
→ Reporting and AI insights
```

#### Architecture Rules

- The UI must not directly fake charger state transitions.
- Simulated telemetry should be sent to a backend ingestion endpoint.
- Raw or simulated telemetry should be converted into an internal normalized event structure.
- Booking, reporting, and AI layers should depend on normalized data, not raw OCPP payloads.
- The simulator should be replaceable by real OCPP integration in a future version.

#### Example Normalized Telemetry Event

```json
{
  "chargerId": "NEX-TOWER-CH-01",
  "connectorId": 1,
  "eventType": "MeterValues",
  "transactionId": "TX-1001",
  "userId": "EMP001",
  "status": "Charging",
  "energyKWh": 4.8,
  "powerKW": 7.2,
  "timestamp": "2026-05-21T09:30:00Z",
  "source": "Simulator"
}
```

#### Required Demo Lifecycle

The simulator should support the following full charging lifecycle:

```text
Available
→ Reserved
→ Charging
→ Meter values received
→ Session completed
→ Available
```

A fallback pre-recorded telemetry scenario should be prepared for demo reliability.

---

### 7.4 Smart Reminders and Slot Release

The platform should support reminder and release mechanisms to avoid charger misuse, improve fairness, and reduce manual follow-up from the security desk.

Reminders should be delivered through multiple channels where possible:

- In-app notifications/reminders inside the web application.
- Email notifications.
- Microsoft Teams notifications using Adaptive Cards.

#### Expected Reminder Events

- Notify the user before their booked session starts.
- Notify the user if their booking window has started but the charging session has not begun.
- Notify the user before their charging session ends.
- Alert the user when their charging session has ended.
- Prompt the user to release the charger if charging is complete.
- Notify the user when a slot is automatically released due to no-show or grace-period expiry.
- Notify admin/security users when manual intervention may be needed, such as repeated no-shows, late release, or charger fault.

#### Release Behaviors

- Automatically release the slot if the user does not start within a configurable grace period.
- Allow users to manually release their own booking/session.
- Allow admin/security users to manually release a slot.
- Record release actions for auditability and reporting.

#### MVP Notification Scope

For the hackathon MVP, the notification feature should support **in-app reminders as the minimum requirement**. Email and Microsoft Teams Adaptive Card notifications should be included if feasible within the implementation timeline.

If full email or Teams delivery cannot be completed during the hackathon, the system should still demonstrate the intended notification design by showing:

- In-app notification history.
- Email notification preview or generated email payload.
- Microsoft Teams Adaptive Card preview or generated Adaptive Card JSON.

This keeps the MVP credible while avoiding demo failure if live email or Teams integration is not fully available.

#### Suggested Microsoft Teams Adaptive Card Actions

Teams Adaptive Cards should be designed to support quick user actions where feasible:

- View booking.
- Release slot.
- Confirm session started.
- Acknowledge end-of-session reminder.

For the MVP, these actions may navigate back to the web application rather than executing directly inside Teams.

---

### 7.5 Reporting and Sustainability Dashboard

The platform should provide reporting and sustainability dashboards using booking, session, charger, and energy consumption data.

#### Expected Metrics

- Total charging sessions.
- Total energy consumed in kWh.
- Average session duration.
- Average energy consumed per session.
- Charger utilization rate.
- Peak charging hours.
- Most-used chargers.
- Location comparison between NEX Tower and NEXTERACOM.
- Estimated CO₂ savings or sustainability impact.
- Failed bookings.
- Cancelled bookings.
- Released bookings.
- Faulted or unavailable charger events.

#### Sustainability Notes

- CO₂ savings should be estimated using a fixed emission factor for the MVP.
- The emission factor should be clearly documented.
- Reports based on simulated data must be labelled as demo/simulated data.

The reporting layer should support facilities management, operational monitoring, sustainability storytelling, and ESG-ready reporting.

---

### 7.6 Responsible AI Layer

The platform should include an AI layer built on top of the collected operational and energy data.

The AI features should be practical, explainable, and grounded in system data. The AI must not be decorative or gimmicky.

#### Recommended AI Capabilities

| Capability | Description |
|---|---|
| **Demand forecasting** | Predict likely peak charging windows based on historical bookings and charging sessions |
| **Pattern detection** | Identify underused chargers, high-demand periods, repeated late releases, abnormal sessions, or monopolization behavior |
| **Intelligent reporting** | Generate daily or weekly natural-language summaries for facilities, sustainability, or management users |
| **Operational recommendations** | Suggest fair-use adjustments such as reducing slot duration during peak periods or encouraging off-peak booking |
| **Anomaly flagging** | Detect unexpected energy spikes, unusually long sessions, repeated no-shows, or abnormal charger behavior |
| **Natural-language insight generation** | Summarize charging activity in simple management-friendly language |

#### Responsible AI Rules

- AI outputs must be grounded in available system data.
- AI must not invent unsupported metrics.
- If data is limited, the AI should state that confidence is limited.
- If data is simulated, the AI should clearly label insights as based on demo/simulated data.
- AI recommendations should be explainable and connected to visible metrics.
- AI should support decision-making, not replace admin/facilities judgment.

---

## 8. Suggested MVP Demo Journey

The MVP should support a clear end-to-end story that can be shown to the hackathon jury.

1. Employee opens the dashboard.
2. Employee sees charger availability across NEX Tower and NEXTERACOM.
3. Employee selects an available charger.
4. Employee books a time slot of up to 2 hours.
5. The system validates fair-use rules and confirms the booking.
6. The charger status becomes Reserved for that slot.
7. A simulated OCPP-style event starts the charging transaction.
8. The charger status changes to Charging.
9. Simulated MeterValues events update energy consumption.
10. The user receives an in-app reminder, and the system also demonstrates email and Microsoft Teams Adaptive Card notification output.
11. A StopTransaction event ends the charging session.
12. The charger becomes Available again.
13. The reporting dashboard updates with energy, usage, and utilization metrics.
14. The AI layer generates a usage insight, forecast, recommendation, or sustainability summary.
15. Management/jury sees the full value: fairness, automation, operational visibility, sustainability reporting, and responsible AI.

---

## 9. MVP Scope

The MVP should prioritize a polished, working product over full real-world infrastructure complexity.

### In Scope

- Mobile-first responsive web application, with employee-facing flows optimized for mobile usage.
- Authenticated employee experience, even if authentication is mocked or simplified.
- Charger availability dashboard.
- Slot booking with fair-use validation.
- 2-hour maximum booking duration.
- Admin/security manual release or override.
- Simulated OCPP-style telemetry pipeline.
- Backend ingestion of simulated telemetry.
- Charger/session state updates.
- Consumption tracking through simulated MeterValues.
- Reporting and sustainability dashboard.
- Responsible AI insights based on collected or simulated data.
- In-app reminders.
- Email notification support or email preview/generation for demo.
- Microsoft Teams Adaptive Card notification support or Adaptive Card preview/generation for demo.
- Demo-ready data and fallback telemetry scenario.

### Out of Scope

- Real OCPP protocol implementation.
- Physical charger hardware integration.
- SMS or mobile push notification delivery.
- Fully production-grade email/Teams notification infrastructure, unless feasible within the hackathon timeline.
- Payment processing or billing per charging session.
- Integration with HR systems or employee directories beyond basic authenticated identity.
- Native mobile application; the MVP is a responsive web app, not an iOS/Android app.
- Multi-tenant or multi-organization support.
- Fleet or vehicle management.
- Real-time grid pricing.
- Dynamic tariff adjustment.
- Complex vehicle-to-charger compatibility matching.

---

## 10. Constraints

- Real charger hardware is not available for the MVP.
- Real OCPP integration is not required for the MVP.
- Telemetry simulation must be realistic enough to support a credible demo.
- The 2-hour maximum booking duration must be enforced for normal users.
- Admin/security override is allowed only for operational reasons.
- In-app notifications are required for the MVP reminder experience.
- Email and Microsoft Teams Adaptive Card notifications should be implemented where feasible; otherwise, the MVP should provide realistic preview/generated payloads for demo purposes.
- AI insights must be grounded in system data.
- Any simulated data used for metrics or AI must be clearly labelled.
- Scope is limited to NEX Tower and NEXTERACOM.
- The MVP must be polished, demonstrable, and implementation-focused within the hackathon timeline.
- The solution must be delivered as a responsive web application optimized for mobile employee usage; a native mobile app is out of scope.

---

## 11. Assumptions

- Employees authenticate before accessing the booking system.
- Authentication may be simplified for the MVP.
- The number of chargers and charger IDs at each location are known and fixed for the MVP.
- Charger capacity and connector types are uniform enough not to require complex compatibility rules.
- OCPP-style telemetry is simulated but follows realistic charger lifecycle concepts.
- Meter values are generated by the simulator or a fallback script.
- No payment or billing integration is required.
- CO₂ savings estimates use a fixed kgCO₂/kWh coefficient.
- Real-time dashboard updates may be implemented using SignalR, polling, WebSockets, or another suitable mechanism.
- Email notifications may use a simple SMTP/mock provider or generated email payload for the MVP.
- Microsoft Teams notifications may use Incoming Webhooks, Power Automate, Microsoft Graph, or generated Adaptive Card JSON depending on available access and time.
- The AI layer can use either generated demo data or accumulated MVP data, but must disclose when insights are based on simulated data.
- Employees are likely to access the system frequently from mobile devices, especially for quick availability checks, bookings, reminders, and slot release actions.

---

## 12. Suggested Domain Concepts

The following domain concepts should guide analysis, architecture, database design, API design, and testing.

| Concept | Description |
|---|---|
| **User** | Authenticated employee, security user, admin, facilities user, or ESG/management stakeholder |
| **Location** | Physical site such as NEX Tower or NEXTERACOM |
| **Charger** | EV charging station at a location |
| **Connector** | Charging connector/port associated with a charger; may be simplified to one connector per charger in the MVP |
| **Booking** | User reservation for a charger during a defined time slot |
| **Charging Session** | Actual charging transaction linked to a booking, charger, connector, and telemetry events |
| **Telemetry Event** | Normalized event generated from simulated OCPP-style input |
| **Meter Reading** | Energy/power reading received during a charging session |
| **Notification** | In-app, email, or Microsoft Teams Adaptive Card reminder/alert related to booking/session lifecycle |
| **AI Insight** | Forecast, pattern, summary, anomaly, or recommendation generated from platform data |
| **Sustainability Metric** | ESG-related metric such as total kWh, estimated CO₂ savings, or usage trend |

---

## 13. Suggested Booking and Session States

### Booking States

| State | Meaning |
|---|---|
| **Pending** | Booking was requested but not yet confirmed, if approval is used |
| **Confirmed** | Booking is valid and reserved |
| **Active** | Booking window is currently active |
| **Completed** | Booking/session completed successfully |
| **Cancelled** | User/admin cancelled the booking |
| **Released** | Slot was released before or after use |
| **NoShow** | User did not start within the grace period |
| **Overridden** | Admin/security manually changed or released the booking |

### Charging Session States

| State | Meaning |
|---|---|
| **NotStarted** | Session has not started yet |
| **Charging** | Charging is currently in progress |
| **Completed** | Charging ended normally |
| **StoppedByUser** | User stopped/released the session |
| **StoppedByAdmin** | Admin/security stopped/released the session |
| **Faulted** | Session ended or paused due to charger fault |
| **Expired** | Booking/session expired due to no-show or grace-period breach |

---

## 14. Suggested API and Integration Areas

The implementation should consider APIs or service operations for:

- User/session context.
- Charger listing and status retrieval.
- Charger status updates.
- Booking creation, update, cancellation, and release.
- Booking conflict validation.
- Admin/security override.
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

The exact API contract should be produced later by the Functional Analyst/Solution Architect/Backend Developer based on this brief.

---

## 15. Suggested Notification Channels

The reminder capability should be treated as a cross-channel notification feature, not only as UI text.

| Channel | MVP Expectation | Notes |
|---|---|---|
| **In-app** | Required | Show reminders, alerts, and notification history inside the responsive web application |
| **Email** | Recommended | Send real emails if time/access allows; otherwise generate and preview realistic email content/payloads |
| **Microsoft Teams Adaptive Card** | Recommended | Send to Teams if webhook/Graph/Power Automate access is available; otherwise generate and preview Adaptive Card JSON |
| **SMS / Mobile Push** | Out of scope | Not required for the hackathon MVP |

Recommended reminder templates should cover:

- Booking confirmation.
- Session starting soon.
- Booking grace period warning.
- Charging session ending soon.
- Charging session ended.
- Slot release prompt.
- Auto-release/no-show notification.
- Admin/security intervention alert.

---

## 16. Suggested Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Usability** | The booking and availability flow must be simple enough for employees to understand quickly |
| **Responsive Design** | The application must be mobile-first for employee-facing flows and responsive across mobile, tablet, and desktop |
| **Performance** | Availability and booking validation should respond quickly during the demo |
| **Reliability** | A fallback telemetry script/scenario should be available for demo safety |
| **Scalability** | Architecture should allow future real OCPP integration |
| **Maintainability** | OCPP simulation, normalized events, booking logic, reporting, and AI should be separated cleanly |
| **Auditability** | Booking changes, overrides, releases, and telemetry events should be traceable |
| **Security** | Users should only perform actions allowed by their role |
| **Data Integrity** | Overlapping bookings and invalid session states must be prevented |
| **Transparency** | Simulated data and AI-generated insights must be clearly labelled |
| **Demo Quality** | The MVP should feel polished, coherent, and business-ready rather than experimental only |
| **Notification Delivery** | In-app reminders are required; email and Teams Adaptive Card delivery should be implemented or realistically previewed/generated for the demo |


### 16.1 Responsive and Mobile-First Design

The MVP should be implemented as a responsive web application, with a **mobile-first priority for employee-facing flows**. This is important because employees will likely use the platform from their phones when arriving at work, checking charger availability, booking slots, receiving reminders, or releasing chargers.

Core mobile actions must work smoothly on small screens:

- View charger availability by location.
- Book a charging slot.
- Cancel or release a booking.
- View active session status.
- Receive and view in-app reminders.
- Understand that important reminders may also be sent by email or Microsoft Teams.
- See basic usage or sustainability insights where relevant.

Design expectations:

- Touch targets should be large enough for mobile use.
- Forms should be simple and quick to complete.
- Navigation should work well on small screens.
- Charger cards/status indicators should be readable without horizontal scrolling.
- Employee flows should be optimized for mobile.
- Admin, facilities, and reporting views should remain responsive but may prioritize tablet/desktop layouts for larger dashboards.
- The MVP remains a web application; native mobile app development is out of scope.

---

## 17. Success Criteria

| Criterion | Description |
|---|---|
| **End-to-end demo journey** | A user can book a slot, trigger a simulated charging session, receive reminders, and see reporting and AI insights update in one coherent flow |
| **Fair access enforcement** | The system prevents double-booking, enforces the 2-hour maximum duration, prevents multiple active user bookings, and supports slot release |
| **Real-time visibility** | Charger status updates reflect simulated OCPP-style events without requiring manual UI-only changes |
| **Mobile usability** | Employee-facing flows are usable on mobile devices, including availability checks, booking, reminders, and slot release |
| **Notification channels** | The MVP demonstrates in-app reminders and either implements or previews/generated outputs for email and Microsoft Teams Adaptive Card notifications |
| **OCPP-ready architecture** | Simulated telemetry flows through backend ingestion, normalization, state update, storage, dashboard, reporting, and AI layers |
| **Reporting completeness** | At least 8 defined reporting metrics are populated and displayed correctly |
| **Sustainability value** | Energy usage and estimated sustainability impact are visible and understandable |
| **AI credibility** | AI insights are grounded in available data, do not fabricate metrics, and disclose simulated data where applicable |
| **Operational value** | Security/facilities users can monitor sessions and manually release/override slots when needed |
| **Jury positioning** | The product is clearly presented as an orchestration platform that delivers fairness, sustainability, operational excellence, and responsible AI |
| **Demo reliability** | A fallback pre-recorded telemetry scenario is available if live simulation fails |

---

## 18. Key Business Value

The solution delivers:

- Fair and transparent charger access for employees.
- Reduced manual coordination for the security desk.
- Better operational visibility for facilities and admin teams.
- Structured energy consumption tracking.
- Sustainability and ESG-ready reporting.
- AI-assisted decision-making for demand, usage patterns, anomalies, and reporting.
- A scalable foundation for future real OCPP integration.
- A strong hackathon story combining business value, technical credibility, responsible AI, and operational excellence.

---

## 19. Implementation Guidance for Agents and Team Members

This brief should be treated as the source of truth for all downstream implementation work.

### Functional Analyst Should Produce

- Functional requirements.
- User journeys.
- Role/action matrix.
- Business rules.
- Acceptance criteria.
- Initial backlog/user story breakdown.
- Clarified MVP scope and assumptions.

### Solution Architect Should Produce

- High-level architecture.
- Backend/frontend integration flow.
- OCPP-style simulation architecture.
- Data model proposal.
- API boundary proposal.
- Real-time update strategy.
- AI/reporting integration approach.

### Backend Developer Should Produce

- Booking validation logic.
- Charger/session state handling.
- Telemetry ingestion API.
- Normalized event processing.
- Database schema/migrations.
- Reporting endpoints.
- Notification generation/delivery support for in-app, email, and Teams Adaptive Cards.
- AI insight support endpoints.

### Frontend Developer Should Produce

- Employee booking flow.
- Real-time charger dashboard.
- Security/admin operational view.
- Reporting and sustainability dashboard.
- AI insights panel.
- In-app notification/reminder experience.
- Email reminder UI/payload handling where relevant.
- Microsoft Teams Adaptive Card preview or integration flow where relevant.

### QA/Test Engineer Should Produce

- Booking conflict test cases.
- 2-hour limit test cases.
- Telemetry lifecycle test cases.
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
- Sustainability impact explanation.

---

## 20. Final MVP Narrative

The final demo should tell this story:

> We transformed EV charging from a manual, unfair, and unmeasured process into a transparent, data-driven, and AI-assisted orchestration platform. Employees can book chargers fairly, security and facilities teams gain operational control, simulated OCPP telemetry captures realistic energy usage, sustainability dashboards provide ESG-ready metrics, and responsible AI turns charging data into practical insights and recommendations.


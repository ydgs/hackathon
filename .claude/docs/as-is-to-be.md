# As-Is vs To-Be: AI-Powered EV Charging Orchestration Platform

**Scope:** NEX Tower and NEXTERACOM (Accenture Mauritius)
**Source:** `.claude/docs/use-case-brief.md` (Hackathon 2026 — NEXLevel Reinvented)
**Status:** MVP scope for hackathon delivery

---

## 1. Current Process (As-Is)

EV charging at NEX Tower and NEXTERACOM today operates as an informal, manually coordinated workflow with no digital reservation, monitoring, or reporting system.

Step-by-step as it works today:

1. An employee who wants to charge their EV sends an email to the Workplace team requesting access to the EV charging cable.
2. The Workplace team manually reviews the request and decides whether to approve it.
3. If approved, the employee walks to the Security desk to collect the physical charging cable.
4. The employee signs a physical paper booking register/sheet at the Security desk.
5. The employee connects the cable to their vehicle and starts charging.
6. The employee is expected to charge for a maximum of approximately 3 hours, or until a sufficient charge is reached (manual self-policed limit).
7. When done, the employee returns the cable to the Security desk.
8. No automated capture of session start time, end time, or energy consumed (kWh) occurs.
9. No structured availability information is shared with other employees — they discover unavailability only by asking.
10. Facilities, Sustainability, and ESG stakeholders receive no structured usage, energy, or audit data from this process.

---

## 2. Current Pain Points

- **Opaque availability:** Employees cannot see which chargers are free, who is using them, or when they will become free.
- **Email-driven bottleneck:** Every booking depends on an email exchange with the Workplace team, creating queue and response-time delays.
- **Manual cable handover:** Security must physically hand over and retrieve cables, adding repetitive operational overhead.
- **Paper register:** A physical sign-in sheet is the only booking "record" — it is not searchable, not auditable, and easy to bypass.
- **Unfair access:** No system enforces equitable access; the same users can monopolize chargers, and there is no transparent rule enforcement.
- **No session monitoring:** Nobody tracks when a session actually starts or ends; vehicles can occupy chargers beyond the informal 3-hour limit.
- **Extended/abandoned sessions:** Without notifications, users forget to move their vehicle after charging, blocking the charger for others.
- **No energy data:** kWh consumed is never captured, so there is no foundation for facilities reporting or ESG/sustainability disclosure.
- **No user-vehicle mapping:** Charging activity is not linked to specific users or to vehicle make/model.
- **Compliance exposure:** 2026 EV energy targets and binding audit obligations cannot be evidenced because there is no structured record.
- **No analytics or AI:** There is no data to forecast demand, identify underused chargers, or detect abuse patterns.
- **Workplace and Security teams overloaded:** Both teams spend recurring time on coordination that should be self-service.
- **No privacy transparency:** Employees have no formal acknowledgement of what data (if any) is captured about their charging.
- **Not scalable:** EV registrations are growing 40%+ year-on-year on the island; the manual workflow cannot absorb this growth.

---

## 3. Manual Steps (Today)

Enumerated list of every human/manual step in the current process:

1. Employee composes and sends an email to the Workplace team requesting cable access.
2. Workplace team manually reads and triages the email.
3. Workplace team manually checks (informally) whether a charger is free.
4. Workplace team manually replies to approve or decline the request.
5. Employee walks to the Security desk to collect the cable.
6. Security desk staff manually hand over the physical cable.
7. Employee manually signs the paper booking register.
8. Security desk staff manually witness/file the register entry.
9. Employee manually plugs in and starts charging (no system-level start event).
10. Employee self-monitors the informal 3-hour limit.
11. Employee manually unplugs and stops charging.
12. Employee walks the cable back to the Security desk.
13. Security desk staff manually receive the cable and update (or not) the register.
14. Workplace/Security manually resolve disputes when two employees want the same charger.
15. Facilities manually try to reconstruct usage data (if needed) from the paper register.
16. Sustainability/ESG stakeholders manually request usage estimates with no reliable source.

Result: at least **13–16 distinct manual touchpoints** per single charging event, spread across the employee, Workplace team, and Security desk.

---

## 4. Target Future Process (To-Be)

With the AI-Powered EV Charging Orchestration Platform integrated to the provided NexLevel CSMS / OCPP 1.6J simulator, the process becomes a digital, self-service, auditable flow.

Step-by-step in the future state:

1. An eligible EV user logs in to the mobile-first responsive web application.
2. On first use, the user reads and acknowledges the privacy notice; the acknowledgement is stored with a timestamp.
3. The user opens the real-time availability dashboard and filters chargers by site (NEX Tower / NEXTERACOM), date, and time slot.
4. The dashboard shows each charger's live status: Available, Reserved, Charging, Blocked for Maintenance, Unavailable, or Faulted, sourced from the CSMS REST API.
5. The user selects an available charger and books a one-hour slot. The system enforces the **one-hour-per-user-per-day** rule and prevents overlapping bookings.
6. On booking confirmation, the backend calls `POST /api/auth/tags` on the provided CSMS to authorize an RFID/tag window for the booked slot. The booking stores a clear sync status (`Authorized`, `AuthorizationPending`, or `AuthorizationFailed`).
7. The user receives an in-app reminder (and email / Teams Adaptive Card where feasible) before the session is due to start.
8. The user taps in with the authorized RFID/tag; the simulator-backed charge point starts a session; the CSMS reports it as active.
9. The CSMS captures meter values and energy consumption throughout the session.
10. The application retrieves session, meter, and energy data from the CSMS and maps it to the booking, the eligible EV user, and the vehicle make/model.
11. The user receives a "session ending soon" reminder and, on completion, a "move your vehicle" prompt.
12. The user (or admin/security) releases the slot; the backend calls `DELETE /api/auth/tags/:idTag` to revoke authorization. The charger returns to Available automatically.
13. If a user does not start within the grace period, the slot is automatically released (NoShow) and notifications are sent.
14. Admins create, modify, cancel bookings (including on behalf of users), block chargers for maintenance, and manage eligible EV users and rules via the admin interface — all actions audit-logged.
15. Facilities, Sustainability, and ESG stakeholders open the reporting dashboard to see total sessions, kWh consumed, utilization, peak hours, no-shows, CO₂ savings (fixed emission factor), and other ESG-ready metrics.
16. The responsible AI layer generates grounded insights: demand forecasts, underused chargers, anomalies, and natural-language summaries, with clear labelling when based on simulated/demo data.
17. RBAC ensures each role (Standard User, Security, Workplace, Admin, ESG Viewer) only sees and does what they are authorized to do.

---

## 5. Improvements Expected

Concrete, measurable improvements the solution delivers:

- **Manual touchpoints reduced from 13–16 per charging event to effectively 0** for the standard booking flow (self-service end-to-end).
- **Email-based requests eliminated** — Workplace team no longer triages booking emails for routine requests.
- **Cable handovers at the Security desk eliminated** for the standard flow (the charger plus RFID/tag authorization replaces the cable handoff).
- **Paper register replaced** by a digital booking record that is searchable, filterable, and audit-logged.
- **Booking lead time reduced** from "email-and-wait" (often hours) to a few seconds in-app.
- **Fair access enforced automatically** — one hour per user per day; no overlapping bookings; no manual policing.
- **Charging duration reduced** from the informal up-to-3-hours self-policed limit to a system-enforced 1-hour cap, increasing charger throughput by ~3x per charger per slot.
- **Real-time visibility** — charger status across both sites available 24/7 on mobile, replacing "ask Security" guesswork.
- **Energy data captured automatically** — kWh per session, mapped to user and vehicle make/model, where previously zero data existed.
- **Reporting coverage** — at least 8 operational and sustainability metrics populated automatically (sessions, kWh, utilization, peak hours, most-used chargers, no-shows, cancellations, ESG summaries).
- **Notification coverage** — reminders for session start, grace period, session ending, session ended, move-vehicle, slot release, no-show — none of which exist today.
- **Auditability** — every booking change, override, release, maintenance block, and privacy acknowledgement is traceable.
- **Privacy transparency** — users explicitly acknowledge what data is captured and who can access it.
- **Compliance-ready** — structured records support the 2026 EV energy targets and binding audit/compliance obligations.
- **AI-assisted operations** — demand forecasts, anomaly flags, and natural-language summaries replace ad-hoc human guesswork.
- **OCPP-ready foundation** — the platform consumes the provided CSMS REST API and can later swap the simulator for real charger hardware without rebuilding the booking, reporting, notification, or AI layers.
- **Mobile-first usability** — employees self-serve from their phone on arrival; today no mobile experience exists at all.

---

## 6. Business Value

**Operational efficiency**
- Workplace and Security teams reclaim time previously spent on email triage, cable handovers, and dispute resolution.
- A single self-service platform replaces a process spread across email, in-person Security visits, and a paper register.

**Fairness and employee experience**
- Transparent, rule-based access removes perception (and reality) of unfair charger monopolization.
- Mobile-first availability and booking match how employees actually behave on arrival at the office.

**Sustainability and ESG**
- Structured, automatic kWh capture and CO₂ estimation create the data foundation for ESG-ready reporting and net-zero traceability.
- Demonstrable usage trends support ESG storytelling and management reporting.

**Compliance and risk reduction**
- 2026 binding compliance/audit obligations on EV energy use become evidenced rather than improvised.
- Audit-logged actions (bookings, overrides, releases, maintenance, privacy acknowledgements) reduce governance risk.
- Privacy acknowledgement reduces data-protection exposure.

**Scalability and strategic value**
- With EV registrations growing 40%+ year-on-year, the platform absorbs growth without proportional workload on Workplace/Security.
- The same AI-powered energy platform can be reused for 3x+ future energy systems, multiplying the ROI of this build.
- OCPP-ready architecture protects the investment when real hardware replaces the simulator.

**Innovation and talent engagement**
- Responsible AI (forecasting, pattern detection, natural-language summaries) demonstrates Accenture Mauritius's "Energising the Future, Reinvented" theme to employees, management, and external stakeholders.
- Positions the office as a credible showcase of sustainable, AI-driven workplace operations.

---

## 7. Before/After Comparison Table

| Dimension | As-Is (Today) | To-Be (Future) |
|---|---|---|
| Booking channel | Email to Workplace team | Self-service mobile-first web app |
| Booking record | Paper register at Security | Digital, searchable, audit-logged |
| Booking lead time | Hours (email wait) | Seconds (in-app) |
| Manual touchpoints per session | 13–16 | ~0 for standard flow |
| Cable handover | Manual at Security desk | RFID/tag authorization via CSMS |
| Charger availability visibility | Word-of-mouth / ask Security | Real-time dashboard, both sites |
| Charging duration limit | ~3 hours, self-policed | 1 hour per user per day, system-enforced |
| Fair access enforcement | None (informal) | Automatic — no overlaps, daily cap |
| Session start/end monitoring | None | Captured via CSMS (OCPP 1.6J simulator) |
| Energy (kWh) capture | None | Automatic per session, mapped to user + vehicle |
| Vehicle make/model mapping | None | Captured in eligible EV user database |
| Reminders / notifications | None | In-app required; email + Teams Adaptive Cards where feasible |
| No-show handling | Manual / unmanaged | Automatic release after configurable grace period |
| Reporting metrics available | 0 | 8+ operational and sustainability metrics |
| Sustainability / ESG data | Not available | kWh, CO₂ (fixed factor), trends, ESG-ready summaries |
| Auditability | None | Audit log on bookings, overrides, releases, maintenance, privacy |
| Privacy transparency | Not addressed | Explicit acknowledgement, stored with timestamp |
| RBAC | None | Standard User / Security / Workplace / Admin / ESG Viewer |
| AI insights | None | Demand forecast, pattern detection, anomalies, NL summaries |
| Scalability with EV growth | Breaks under volume | Designed for growth; OCPP-ready |
| Workplace team workload | High (email triage) | Minimal (exceptions only) |
| Security desk workload | High (cable handovers + register) | Low (operational oversight + overrides) |
| Demo / stakeholder narrative | None | End-to-end orchestration platform story |

---

## 8. Risks If Not Improved

If the current manual process is left in place:

**Operational risks**
- Manual coordination overhead grows linearly with EV adoption (40%+ year-on-year); Workplace and Security teams become bottlenecks.
- Cable handovers and paper register create recurring queues and disputes at the Security desk.
- Vehicles continue to occupy chargers beyond reasonable limits because no enforcement exists, reducing effective capacity.
- Charger faults and unavailable states go undetected until users physically discover them.

**Financial risks**
- Energy consumption is unmeasured, so cost allocation, chargeback, and forecasting cannot be done accurately.
- Underused chargers cannot be identified, leading to poor capex/utilization decisions on future chargers.
- Lost productivity for employees waiting for cable access and for Workplace/Security staff coordinating it.

**Compliance and audit risks**
- 2026 brings binding compliance and audit obligations on EV energy use; the manual paper-based process cannot evidence them.
- No structured personal-data handling around badge, parking slot, and vehicle information creates privacy exposure.
- No audit trail on who accessed which charger, when, and for how long.

**Sustainability and ESG risks**
- Without kWh capture, ESG and net-zero commitments around EV charging cannot be reported credibly.
- Sustainability storytelling to management, employees, and external stakeholders has no factual basis.
- CO₂-savings impact from EV adoption cannot be quantified or communicated.

**Strategic and competitive risks**
- Accenture Mauritius misses the opportunity to demonstrate "Energising the Future, Reinvented" with a tangible internal showcase.
- The platform that could be reused for 3x+ future energy systems is not built, capping the strategic ROI.
- No OCPP-ready foundation exists; when real chargers are deployed at scale, the organization will face the same problem at a larger cost.
- Talent-engagement value (modern, AI-enabled, mobile-first workplace experience) is lost.

**User experience risks**
- Employees continue to perceive charger access as unfair and frustrating, eroding workplace satisfaction.
- Growing EV-owning workforce will increasingly escalate complaints to Workplace, HR, and Facilities.
- The Workplace and Security teams remain trapped in low-value, repetitive coordination work instead of higher-value activities.

---

*This document is grounded in `.claude/docs/use-case-brief.md`. Any features, metrics, or rules described here trace back to that brief. Simulated/demo data and AI-generated insights must be clearly labelled in the delivered MVP.*

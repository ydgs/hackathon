# Bug Severity Matrix

Use this matrix to assign severity to every bug. Do not assign severity based on gut feeling — use the criteria below. When in doubt, assign the higher severity.

---

## Blocker
**Demo cannot proceed. App cannot start or the main P0 flow cannot be completed.**

Fix immediately — everything else stops until this is resolved.

Examples:
- App crashes on startup or page load
- Main P0 flow cannot be completed (e.g., form submit always fails)
- Login or access gate prevents the demo from running
- Data is not saved or is lost on page refresh (for a feature marked Done)
- Intermittent failure on P0 happy path (fails 1-in-3 or more) — treat as Blocker even if the individual failure seems minor, because it will fail during the live demo

**Hackathon rule:** A Blocker found in the last 2 hours of the hackathon must go directly to the scrum master. The decision is: fix it, work around it, or activate the fallback demo plan. Do not attempt a complex fix in the last 90 minutes unless there is no alternative.

---

## High
**Core feature is broken, but there is a workaround or the P0 flow still completes.**

Fix before demo rehearsal. Do not leave High bugs open going into the final hour.

Examples:
- Submit works but the newly created item does not appear in the list without a page refresh
- API returns incorrect status or stale data
- Validation error message is missing (form submits with invalid data)
- A P1 feature is completely non-functional

---

## Medium
**Feature mostly works but has a noticeable issue. Would not stop the demo but would be visible to a judge.**

Fix if time allows before demo rehearsal. Acceptable to leave open if P0 and High bugs are all resolved.

Examples:
- Validation message is shown but is unclear or misleading
- Minor layout issue visible on demo screen
- A secondary action (edit, delete) is broken
- Loading state is missing (content pops in without feedback)

---

## Low
**Cosmetic or non-critical issue. Unlikely to be noticed by a judge.**

Fix only after everything else is done. Most Low bugs will not be fixed in a hackathon — document them.

Examples:
- Minor spacing or alignment issue
- Text typo in a secondary label
- Color or icon inconsistency
- Empty state message is generic instead of specific

---

## Intermittent Bugs
A bug that fails sometimes but not always is **more dangerous than a consistent failure** in a demo context, because you cannot predict when it will appear.

Rule: any bug that reproduces on 1-in-3 or more attempts is treated as **one severity level higher** than it would be if it were consistent:
- An intermittent Medium becomes High.
- An intermittent High becomes Blocker.

Always document the reproduction frequency in the bug report.

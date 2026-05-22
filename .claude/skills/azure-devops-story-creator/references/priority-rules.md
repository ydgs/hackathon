# Priority Rules for Hackathon Stories

## Priority Tiers

### P0 — Must Have (Hours 1–8)
A P0 story is required for the demo to make sense. Without it, the product feels broken or incomplete to a judge.

Do not mark a story P0 unless removing it makes the demo fail or the product unintelligible.

**Maximum 5 P0 stories.** If you have more, demote the weakest ones.

Examples:
- Create the main entity (form + submit)
- View the main entity list
- View entity detail
- Update or action the key status
- Basic server-side validation

**Time gate:** All P0 stories must be marked Done by hour 8. If any P0 is not done by hour 8, it becomes an incident — the scrum master must decide to cut or reassign immediately.

---

### P1 — Should Have (Hours 9–13)
A P1 story makes the product credible, useful, or easier to demo. It is not demo-blocking on its own, but multiple missing P1s make the product feel thin.

Examples:
- Search or filter
- Dashboard summary cards
- Comments or notes
- Role-specific view
- Export or summary action
- Edit / delete

**Time gate:** P1 stories begin only after all P0 stories are Done. Do not start P1 work while any P0 is still In Progress.

---

### P2 — Could Have / Wow (Hours 14–16, only if P0+P1 stable)
A P2 story is a stretch feature or an "AI wow" moment. Build only after P0 and priority P1 stories are stable.

**Default rule: AI features are P2 unless the product's core value proposition is AI.** If the product IS an AI product (e.g., an AI recommendation engine), the AI inference call is P0. The AI polish (explanations, confidence scores, visual wow) is still P2.

Examples:
- AI assistant or recommendations
- Advanced analytics or charts
- Notifications
- Multi-step workflow polish
- Onboarding experience

**Time gate:** P2 work only begins at hour 14. If P0 or P1 stories are still open at hour 14, do not start P2.

---

## Blocked Stories
If a P0 story is blocked (waiting on another team member, missing API, environment issue):
1. Flag it as Blocked immediately — do not leave it as In Progress.
2. The scrum master must assess within 30 minutes: can it unblock, or must it be cut?
3. A blocked P0 that cannot resolve by hour 6 should be considered for demotion to P1 and replaced with a simpler P0 alternative.

## Cut Order
When time runs short, cut in this order:
1. Cut P2 first — entirely.
2. Cut the weakest P1 stories (lowest demo value).
3. Never cut the core P0 demo flow.

When cutting, always state: what is cut, why, and what the judge will not see.

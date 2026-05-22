# CLAUDE.md — Hackathon Operating Instructions

## Context
We are building a product in a 16-hour hackathon using Azure DevOps for Boards, Repos, and Pipelines. Claude Code agents accelerate analysis, implementation, testing, and demo preparation.

This file is read by every agent before acting. It is the root operating contract for this project.

---

## How to Navigate This Project

Read files in this order before doing any work:

1. **`CLAUDE.md`** (this file) — operating rules and constraints
2. **`AGENTS.md`** — agent directory, skill map, handoff sequence
3. **`docs/project-context.md`** — product scope, MVP definition, P0/P1/P2 features
4. **`docs/architecture.md`** — tech stack, entities, folder structure, build order
5. **`docs/api-conventions.md`** — API contracts, field names, error shapes

Do not skip files in this sequence. Each file builds on the previous one. An agent that skips `docs/project-context.md` will build the wrong thing.

---

## Tech Stack

> **To be confirmed on the day.** The solution architect fills this in during the first 30 minutes. Once confirmed, do not deviate without updating this section and notifying the team.

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend framework | TBD | |
| Styling | TBD | |
| Backend framework | TBD | |
| Language | TBD | |
| Database | TBD | |
| ORM / Query builder | TBD | |
| Authentication | TBD / Not required | |
| AI integration | TBD / Not required | |
| Hosting / demo runtime | TBD | |

Full stack details and environment setup: `docs/architecture.md`

---

## Primary Goal
Deliver a stable, demoable MVP first.

- P0 flow working end-to-end by **hour 8**
- P1 features added only after P0 is stable, by **hour 13**
- One AI/wow feature (P2) only after P1 is stable, starting at **hour 14**
- **Code freeze at hour 15** — no new features after this point. Bug fixes, polish, and demo rehearsal only.

The code freeze is owned by the scrum master. After hour 15, only the scrum master can authorise an exception.

---

## Execution Rules

- Work from Azure DevOps work items — not from vague chat instructions.
- Implement one work item at a time. Do not start the next story until the current one is Done.
- Do not build broad architecture before the main flow works.
- Prefer simple, readable, demo-safe implementation over complex patterns.
- Do not introduce new packages without a clear reason — state the reason in your commit message.
- Do not silently expand scope beyond the assigned story.

### When information is missing
- If a business rule is missing and blocking implementation: make the safest reasonable assumption, document it in the story or a code comment, and flag it to the team.
- If the API contract for an endpoint is missing: create it in `docs/api-conventions.md` first, then implement.
- If the requirement is fundamentally unclear and an assumption would risk building the wrong thing: **stop and flag it.** Do not guess on ambiguity that affects the core demo flow.

---

## Azure DevOps Rules

- Every commit must reference a work item ID: `US-001: description` or `BUG-004: description`.
- Move tasks through states: **New → Active → Resolved/Closed**. Do not leave tasks in Active after they are complete.
- Create bugs for failed QA — do not hide defects in chat or leave them undocumented.
- Each User Story should have [FE], [BE], and [QA] tasks where applicable.
- Work item template: `docs/templates/azure-devops-user-story-template.md`

---

## Definition of Done

A story is Done only when **all** of the following are true:

- [ ] Frontend task complete (if applicable)
- [ ] Backend task complete (if applicable)
- [ ] Integration works end-to-end in the running app — not with mock data
- [ ] All acceptance criteria pass
- [ ] QA has validated the story
- [ ] No Blocker or High severity bug remains open against this story
- [ ] No `// MOCK:` data remaining in production code paths
- [ ] Code merged into the agreed main branch (not just pushed to a feature branch)
- [ ] Story marked Done on the Azure DevOps board

---

## Azure DevOps Interaction

- Azure DevOps interaction happens via the Azure DevOps MCP server registered as 'azure-devops'.

## Frontend Rules

- Build the visible P0 user flow first.
- Use exact field names from `docs/api-conventions.md` — do not rename fields to fit the UI.
- Implement all four states for every API call: loading, empty, success, error.
- Add form validation for required fields with field-level error messages.
- Keep pages responsive (minimum 1024px — demo will likely be on a laptop or projector).
- Label all temporary mock data with `// MOCK: replace with [endpoint]` — never leave it unlabelled.
- Reference: `skills/frontend-feature-builder/`

## Backend Rules

- Implement the API contract from `docs/api-conventions.md` exactly — do not invent field names.
- Validate all required input server-side.
- Return errors using the shape defined in `docs/api-conventions.md` — the `errors` array format.
- Use predictable status codes: 200, 201, 204, 400, 404, 500 (see `docs/api-conventions.md`).
- Add seed/demo data for every P0 entity before the demo — judges should not see empty lists.
- Do not hardcode environment values — use `.env` and add to `.env.example`.
- Reference: `skills/backend-api-builder/`

## QA Rules

- Test P0 happy paths first — do not touch edge cases while any P0 flow is broken.
- Test required field validation and obvious failure paths second.
- Assign severity using `skills/qa-test-case-generator/references/bug-severity-matrix.md`.
- Report bugs with: title, severity, linked story, steps to reproduce, expected result, actual result.
- Confirm the fix is deployed before retesting — do not retest against a stale build.
- Run the smoke test checklist before every demo rehearsal: `skills/qa-test-case-generator/references/smoke-test-checklist.md`.
- Reference: `skills/qa-test-case-generator/`

## Demo Rules

- Prepare and rehearse the demo script before the code freeze: `skills/demo-prep/references/demo-script-template.md`.
- Only demo features marked Done on the Azure DevOps board.
- Prepare the fallback plan before rehearsal — not during a live failure: `skills/demo-prep/references/backup-demo-plan.md`.
- The demo presenter must run the full demo flow at least twice before the real thing.
- After hour 15: no merges, no new features, no "quick fixes" without the scrum master's approval.

---

## Code Style

- Keep code simple and explicit — favour clear names over clever abstractions.
- Avoid premature abstraction during the hackathon.
- Remove dead code, `console.log`, `debugger`, and debug-only branches before demo.
- No hardcoded credentials, API keys, or URLs that belong in environment variables.
- Commit format: `US-###: short description` or `BUG-###: short description`

# AGENTS.md — Agent and Skill Directory

This file is read by every agent before acting. It defines:
- What agents exist and what each one produces
- What skills exist and which agents use them
- The execution sequence and handoff protocol
- Which agent owns which file

---

## Project Tooling Model

This project uses a split workflow:

- **Azure DevOps** is the source of truth for Epics, Features, User Stories, Tasks, Bugs, acceptance criteria, and board status.
- **GitHub** is the source of truth for source code, branches, commits, pull requests, code reviews, and merge history.

Agents must not assume Azure DevOps Repos are being used. Azure DevOps MCP is used for work-item operations only. Git/GitHub is used for repository operations.

Every implementation branch, commit, and pull request should reference the related Azure DevOps work item ID when available.

---

## Provided OCPP / NexLevel CSMS Constraint

The hackathon provides a **NexLevel CSMS/OCPP simulator** that already handles OCPP 1.6J charge-point communication, simulated chargers, session persistence, meter values, energy tracking, and a REST API.

Agents must **not** design or implement a custom OCPP server, custom OCPP WebSocket protocol layer, BootNotification handler, MeterValues handler, StartTransaction handler, StopTransaction handler, or charge-point simulator.

All charging infrastructure interactions must go through the provided CSMS REST API. Treat the CSMS as an external/provided subsystem.

Default local endpoints:
- CSMS REST API + Swagger: `http://localhost:3000`
- OCPP WebSocket server used by simulators only: `ws://localhost:9000`
- Optional monitoring UI: `http://localhost:5173`

Known simulated charge points:
- `CP-NEX-001` — NEX TOWER
- `CP-NEX-002` — NEX TERRACOM II

The custom product remains responsible for users, booking logic, slot conflict prevention, reminders, in-app/email/Microsoft Teams notifications, reporting, ESG dashboards, AI insights, and frontend UX.

Required CSMS REST API integration points:
- `GET /api/stations`
- `GET /api/stations/:identity`
- `GET /api/sessions`
- `GET /api/sessions/active`
- `GET /api/sessions/:id`
- `POST /api/auth/tags`
- `DELETE /api/auth/tags/:idTag`
- `GET /api/auth/tags?active=true`
- `POST /api/stations/:id/remote-start`
- `POST /api/stations/:id/remote-stop`
- `PUT /api/stations/:id/connectors/:n/block`
- `DELETE /api/stations/:id/connectors/:n/block`

## Guiding Principle
Agents produce outputs that other agents consume. Always check whether a previous agent's output exists before starting. If it does not exist, the prior agent must run first — do not proceed on missing inputs.

---

## Execution Sequence

Run agents in this order. Each phase depends on the previous one being complete.

```
Phase 1 — Understand (Hours 0–1)
  └── product-analyst         → writes docs/project-context.md

Phase 2 — Design (Hours 1–2)
  ├── solution-architect       → writes docs/architecture.md, extends docs/api-conventions.md
  └── azure-devops-scrum-master → creates Azure DevOps board from project-context.md + architecture.md

Phase 3 — Build (Hours 2–13)
  ├── backend-developer        → implements endpoints from docs/api-conventions.md
  ├── frontend-developer       → builds UI from docs/architecture.md + api-conventions.md
  ├── code-reviewer            → reviews changes before merge
  └── qa-test-engineer         → validates stories against acceptance criteria

Phase 4 — Demo (Hours 14–16)
  └── demo-coach               → reads Done stories from board, writes demo script
```

Rules:
- Demo preparation may begin at Hour 14 using only stories already marked Done.
- Code freeze happens at Hour 15.
- Final demo script must be locked after Hour 15.
- Do not include any feature in the final pitch unless it is marked Done before code freeze

## Timebox Rules

The hour ranges are planning targets, not strict execution locks.

Agents may start earlier only if all required inputs and gates are complete.
Agents must not start later-phase work if required outputs from earlier phases are missing.
If a phase overruns its timebox, the azure-devops-scrum-master must recommend scope cuts instead of allowing uncontrolled delay.

---

## Agent Directory

### `product-analyst`
**Purpose:** Converts the product brief into build-ready scope.
**Reads:** Product brief (verbal/written), `CLAUDE.md`, `docs/project-context.md` (if exists)
**Writes:** `docs/project-context.md`
**Produces:** Product summary, target users, problem statement, MVP flow, P0/P1/P2 feature table, user stories with acceptance criteria, assumptions, out-of-scope list, demo flow, risks, provided-CSMS integration assumptions
**Uses skill:** `skills/azure-devops-story-creator/`
**Must complete before:** `solution-architect`, `azure-devops-scrum-master`

---

### `solution-architect`
**Purpose:** Designs the simplest stable architecture for a 16-hour build.
**Reads:** `CLAUDE.md`, `docs/project-context.md`, `docs/api-conventions.md` (if exists)
**Writes:** `docs/architecture.md`, `docs/api-conventions.md`
**Produces:** Tech stack decision, folder structure, entity definitions, API contract, frontend/backend integration map, CSMS integration boundary, build sequence, time budget, risks, out-of-scope decisions
**Uses skill:** `skills/api-contract-generator/`
**Must complete before:** `backend-developer`, `frontend-developer`, `azure-devops-scrum-master`

---

### `azure-devops-scrum-master`
**Purpose:** Creates and maintains the Azure DevOps board, enforces time gates, recommends scope cuts.
**Reads:** `CLAUDE.md`, `docs/project-context.md`, `docs/architecture.md`
**Writes:** Azure DevOps board (Epic, Features, Stories, Tasks)
**Produces:** Board structure, Epic → Feature → Story → Task hierarchy, priorities, owner suggestions, status recommendations, time gate assignments, scope cut recommendations, CSMS integration tasks without custom OCPP tasks
**Uses skill:** `skills/azure-devops-story-creator/`
**Template:** `docs/templates/azure-devops-user-story-template.md`
**Must complete before:** `backend-developer`, `frontend-developer`, `qa-test-engineer`

---

### `backend-developer`
**Purpose:** Implements backend APIs, models, validation, business logic, and seed data.
**Reads:** `CLAUDE.md`, `AGENTS.md`, `docs/project-context.md`, `docs/architecture.md`, `docs/api-conventions.md`, assigned Azure DevOps story
**Writes:** Source code in `backend/`, GitHub feature/bugfix branch, implementation notes under `docs/implementation/`
**Produces:** Implemented endpoints, CSMS REST API client/wrapper where needed, API test examples, changed file summary, GitHub branch/PR reference, commit message
**Uses skill:** `skills/backend-api-builder/`
**Depends on:** `solution-architect` (API contract must exist before coding begins)

---

### `frontend-developer`
**Purpose:** Implements frontend screens, components, forms, API integration, and UI states.
**Reads:** `CLAUDE.md`, `AGENTS.md`, `docs/project-context.md`, `docs/architecture.md`, `docs/api-conventions.md`, assigned Azure DevOps story
**Writes:** Source code in `frontend/`, GitHub feature/bugfix branch, implementation notes under `docs/implementation/`
**Produces:** Implemented screens using backend-provided charger/session data, manual test steps, changed file summary, GitHub branch/PR reference, commit message
**Uses skill:** `skills/frontend-feature-builder/`
**Depends on:** `solution-architect` (API contract), `backend-developer` (endpoint deployed or contract confirmed)

---

### `code-reviewer`
**Purpose:** Reviews code changes for correctness, contract compliance, security, and demo safety before merge.
**Reads:** `CLAUDE.md`, `docs/api-conventions.md`, `docs/project-context.md`, changed files, linked Azure DevOps story
**Writes:** Review verdict and findings in the GitHub PR when available, and Azure DevOps work-item comments when relevant
**Produces:** Verdict (approve / approve with notes / changes required), blocking issues, non-blocking improvements, grep findings, CSMS/OCPP boundary findings, PR/work-item traceability findings, suggested fixes
**Uses skill:** `skills/code-reviewer/`
**When to invoke:** After every significant change, before merging to the main branch

---

### `qa-test-engineer`
**Purpose:** Creates test cases, finds bugs, validates acceptance criteria, and runs the smoke test checklist.
**Reads:** `CLAUDE.md`, `docs/project-context.md`, `docs/api-conventions.md`, assigned Azure DevOps story acceptance criteria
**Writes:** Test cases and bug reports to Azure DevOps, shared QA artifacts under `tests/`
**Produces:** P0/P1/P2 test cases, simulator-backed CSMS integration tests, negative tests, regression checklist, demo risk list, GitHub branch/PR validation notes, bug reports
**Uses skill:** `skills/qa-test-case-generator/`
**When to invoke:** After a developer marks a story Resolved; before the story is marked Done

---

### `demo-coach`
**Purpose:** Prepares the final pitch, demo script, judge Q&A preparation, and fallback plan.
**Reads:** `CLAUDE.md`, `docs/project-context.md`, `docs/architecture.md`, Azure DevOps board (Done stories only)
**Writes:** Demo script, judge Q&A, backup plan
**Produces:** Opening pitch, problem statement, demo sequence, value points, technical highlights including provided CSMS integration, AI feature framing, business impact, roadmap, judge Q&A, fallback plan
**Uses skill:** `skills/demo-prep/`
**Must not start before:** Hour 14. Must not pitch any feature not marked Done on the board.

---

## Skill Directory

Skills are reference libraries that agents use. An agent reads the relevant `SKILL.md` before producing output in that domain.

| Skill folder | Used by | Purpose |
|---|---|---|
| `skills/api-contract-generator/` | `solution-architect`, `backend-developer` | Define and validate API contracts |
| `skills/azure-devops-story-creator/` | `product-analyst`, `azure-devops-scrum-master` | Create well-formed Epic, Feature, and User Story work items |
| `skills/backend-api-builder/` | `backend-developer` | Implement endpoints consistently |
| `skills/code-reviewer/` | `code-reviewer` | Review code for correctness and demo safety |
| `skills/frontend-feature-builder/` | `frontend-developer` | Implement UI features with correct states |
| `skills/qa-test-case-generator/` | `qa-test-engineer` | Generate test cases and bug reports |
| `skills/demo-prep/` | `demo-coach` | Prepare pitch, demo script, fallback plan |

Each skill folder contains:
- `SKILL.md` — instructions, workflow, and rules for that domain
- `references/` — supporting reference files (checklists, templates, conventions)

---

## File Ownership

This table defines which agent is responsible for each key file. Only the owning agent should write to the file. Other agents read it.

| File | Owner | Other agents that read it |
|---|---|---|
| `docs/project-context.md` | `product-analyst` | All agents |
| `docs/architecture.md` | `solution-architect` | All agents |
| `docs/api-conventions.md` | `solution-architect` (initial) | `backend-developer` (extends), `frontend-developer`, `code-reviewer` |
| Azure DevOps board | `azure-devops-scrum-master` | All agents |
| GitHub repository / branches / pull requests | `backend-developer`, `frontend-developer`, `code-reviewer` | `qa-test-engineer`, `demo-coach` |
| `frontend/` source | `frontend-developer` | `code-reviewer`, `qa-test-engineer` |
| `backend/` source | `backend-developer` | `code-reviewer`, `qa-test-engineer` |
| `tests/` | `qa-test-engineer` | `code-reviewer` |
| Demo script / fallback plan | `demo-coach` | All team members |

If a non-owning agent needs to change a file it does not own, it must flag the change explicitly rather than editing silently.

---

## Build and Test Commands

> **Complete this section as soon as the tech stack is confirmed (within the first 30 minutes).** This is the responsibility of the solution architect. Every developer must be able to run the project from a fresh clone using only these commands.

```bash
# ── Install dependencies ──────────────────────────────────────────
# TBD — replace after stack is confirmed
# Example: npm install / pip install -r requirements.txt

# ── Database setup ────────────────────────────────────────────────
# TBD — migration and seed commands
# Example: npm run db:migrate && npm run db:seed

# ── Development servers ───────────────────────────────────────────
# TBD — frontend and backend dev server commands
# Example: npm run dev (frontend on :3000, backend on :3001)

# ── Tests ─────────────────────────────────────────────────────────
# TBD — run all tests
# Example: npm test / pytest

# ── Build (pre-demo check) ────────────────────────────────────────
# TBD — production build to verify no build errors before demo
# Example: npm run build
```

**Who fills this in:** `solution-architect` during Phase 2.
**When it must be complete:** Before any developer starts Phase 3 work.

---

## Code Style

- Keep code simple and explicit — favour clear names over clever abstractions.
- Avoid premature abstraction during the hackathon.
- Remove dead code, `console.log`, `debugger`, and debug-only branches before demo.
- No hardcoded credentials, API keys, or URLs that belong in environment variables.
- No `// MOCK:` data in production code paths at demo time.

## GitHub Workflow

- Azure DevOps work items drive what gets built. GitHub stores the implementation.
- Developers must create a dedicated GitHub branch for each assigned Azure DevOps task, bug, or small feature.
- Branch naming convention:
  - `feature/ado-<workItemId>-<short-feature-name>`
  - `bugfix/ado-<workItemId>-<short-fix-name>`
  - `chore/ado-<workItemId>-<short-task-name>`
- Do not push directly to `main`.
- Pull requests must reference the Azure DevOps work item ID in the title or description.
- Code reviewer reviews GitHub branches/PRs against the linked Azure DevOps acceptance criteria.
- QA validates the GitHub branch/PR against the Azure DevOps User Story before the story is marked Done.
- If GitHub remote access is unavailable, provide the exact commands the user should run instead of claiming the push or PR was completed.

## Commit Format

```
US-###: Short description of completed work
BUG-###: Short description of fix
feat(scope): short description - ADO #<id>
fix(scope): short description - ADO #<id>
```

Examples:
```
US-001: Add request creation form
US-001: Implement POST /api/requests endpoint
BUG-004: Fix validation message on empty title field
feat(booking): implement slot reservation API - ADO #142
fix(chargers): handle unavailable charger state - ADO #156
```

## Azure DevOps Interaction

- Azure DevOps interaction happens via the Azure DevOps MCP server.
- Azure DevOps MCP is for work items only. Do not use it as a code repository interface.
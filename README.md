# Hackathon Claude + Azure DevOps AI Kit

A reusable kit of Claude Code agents, skills, and structured project docs for a 16-hour Azure DevOps hackathon.

> **The most important rule:** Azure DevOps is the source of truth for work items. The `docs/` folder gives Claude and your team stable project context. They work together — neither replaces the other.

---

## Before the Hackathon Starts

Do these steps before the day begins — not on the day itself.

**1. Clone this repo and verify the structure matches the layout below.**

**2. Confirm your team roles.** Each person should know which agents they will drive:
| Role | Primary agents |
|------|---------------|
| Product / Analyst | `product-analyst`, `azure-devops-scrum-master` |
| Backend developer | `backend-developer`, `code-reviewer` |
| Frontend developer | `frontend-developer`, `code-reviewer` |
| QA / Tester | `qa-test-engineer` |
| Demo lead | `demo-coach` |

One person can own multiple roles. The scrum master role can be shared.

**3. Read `CLAUDE.md` and `AGENTS.md` so every team member understands the rules before the brief is revealed.**

**4. Set up your Azure DevOps project** (Boards, Repos, Pipelines) before the day. Do not spend hackathon time on DevOps setup.

**5. Set up your `.env` file.**
Copy `.env.template (at project root)` to your project root as `.env` and fill in your values:
- `AZURE_DEVOPS_PAT` — generate at `https://dev.azure.com/{your-org}/_usersSettings/tokens` with scope `Work Items (Read & Write)`
- `AZURE_DEVOPS_ORG` — your organisation slug from the DevOps URL
- `AZURE_DEVOPS_PROJECT` — your project name from the DevOps URL

Confirm `.env` is in your `.gitignore` before committing anything.

---

## First 30 Minutes (after brief is revealed)

This is the most critical window. Move fast.

| Minutes | Who | Action |
|---------|-----|--------|
| 0–15 | Product Analyst | Run `product-analyst` agent → outputs `docs/project-context.md` |
| 10–20 | Solution Architect | Run `solution-architect` agent → outputs `docs/architecture.md` + fills tech stack in `CLAUDE.md` |
| 15–25 | Scrum Master | Run `azure-devops-scrum-master` agent → creates board with P0/P1/P2 stories |
| 20–30 | All developers | Clone repo, run setup commands from `AGENTS.md`, confirm app starts |
| 30 | Everyone | Quick sync: does every developer have a P0 story assigned and unblocked? |

Do not start writing code before `docs/project-context.md` is marked **Ready for Development** and the board has stories.

---

## Folder Structure

```
repo-root/
│
├── CLAUDE.md                          ← Root operating rules — every agent reads this first
├── AGENTS.md                          ← Agent directory, skill map, handoff sequence, build commands
├── README.md                          ← This file
│
├── docs/
│   ├── project-context.md             ← Product analyst output — MVP scope, P0/P1/P2, entities
│   ├── architecture.md                ← Tech stack, folder structure, entities, build order
│   ├── api-conventions.md             ← API contracts, field names, error shapes (source of truth)
│   └── templates/
│       └── azure-devops-user-story-template.md  ← Story format for Azure DevOps
│
├── agents/
│   ├── product-analyst.md
│   ├── solution-architect.md
│   ├── azure-devops-scrum-master.md
│   ├── backend-developer.md
│   ├── frontend-developer.md
│   ├── qa-test-engineer.md
│   ├── code-reviewer.md
│   └── demo-coach.md
│
├── skills/
│   ├── api-contract-generator/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── api-contract-template.md
│   │       └── rest-naming-rules.md
│   ├── azure-devops-story-creator/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── priority-rules.md
│   │       └── story-template.md
│   ├── backend-api-builder/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── backend-endpoint-checklist.md
│   │       └── validation-and-error-conventions.md
│   ├── code-reviewer/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── review-checklist.md
│   │       └── security-quick-check.md
│   ├── frontend-feature-builder/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── page-state-patterns.md
│   │       └── ui-feature-checklist.md
│   ├── qa-test-case-generator/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── bug-severity-matrix.md
│   │       ├── smoke-test-checklist.md
│   │       └── test-case-template.md
│   └── demo-prep/
│       ├── SKILL.md
│       └── references/
│           ├── backup-demo-plan.md
│           ├── demo-script-template.md
│           └── judge-qa-template.md
│
├── frontend/                          ← Frontend source code
├── backend/                           ← Backend source code
└── tests/                             ← Test files
```

---

## How Agents and Skills Work Together

**Agents** are role-specific personas. They have priorities, workflows, and rules for a specific job (e.g., backend developer).

**Skills** are reference libraries. An agent reads the relevant `SKILL.md` and its `references/` files before producing output in a specific domain.

**They are designed to work together** — an agent doesn't contain all the knowledge it needs, it reads the skill. This keeps agents lean and skills reusable.

Example: the `backend-developer` agent reads `CLAUDE.md` → `docs/api-conventions.md` → `skills/backend-api-builder/SKILL.md` → `skills/backend-api-builder/references/backend-endpoint-checklist.md` before writing a single line of code.

---

## Hackathon Execution Timeline

| Hours | Phase | Agents active | Gate to proceed |
|-------|-------|--------------|-----------------|
| 0–1 | Understand | `product-analyst`, `solution-architect`, `azure-devops-scrum-master` | `project-context.md` marked Ready for Development |
| 1–8 | Build P0 | `backend-developer`, `frontend-developer`, `code-reviewer`, `qa-test-engineer` | All P0 stories marked Done |
| 8–13 | Build P1 | Same as above | All P1 priority stories Done or cut |
| 13–14 | Stabilise | `qa-test-engineer`, `code-reviewer` | No Blocker or High bugs open |
| 14–15 | Demo prep | `demo-coach` | Done story list confirmed with scrum master |
| 15–16 | **Code freeze** | `demo-coach`, `qa-test-engineer` | Rehearsal complete, fallback plan ready |

**Code freeze at hour 15** — no new features, no merges without scrum master approval. Bug fixes only.

---

## Key Rules at a Glance

| Rule | Detail |
|------|--------|
| Work from the board | Every task must be a linked Azure DevOps work item |
| One story at a time | Do not start the next story until the current is Done |
| Contract first | API contract must exist in `docs/api-conventions.md` before implementation begins |
| Mark your mocks | All temporary mock data uses `// MOCK: replace with [endpoint]` |
| Freeze at hour 15 | No new features after hour 15 — scrum master enforces this |
| Only pitch Done stories | Demo coach never pitches features not marked Done on the board |
| Stop, don't guess | If ambiguity could cause building the wrong thing, flag it — don't assume through it |

---

## File Quick Reference

| I need to… | Read this file |
|-----------|---------------|
| Understand project operating rules | `CLAUDE.md` |
| Know what agents exist and what order to run them | `AGENTS.md` |
| Know what we are building and what is in scope | `docs/project-context.md` |
| Know the tech stack and entities | `docs/architecture.md` |
| Know the API contracts and field names | `docs/api-conventions.md` |
| Create a new user story | `docs/templates/azure-devops-user-story-template.md` |
| Understand how to prioritise stories | `skills/azure-devops-story-creator/references/priority-rules.md` |
| Know what error shapes to use | `skills/backend-api-builder/references/validation-and-error-conventions.md` |
| Know what UI states to implement | `skills/frontend-feature-builder/references/page-state-patterns.md` |
| Know how severe a bug is | `skills/qa-test-case-generator/references/bug-severity-matrix.md` |
| Run the pre-demo smoke test | `skills/qa-test-case-generator/references/smoke-test-checklist.md` |
| Prepare the demo script | `skills/demo-prep/references/demo-script-template.md` |
| Prepare the fallback plan | `skills/demo-prep/references/backup-demo-plan.md` |

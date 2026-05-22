---
name: azure-devops-story-creator
description: Use this skill when turning hackathon requirements, feature lists, product briefs, or MVP ideas into a single Azure DevOps Epic with Features, User Stories, Tasks, Bugs, acceptance criteria, and definitions of done.
---

# Azure DevOps Story Creator

## Purpose
Create Azure DevOps-ready work items from product requirements. The board you produce becomes the team's execution contract — every story must be specific, testable, and sized for the hackathon time window.

## Reference Files
Before creating any work items, read:
- `references/story-template.md` — standard Feature/User Story/Task format. Use it for every story without exception.
- `references/priority-rules.md` — P0/P1/P2 rules with time-box guidance. Apply these before assigning any priority.

## Before Creating Work Items

1. Read `docs/project-context.md` — this is the product-analyst output. Your stories must match the MVP scope and P0/P1/P2 table defined there. Do not invent stories not in scope.
2. Read `docs/architecture.md` — confirm entity names, API endpoints, and the development sequence before writing task titles.
3. Read `.env` at the project root — note `AZURE_DEVOPS_ORG` and `AZURE_DEVOPS_PROJECT`. Every MCP call must be scoped to these values.
4. Check: is there an existing board or story list? If yes, extend it rather than replacing it. Query the board via MCP before creating anything to avoid duplicates.

## Work Item Hierarchy

```
Epic  (1 per product or major solution area)
 └── Feature  (3–6 per Epic, grouped by domain or capability)
      └── User Story
           ├── [FE] Task
           ├── [BE] Task
           ├── [QA] Task
           └── Bug (when known)
```

There is **one Epic per product**. Do not create multiple Epics for a single hackathon product. Group related user stories under Features — a Feature represents a distinct capability area (e.g. "Request Management", "Approval Workflow", "Dashboard").

Every User Story needs at least one task per discipline involved. A pure-backend story still needs a [QA] task for API testing. A pure-frontend story still needs a [BE] task if it depends on an API.

## Story Sizing Rules
A story is the right size if:
- One developer can complete it in **2–4 hours**
- It has a clear, single pass/fail acceptance criterion
- It can be demonstrated in one screen action or less

If a story would take more than 4 hours, split it. If it would take less than 30 minutes, merge it with a related story.

**Maximum User Stories per Feature: 5.** If a Feature has more than 5 stories, the Feature scope is too broad — split it into two Features. Aim for 3–6 Features per Epic.

## Story Numbering
Do not assign story numbers manually. Azure DevOps assigns IDs automatically when a work item is created via the MCP server. After creation, record the assigned ID back into `docs/project-context.md` next to the story title so other agents can reference it. Use the returned ID in all subsequent task titles: `[FE] #42: Build request form`.

## Output Format
Use `references/story-template.md` exactly. For every story, fill in:
- Title (verb + business object — no manual ID prefix)
- Description (As a / I want / So that — HTML format for DevOps)
- Parent Feature (which Feature this User Story belongs to)
- Priority (P0 / P1 / P2 → maps to numeric 1 / 2 / 3)
- Effort estimate (S = <2h / M = 2–4h / L = >4h — flag L stories as split candidates)
- Demo impact (what the judge sees if this story is done)
- Acceptance criteria in **Given/When/Then** format (specific, testable, pass/fail — HTML format for DevOps description field)
- API contract hints (endpoint, request body fields, success response, error cases — derived from product-analyst output; write "TBD" if architecture is not yet confirmed)
- Business rules
- Dependencies (other stories, agents, or external blockers)
- Tasks ([FE], [BE], [QA])
- Definition of Done

## Execution — Pushing Work Items via MCP

Formatting a story is not the final step. After formatting, push each work item to Azure DevOps using the **Azure DevOps MCP server** (`azure-devops`):

1. **Create the single Epic** if it does not already exist. One Epic covers the entire product.
2. **Create each Feature** as a child of the Epic. Use the capability area name as the Feature title (e.g. "Request Management", "Approval Workflow").
3. **Create each User Story** as a child of its parent Feature.
4. **Create Tasks** as children of their parent User Story. Prefix task titles with the discipline: `[FE]`, `[BE]`, `[QA]`.
5. **Record the returned work item ID** for each created item. Update `docs/project-context.md` with the ID next to the story title.
6. **Confirm creation** — after pushing all items, report: "1 Epic, X Features, Y User Stories, Z Tasks created in project [AZURE_DEVOPS_PROJECT]."

Do not stop after producing formatted markdown. A story that exists only in the chat has no value to the team.

## Rules
- Keep stories small enough to complete within one phase (P0 = hours 1–8).
- Every story must have at least one testable acceptance criterion.
- Avoid vague titles: "Manage requests" → "Submit a new request", "View request list".
- Do not create stories for tasks the architect said are out of scope.
- Never hardcode org or project name — always read from `.env`.
- **If you cannot determine scope from `docs/project-context.md`, stop and flag it. Do not invent scope.**

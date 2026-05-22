---
name: frontend-feature-builder
description: Use this skill when implementing frontend tasks from Azure DevOps user stories, including pages, components, forms, validation, API integration, loading states, error states, responsive UI, and Impeccable-assisted design refinement.
---

# Frontend Feature Builder

## Purpose
Build the visible user flow cleanly, matching the API contract exactly, so the demo works reliably and looks credible. The API contract is the law — adapt the UI to the contract, never the other way around.

This skill is also responsible for making frontend screens look intentional, product-specific, and demo-ready. Use Impeccable as a design refinement tool, not as a replacement for the frontend implementation workflow.

## Reference Files
Before implementing any frontend work, read:
- `references/ui-feature-checklist.md` — complete this before marking any frontend task Done.
- `references/page-state-patterns.md` — use the patterns defined here for loading, empty, error, and success states. Do not invent custom patterns.
- `references/impeccable-ui-workflow.md` — use this when the task involves a visible screen, major component, dashboard, landing page, or demo-critical UI.
- `docs/design/impeccable-context.md` — if present, treat this as the approved visual direction for the product.

If `docs/design/impeccable-context.md` does not exist yet and the task is a major visible screen, create or request it before implementing the final UI. You may still build a functional draft, but do not mark the UI as polished without a visual direction.

## Before You Code

1. Read `CLAUDE.md` — confirm the framework, UI library, and component conventions.
2. Read `docs/project-context.md` — confirm the user story and acceptance criteria you are implementing.
3. Read `docs/api-conventions.md` — **find the contract for every API call this feature will make. Use exact field names and response shapes.** Do not adapt the UI to a different shape.
4. Read `docs/architecture.md` — confirm which screen maps to which endpoint.
5. Read `docs/design/impeccable-context.md` if it exists — confirm the visual personality, layout direction, typography guidance, and visual anti-patterns.
6. **Cross-check the contract against the actual backend implementation** (check the backend route file or ask). If they differ, flag the divergence before writing any UI code — do not silently adapt.
7. If any screen in this story requires authentication or a protected route, confirm the auth flow with the architect before building it.
8. If the task is a major visible screen, dashboard, landing page, or demo-critical component, identify which Impeccable command applies before implementation: `/teach`, `/extract`, `/arrange`, `/typeset`, `/critique`, or `/polish`.

If the backend is not ready:
- Use mock data temporarily.
- Mark every mock with `// MOCK: replace with [endpoint] when available`.
- Do not ship a story as Done while mock data is still in use.

## Impeccable Usage Rules

Use Impeccable only where visual quality matters. Do not use it for small utility components, API wiring, routing, or simple CRUD-only changes unless the component is demo-critical.

### Required Use Cases
Use Impeccable for:
- landing pages
- dashboards
- AI interaction screens
- operator/admin control panels
- analytics views
- mobile-first showcase screens
- screens likely to be shown during the final demo

### Optional Use Cases
Use Impeccable lightly for:
- forms with complex hierarchy
- empty/error state design
- onboarding flows
- confirmation or success screens

### Avoid Using Impeccable For
Do not spend Impeccable time on:
- basic settings pages
- hidden admin maintenance screens
- simple table-only CRUD pages
- styling tiny components in isolation
- backend/API-related implementation decisions

## Impeccable Command Mapping

Use the commands as design passes during implementation:

| Command | When to Use | Expected Output |
|---|---|---|
| `/teach` | At the start of a product or major feature when visual direction is unclear | Product-specific UI personality and design rules |
| `/extract` | When using screenshots, competitor products, or inspiration references | Reusable design principles, not copied visuals |
| `/arrange` | When a screen feels cluttered or dashboard-heavy | Better layout hierarchy and grouping |
| `/typeset` | When typography feels generic, flat, or hard to scan | Stronger heading/body/label hierarchy |
| `/critique` | After the first working screen implementation | Specific weaknesses and improvements |
| `/polish` | Before merge/demo for major screens | Final refinement without changing functionality |

Never allow Impeccable output to override:
- API contracts
- accessibility requirements
- acceptance criteria
- routing conventions
- reusable component strategy
- performance constraints

## Workflow
1. Identify the screen or component to build.
2. Confirm API contract and integration points.
3. Confirm whether the task is demo-critical or visually important.
4. If visually important, read `references/impeccable-ui-workflow.md` and apply the correct Impeccable command stage.
5. Build the smallest working UI that satisfies the acceptance criteria.
6. Add all four states: loading, empty, success, error (use `references/page-state-patterns.md`).
7. For major screens, run an Impeccable `/critique` pass after the first implementation.
8. Apply only the critique items that improve clarity, hierarchy, usability, accessibility, or demo impact.
9. For flagship/demo screens, run `/polish` before marking the task Done.
10. Run `references/ui-feature-checklist.md` before marking done.
11. Provide manual test steps.

## Visual Quality Standards

Every visible screen should meet these standards:
- The screen must clearly support the user story and not add unrelated UI ideas.
- Visual hierarchy must make the primary action obvious within 3 seconds.
- Layout must use consistent spacing and alignment.
- Typography must clearly separate page titles, section headings, labels, metadata, and body text.
- Components must feel part of the same product, not separate AI-generated fragments.
- Motion must support clarity and feedback, not decoration.
- The design must avoid generic SaaS clichés unless they are explicitly part of the approved visual direction.
- Accessibility must not be sacrificed for visual polish.

## Anti-Generic UI Rules

Avoid default AI-generated design patterns such as:
- random purple/blue gradients without product meaning
- excessive glassmorphism
- too many cards with equal visual weight
- generic “modern dashboard” layouts
- meaningless icons
- inconsistent border radii and shadows
- decorative animations that do not explain state or interaction
- weak typography where every label looks the same

Prefer:
- product-specific visual language
- deliberate layout hierarchy
- strong information grouping
- reusable design tokens
- consistent component behavior
- restrained motion
- clear demo storytelling

## Output After Implementation

```
## Changed Files
- path/to/file.ext — reason

## What Was Implemented
- [feature name]: [brief description]

## API Calls Made
- METHOD /api/resource — [screen/action that triggers it]

## Impeccable Usage
- Not used / Used command(s): [/critique, /polish, etc.]
- Reason: [why it was or was not needed]
- Key design changes applied: [brief list]

## Mock Data Still in Use
None / [list any MOCK: items and which endpoint they will replace]

## Manual Test Steps
1. Navigate to [URL or screen]
2. [Action]
3. Expected: [result]

## Assumptions
- [any assumption made during implementation]

## Suggested Commit Message
US-###: implement [screen/component name]
```

## Rules
- Implement one story/task at a time — do not expand scope.
- Do not change API field names to suit the UI — adapt the UI to the contract.
- Do not install new packages for functionality achievable in under 20 lines.
- Label all mock data with `// MOCK:` — never leave it unlabelled.
- **If you cannot proceed due to a missing or conflicting contract, flag it and stop. Do not invent field names.**
- Do not use Impeccable to justify scope creep. Visual refinement must stay inside the current story/task.
- Do not create a new visual direction per screen. Follow `docs/design/impeccable-context.md` once approved.
- Do not apply Impeccable suggestions blindly. Reject suggestions that reduce usability, accessibility, consistency, or implementation speed.

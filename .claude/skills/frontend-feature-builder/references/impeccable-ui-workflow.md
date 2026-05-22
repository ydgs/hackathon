# Impeccable UI Workflow Reference

## Purpose
Use this reference to decide when and how to use Impeccable slash commands during frontend feature implementation.

Impeccable should improve visual clarity, originality, and demo impact. It must not replace acceptance criteria, API contracts, accessibility, or component conventions.

## Command Workflow

### 1. `/teach` — establish visual direction
Use when:
- starting a new product
- starting a major new module
- the UI direction is unclear
- the current UI looks generic

Prompt pattern:

```txt
/teach

We are building [product/module].
The experience should feel [3-5 adjectives].
Users are [user types].
The most important user actions are [actions].
Avoid [visual anti-patterns].
Create a concise visual direction for frontend implementation.
```

Save the useful output into `docs/design/impeccable-context.md`.

---

### 2. `/extract` — learn from inspiration without copying
Use when:
- you have screenshots or UI references
- you want to understand why a reference looks good
- you need reusable layout or typography principles

Prompt pattern:

```txt
/extract

Analyze this reference UI.
Extract reusable principles for:
- layout
- spacing
- typography
- color use
- interaction behavior
- information hierarchy

Do not copy the design directly.
```

Save durable principles into `docs/design/impeccable-context.md` or the design system reference.

---

### 3. `/arrange` — improve layout composition
Use when:
- dashboard content feels crowded
- sections compete for attention
- the primary action is not obvious
- cards/tables/charts need better grouping

Prompt pattern:

```txt
/arrange

Improve the layout composition of this screen.
Prioritize:
- scan speed
- grouping
- visual hierarchy
- demo readability
- responsive behavior

Do not change business logic or API integration.
```

---

### 4. `/typeset` — improve typography hierarchy
Use when:
- the page feels flat
- headings, labels, and metadata look too similar
- the screen is hard to scan
- dense information needs better readability

Prompt pattern:

```txt
/typeset

Improve typography hierarchy for this screen.
Define clearer treatment for:
- page title
- section heading
- card title
- field label
- metadata
- body text
- status text

Do not change content meaning.
```

---

### 5. `/critique` — review first implementation
Use when:
- the screen is functionally complete
- before marking a major UI task Done
- before a demo review

Prompt pattern:

```txt
/critique

Review this frontend screen for:
- visual hierarchy
- originality
- product-specific design
- spacing and alignment
- typography
- accessibility
- responsive behavior
- demo impact

Return only actionable issues and suggested fixes.
```

Apply only high-value improvements. Do not derail the story.

---

### 6. `/polish` — final refinement pass
Use when:
- a flagship screen is ready
- the final demo is approaching
- visual quality is acceptable but not impressive

Prompt pattern:

```txt
/polish

Polish this screen for final demo quality.
Improve:
- spacing rhythm
- visual hierarchy
- micro-interactions
- alignment
- state presentation
- perceived product maturity

Do not change functionality or add new scope.
```

## Usage Decision Matrix

| Screen Type | Required Commands |
|---|---|
| Landing page | `/teach`, `/critique`, `/polish` |
| Main dashboard | `/arrange`, `/typeset`, `/critique`, `/polish` |
| AI assistant/chat screen | `/teach`, `/critique`, `/polish` |
| Analytics/reporting screen | `/arrange`, `/typeset`, `/critique` |
| Complex form | `/typeset`, `/critique` |
| Simple CRUD screen | Optional `/critique` only |
| Hidden admin utility screen | Usually none |

## Stop Conditions

Stop using Impeccable when:
- the change would alter API contracts
- the suggestion adds unsupported functionality
- the suggestion creates inconsistency with approved components
- the design becomes slower to implement than the story allows
- accessibility becomes worse
- visual polish starts replacing core feature delivery

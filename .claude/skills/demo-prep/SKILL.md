---
name: demo-prep
description: Use this skill when preparing the final hackathon demo, including pitch script, demo sequence, judge Q&A, and fallback plan. Only pitch what is marked Done on the board.
---

# Demo Prep

## Purpose
Turn a working product into a compelling, rehearsable demo that wins judges in 4 minutes. The demo is a performance — it needs a script, a sequence, and a fallback. Improvising costs points.

## Reference Files
Before preparing any demo materials, read:
- `references/demo-script-template.md` — use this structure for the complete demo script.
- `references/judge-qa-template.md` — use this to anticipate and prepare for judge questions.
- `references/backup-demo-plan.md` — use this to document and rehearse the fallback plan.

## Before You Write

1. Read `CLAUDE.md` — product name, team name, any branding guidance.
2. Read `docs/project-context.md` — original problem statement, target users, and product vision.
3. Read `docs/architecture.md` — what was designed (for technical highlights).
4. **Check the Azure DevOps board — list every story marked Done.** You may only pitch features that are Done. Do not pitch planned features, in-progress features, or features that "mostly work." If you cannot access the board, ask the team for a Done list before proceeding.
5. If the demo window is not 4 minutes, ask the team for the actual time limit before scripting.

## Demo Time Budget (default: 4 minutes)

| Segment | Time | Purpose |
|---------|------|---------|
| Opening hook + problem | 30s | Grab attention, establish why this matters |
| Solution statement | 15s | One sentence: what the product does |
| Live demo | 2min | Show the P0 flow working |
| Value close | 30s | Business impact, key numbers, why it wins |
| Roadmap tease | 15s | 1–2 cut features — shows vision |
| (Buffer for Q&A setup) | 30s | Do not script this — it is natural transition time |

If the window is longer, expand the live demo segment — do not add more talking.

## AI Feature Framing
For any AI feature in the product, explain it using this structure:

1. **User benefit first:** what does the user get? (faster, smarter, less manual work)
2. **Mechanism briefly:** how does it work? (one sentence, no model names unless impressive)
3. **Never lead with:** "we used Claude / GPT / LLaMA to..." — that is a development tool mention, not a product value statement.

Bad: "We used Claude Sonnet to classify requests."
Good: "The system automatically classifies incoming requests by urgency — what used to take a manager 20 minutes now happens instantly."

## Rules
- Only pitch Done features.
- Assume a 4-minute window unless told otherwise.
- Every demo step must be completable in under 30 seconds.
- The demo sequence must be linear — no branching ("if the judge wants to see X, we can also show Y"). Branching causes confusion and wasted time.
- The fallback plan must be prepared and rehearsed before the demo — not created at the last minute.
- The person running the live demo should practice it at least twice before the real thing.
- **If you cannot confirm what is Done, stop and ask. Do not pitch unbuilt features.**

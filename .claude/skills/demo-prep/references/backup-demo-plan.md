# Backup Demo Plan

Complete this before the demo rehearsal — not during a live crisis. A fallback plan that doesn't exist before the demo is not a fallback plan.

The backup plan exists because: live demos fail. Network drops, environments crash, merges break things. A team with a prepared fallback recovers in 10 seconds. A team without one loses composure and points.

---

## Fallback Trigger
What is the agreed signal to switch from the live demo to the fallback?

Examples:
- App fails to load after 10 seconds
- API error appears on screen during the P0 flow
- Presenter cannot complete a step after one retry

**Our trigger:**
> [Write the specific, agreed signal here]

**Who calls it:** [Name — only one person makes this call. Not the presenter — ideally a teammate watching the screen.]

---

## Fallback Option 1: Screen Recording (Recommended)
A pre-recorded walkthrough of the P0 demo flow, recorded on a working build.

**Recording details:**
- Recorded on: [date] [build/commit]
- Duration: [X minutes — should match or be shorter than the live demo]
- Stored on: [local file path / USB / Google Drive link]
- Available on: [presenter's machine AND a second device]

**How to switch:**
1. [Presenter says: "Let me switch to our recorded walkthrough."]
2. [Open the file at: path/filename.mp4]
3. [Play from the beginning — do not skip ahead]
4. [Continue narrating over the recording as if it were live]

**Practice required:** Presenter must narrate over the recording at least once before the real demo.

---

## Fallback Option 2: Screenshots / Slides
A prepared slide deck with screenshots of every demo step.

**File details:**
- File name: [filename.pptx / .pdf]
- Stored on: [local file path / USB / Google Drive link]
- Available on: [presenter's machine AND a second device]

**Slide sequence:**
| Slide | Screenshot / Content | Words to say |
|-------|---------------------|-------------|
| 1 | [Dashboard loaded] | "Here's the dashboard." |
| 2 | [New request form] | "Creating a new request." |
| 3 | [Submitted — appears in list] | "Submitted — appears instantly." |
| 4 | [Approval view] | "The approver sees it here." |

**How to switch:**
1. [Presenter says: "Let me show you the flow."]
2. [Open the file immediately — do not explain why you're switching]
3. [Progress through slides while narrating]

---

## What NOT to Do During a Live Failure
- Do not apologize excessively — acknowledge once ("let me switch to our prepared walkthrough") and move forward.
- Do not attempt to debug live. One retry is acceptable. Two is the signal to switch.
- Do not improvise a different demo flow. Follow the fallback script.
- Do not let silence last more than 5 seconds. Narrate while switching.

---

## Environment Risks and Mitigations
Document the specific risks for this product and how they are mitigated:

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Network drops | Medium | Use localhost — do not rely on external APIs during demo |
| Backend crashes | Low | Have a running instance on a second machine |
| Merge broke the build | Medium | Freeze the codebase 1 hour before demo — no merges after that |
| Demo data missing | Low | Seed data script run as part of smoke test checklist |
| Projector resolution breaks layout | Low | Test UI at 1024px width minimum |

---

## Freeze Line
**No code merges after:** [Time — recommended: 1 hour before demo]

After the freeze line, only the fallback materials and known-issue workarounds are relevant. Do not attempt last-minute fixes.

**Freeze line owner:** [Name — this person enforces it]

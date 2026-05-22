---
name: qa-test-case-generator
description: Use this skill when generating QA test cases, smoke tests, regression checklists, bug reports, and acceptance validation from Azure DevOps user stories and acceptance criteria.
---

# QA Test Case Generator

## Purpose
Validate that every P0 story works reliably before the demo. Find demo-breaking bugs early — a bug found at hour 10 is fixable; a bug found at hour 15 is a crisis.

## Reference Files
Before producing any QA output, read:
- `references/test-case-template.md` — use this format for every test case. No exceptions.
- `references/bug-severity-matrix.md` — use this to assign severity. Do not assign severity based on gut feeling.
- `references/smoke-test-checklist.md` — run this before every demo rehearsal.

## Before Writing Test Cases

1. Read `docs/project-context.md` — **your test cases are derived from the acceptance criteria, not from what you assume the feature should do.** Test what was agreed, not what seems reasonable.
2. Read `docs/api-conventions.md` — for API-level tests, verify the expected request/response shapes.
3. Confirm with the developer that the build is running before writing tests against it. Do not test a stale build.

**Before retesting a fixed bug:** confirm with the developer that the fix is deployed and the correct build is running. State which build/commit you retested against.

## Test Case Numbering
Use `TC-[StoryNumber]-[SequenceNumber]` format:
- TC-001-01, TC-001-02 — first and second test cases for US-001
- This makes it easy to link tests to stories and find gaps

## Automated vs Manual
In a hackathon:
- Write **manual test steps** for all P0 and P1 test cases — they are faster to create and easier to triage.
- Write **automated tests** only for P0 cases where the framework is already set up and the test can be written in under 15 minutes.
- Do not set up a new test framework during the hackathon unless `CLAUDE.md` requires it.

## Output Format

### Test Planning
```
## Test Scope
In scope: [list stories being tested]
Out of scope: [list explicitly excluded]

## P0 Test Cases
[use references/test-case-template.md for each]

## P1/P2 Test Cases
[use references/test-case-template.md for each]

## Negative Tests
[invalid input, missing fields, edge cases relevant to the demo]

## Regression Checklist
[what to re-verify after any code change — keep to 5–10 items]

## Demo Risk List
Most likely to fail live: [specific feature or flow]
Fallback if it fails: [specific action]
Fallback owner: [FE dev / BE dev / presenter]
Cue to switch to fallback: [what signal triggers the switch]
```

### Bug Reports
Use `references/bug-severity-matrix.md` for severity. Use `references/test-case-template.md` bug format.

## Rules
- Test acceptance criteria first — do not test things not in scope before all ACs pass.
- Do not spend time on obscure edge cases while any P0 happy path is failing.
- Every bug must be linked to a user story or task — unlinked bugs are not actionable.
- Do not retest a fix without confirming the build is current.
- Intermittent bugs (fails 1-in-3 or more) are Blocker-level for demo purposes — flag them as such even if the individual failure seems minor.
- **If acceptance criteria are missing or ambiguous, stop and ask before writing tests. Testing without a spec is guessing.**

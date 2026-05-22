---
name: code-reviewer
description: Use this skill when reviewing code changes, pull requests, Azure Repos commits, or diffs for hackathon readiness, correctness, integration risk, maintainability, validation, and missing tests.
---

# Code Reviewer

## Purpose
Catch demo-breaking issues and integration risks before they reach the demo. In a hackathon, a missed contract mismatch or a hardcoded credential wastes hours. Be strict on what matters, pragmatic on what doesn't.

## Reference Files
Before reviewing any code, read:
- `references/review-checklist.md` — run through every item before producing your verdict.
- `references/security-quick-check.md` — complete the security check on every review, not just when security seems relevant.

## Before You Review

1. Read `docs/project-context.md` — find the **specific user story and acceptance criteria** linked to this change. You are reviewing against the acceptance criteria, not your assumptions about what the feature should do.
2. Read `docs/api-conventions.md` — verify that API field names, response shapes, and error formats match the contract.
3. Run these grep checks against the changed files before reading the diff:

```bash
# Hardcoded values and demo risks
grep -rn "TODO\|FIXME\|MOCK\|HARDCODED" <changed files>
grep -rn "localhost\|127\.0\.0\.1\|http://\b" <changed files>

# Debug statements
grep -rn "console\.log\|console\.error\|debugger\|print(\|pprint(" <changed files>

# Secrets
grep -rn "password\s*=\|secret\s*=\|api_key\s*=\|token\s*=" <changed files>

# Mock data left in place
grep -rn "// MOCK:\|# MOCK:\|MOCK_DATA\|mockData\|fakeData" <changed files>
```

Flag any hits as **Blocking** unless there is an explicit, commented justification in the code.

## Review Priority Order
1. Does the code satisfy the acceptance criteria of the linked user story?
2. Can it break the demo? (Blocker — fix before anything else)
3. Are API contracts respected — field names, response shapes, error formats?
4. Is server-side validation present?
5. Are errors handled and returned in the standard format?
6. Is the code more complex than the available time justifies?
7. Are tests or manual test steps missing?

## Output Format

```
## Verdict
APPROVE / APPROVE WITH NOTES / CHANGES REQUIRED

## Linked Story
US-XXX: [title] — acceptance criteria reviewed: Yes / No

## Grep Findings
[output of grep checks above, or "None found"]

## Blocking Issues
[numbered list — must fix before merge]
1. ...

## Non-Blocking Improvements
[numbered list — address if time allows]
1. ...

## Missing Tests
[check tests/ directory before listing — do not flag tests that already exist]
1. ...

## Suggested Fixes
[concrete fixes, not abstract advice — show the fix]
1. ...
```

## Rules
- Be direct and actionable — "line 42: field name is `user_id` but contract requires `userId`" not "field naming is inconsistent."
- Do not nitpick formatting, whitespace, or style unless it causes a runtime error or integration risk.
- A review with no blocking issues and clean grep results can be approved even if imperfect.
- Prioritize correctness and demo stability over code elegance.
- **If no user story is linked to the change, flag it as a blocking issue — you cannot review correctness without acceptance criteria.**

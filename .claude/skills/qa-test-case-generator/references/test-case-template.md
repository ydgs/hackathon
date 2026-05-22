# Test Case Template

Use this format for every manual test case. Fill in every field. Do not leave fields blank.

---

## Test Case ID
`TC-[StoryNumber]-[Sequence]`
Example: TC-001-01

## Related User Story
US-XXX: [story title]

## Acceptance Criterion Being Tested
Quote the specific acceptance criterion this test validates:
> "User can submit a request and it appears in the list with 'Pending' status."

## Priority
`P0 / P1 / P2` (inherit from the parent story)

## Test Type
`Positive` — verifies the happy path works
`Negative` — verifies the system handles invalid input correctly
`Regression` — verifies an existing flow was not broken by a change
`Smoke` — quick check that the feature loads and responds

## Environment
- Tested on: `localhost:3000` / `staging URL` / `other`
- Browser: `Chrome / Firefox / other`
- Build / commit: ___________

---

## Preconditions
What must be true before the test can begin:
- User is on the [page name] page
- Test data exists: [describe the seed data or setup required]
- User is logged in as: [role, if applicable]

---

## Steps
Number every step. Be precise enough that someone else can follow it without asking questions.

1. Navigate to [URL or page]
2. Click [element name or description]
3. Enter [value] in the [field name] field
4. Click [button name]
5. Observe [what to look at]

---

## Expected Result
What the system should do if the feature is working correctly:
- [specific observable outcome]
- Example: "The new request appears in the list with title 'Test Request' and status 'Pending'."

---

## Actual Result
- **Status:** Pass / Fail / Blocked / Not Run
- **Observed:** [describe what actually happened — be specific, not just "it failed"]
- **Screenshot / evidence:** [attach or link if available]

---

## Severity if Failed
`Blocker / High / Medium / Low`
(Use `references/bug-severity-matrix.md` — do not guess)

---

## Tested By
Name: ___________
Date: ___________

---

## Bug Report (if failed)

Use this section if the test failed. Copy to the Azure DevOps board as a Bug work item.

**Title:** [BUG] US-XXX: [brief description of what is broken]
**Severity:** Blocker / High / Medium / Low
**Linked Story:** US-XXX
**Reproduction frequency:** Always / Intermittent (X-in-Y attempts) / Once

**Steps to Reproduce:**
1. [precise steps]

**Expected Result:**
[what should have happened]

**Actual Result:**
[what actually happened]

**Suggested Fix:**
[if known — otherwise leave blank]

**Retest Status:** Pending / Pass / Fail
**Retest Build/Commit:** ___________
**Retested By:** ___________

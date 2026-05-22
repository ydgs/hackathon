# Code Review Checklist

Run through every section before producing your verdict. Do not skip sections because the change "looks small."

---

## User Story Alignment
- [ ] The change is linked to a specific user story or task (if not, flag as Blocking)
- [ ] All acceptance criteria for the linked story are satisfied by this change
- [ ] Nothing extra was added that increases risk or scope beyond the story
- [ ] If scope was expanded, it is justified and documented

## API Contract Compliance
- [ ] All request field names match `docs/api-conventions.md` exactly (camelCase, correct names)
- [ ] All response field names match the contract exactly
- [ ] HTTP status codes match the contract (200/201/204/400/404/500)
- [ ] List responses use `{ "data": [...], "pagination": {...} }` — not a raw array
- [ ] Error response shapes match `skills/backend-api-builder/references/validation-and-error-conventions.md`

## Correctness
- [ ] Happy path works end-to-end
- [ ] Common failure paths are handled (missing fields, invalid IDs, server errors)
- [ ] No data is silently lost, overwritten, or left in an inconsistent state
- [ ] Edge cases relevant to the demo are handled (empty list, zero results, large input)

## Hardcoded and Debug Values (must be clean before merge)
- [ ] No `console.log`, `console.error`, `debugger`, `print()` left in production code paths
- [ ] No hardcoded `localhost`, `127.0.0.1`, or `http://` URLs that should be env variables
- [ ] No API keys, passwords, tokens, or secrets committed to source
- [ ] No `// TODO`, `// FIXME`, or `// MOCK:` in production code paths (test files are OK)
- [ ] No mock data (`mockData`, `fakeData`, `MOCK_DATA`) used in production code paths

## Simplicity
- [ ] The solution is understandable without needing to ask the author
- [ ] No unnecessary abstraction or indirection added under time pressure
- [ ] No unnecessary npm/pip packages added (if a package was added, was it needed?)
- [ ] No dead code or commented-out blocks left in

## Security (see also `references/security-quick-check.md`)
- [ ] No secrets or credentials in source
- [ ] No sensitive data logged
- [ ] Input validated server-side
- [ ] Error messages do not expose stack traces or internal paths

## Testing
- [ ] Manual test steps are provided (or automated test exists)
- [ ] Happy path verified
- [ ] At least one failure/validation path verified
- [ ] No obvious regression introduced in P0 flows
- [ ] Check `tests/` directory — do not flag tests that already exist

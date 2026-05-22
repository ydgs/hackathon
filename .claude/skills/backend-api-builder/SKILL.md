---
name: backend-api-builder
description: Use this skill when implementing backend tasks from Azure DevOps user stories, including APIs, data models, validation, persistence, business rules, seed data, and error handling.
---

# Backend API Builder

## Purpose
Implement clean, predictable backend endpoints that the frontend can integrate against without surprises. The API contract in `docs/api-conventions.md` is the law — implement it exactly.

## Reference Files
Before writing any code, read:
- `references/backend-endpoint-checklist.md` — complete this checklist before marking any backend task Done.
- `references/validation-and-error-conventions.md` — use the error shapes defined here for every error response. Do not invent a different format.

## Before You Code

1. Read `docs/api-conventions.md` — find the contract for the endpoint you are implementing. **Implement the contract as written.** If it does not exist yet, run the `api-contract-generator` skill first.
2. Read `docs/architecture.md` — confirm entity fields, types, and relationships before touching the database model.
3. Read `docs/project-context.md` — confirm the user story and acceptance criteria you are satisfying.
4. Read `CLAUDE.md` — confirm the framework, ORM, language version, and any required patterns.

If `docs/api-conventions.md` does not define an error format, use `references/validation-and-error-conventions.md` as the standard and note the gap.

## Workflow
1. Confirm the endpoint, request shape, response shape, and validation rules against the contract.
2. Implement the database model/migration if the entity is new.
3. Implement the route handler with input validation.
4. Add seed/demo data if needed for the P0 demo flow.
5. Run through `references/backend-endpoint-checklist.md` before marking done.
6. Provide API test examples.

## Output After Implementation

```
## Changed Files
- path/to/file.ext — reason

## API Implemented
METHOD /api/resource

## Contract Deviations
None / [list any deviations from docs/api-conventions.md and why]

## Environment Variables Required
- VAR_NAME — purpose (add to .env.example if not already there)

## Seed Data
[describe seed data added, or "None"]

## Test Examples
POST /api/resource HTTP/1.1
Content-Type: application/json

{
  "fieldName": "example value"
}

## Suggested Commit Message
US-###: implement [action] [resource] endpoint
```

## Rules
- Do not silently change any field name or response shape from the API contract.
- If a deviation from the contract is necessary, update `docs/api-conventions.md` and notify the frontend developer before they integrate.
- Do not hardcode environment values — use `.env` and add to `.env.example`.
- Add CORS configuration consistent with the rest of the project — do not leave it open (`*`) if auth is in use.
- Keep the implementation simple — no premature abstraction.
- **If you cannot proceed due to a missing contract or unclear data model, stop and flag it. Do not invent field names.**

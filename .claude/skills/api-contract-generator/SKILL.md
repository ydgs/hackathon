---
name: api-contract-generator
description: Use this skill when creating or reviewing API contracts between frontend and backend for Azure DevOps user stories, including endpoints, request bodies, responses, validation, pagination, and error shapes.
---

# API Contract Generator

## Purpose
Create clear, unambiguous API contracts so frontend and backend can work in parallel without integration mismatch. A contract written here is the single source of truth — both agents must follow it exactly.

## Reference Files
Before producing or reviewing any API contract, read:
- `references/api-contract-template.md` — required contract structure for all endpoint types.
- `references/rest-naming-rules.md` — endpoint naming, HTTP method selection, and response shape rules.

## Before Creating a Contract

1. Read `docs/api-conventions.md` — check if a contract for this endpoint already exists. **Do not create a duplicate. Do not overwrite silently.** If one exists and needs changing, mark the change explicitly with a `CHANGED:` comment and explain why.
2. Read `docs/project-context.md` — confirm the user story this contract serves.
3. Read `docs/architecture.md` — confirm the entity fields and data model before defining request/response shapes.

## Contract Format

Use `references/api-contract-template.md` for the full structure. Every contract must include:

- HTTP method and path (following `references/rest-naming-rules.md`)
- Linked user story number
- Route and query parameters
- Request body with typed fields
- Success response — distinguish list vs single-item shapes
- Pagination shape for list endpoints (see template)
- Authorization header requirement (yes / no / role)
- All validation rules
- All error responses (400, 401, 403, 404, 500 as applicable)
- Frontend behavior expectations (loading, success, error states)

## Rules
- Use consistent camelCase field names across all endpoints.
- Use plural resource names (`/api/requests`, not `/api/request`).
- Never use verbs in resource paths.
- Do not change an existing contract field name without a `CHANGED:` annotation and team notification.
- List endpoints must always define their pagination or explicitly state "no pagination — returns all."
- Every contract must be saved to `docs/api-conventions.md` before implementation begins.
- **If you cannot determine the data model from `docs/architecture.md`, stop and flag the gap. Do not invent field names.**

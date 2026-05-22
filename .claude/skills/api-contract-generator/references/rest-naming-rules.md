# REST Naming Rules

## Resource Names
Use plural nouns for all resource paths:
- `/api/requests`
- `/api/users`
- `/api/approvals`

Never use verbs in resource names:
- Bad: `/api/createRequest`, `/api/getUser`
- Good: `POST /api/requests`, `GET /api/users/{id}`

## HTTP Methods
| Action | Method | Path | Notes |
|--------|--------|------|-------|
| List items | GET | `/api/items` | supports query params for filter/search |
| Get one item | GET | `/api/items/{id}` | 404 if not found |
| Create item | POST | `/api/items` | returns 201 + created object |
| Replace item | PUT | `/api/items/{id}` | full replacement |
| Update field/status | PATCH | `/api/items/{id}` | partial update |
| Update sub-action | PATCH | `/api/items/{id}/status` | when updating a single field cleanly |
| Delete item | DELETE | `/api/items/{id}` | returns 204, only if required |

## Nested Resources
Use nesting only when the child cannot exist without the parent:
- Good: `/api/requests/{id}/comments` — comments belong to a request
- Avoid: `/api/users/{id}/all-requests` — use `/api/requests?userId={id}` instead

Maximum nesting depth: **one level**. `/api/a/{id}/b` is acceptable. `/api/a/{id}/b/{id}/c` is not.

## Field Naming
Use camelCase for all JSON field names consistently across every endpoint:
- Good: `createdAt`, `requestId`, `approvalStatus`
- Bad: `created_at`, `RequestId`, `approval-status`

Date/time fields must always use ISO 8601 format: `"2026-05-17T00:00:00Z"`

ID fields must always be named `id` on the root object, and `{resourceName}Id` when referencing another resource:
- `id` — the object's own identifier
- `userId` — a foreign reference to a user
- `requestId` — a foreign reference to a request

## Query Parameters
Use camelCase for query parameter names:
- `?search=term`
- `?status=pending`
- `?page=1&limit=20`
- `?sortBy=createdAt&sortOrder=desc`

Boolean filters: use explicit strings, not 0/1:
- Good: `?isActive=true`
- Bad: `?isActive=1`

## Response Envelope Rules
All endpoints must use the **same response shape** throughout the project:

- Single object: return the object directly (no wrapping key)
- List: return `{ "data": [...], "pagination": {...} }`
- Do not mix — never return a raw array `[...]` for a list endpoint

This rule prevents the most common frontend/backend mismatch in hackathons.

## Hackathon Rule
Prefer fewer, clear endpoints over many clever ones. If you need more than 8–10 endpoints for a hackathon MVP, you are likely over-building. A CRUD set for one resource is 5 endpoints maximum.

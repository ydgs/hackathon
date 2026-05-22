# API Conventions

## Endpoint Naming
Use plural nouns:

```http
GET /api/requests
GET /api/requests/{id}
POST /api/requests
PUT /api/requests/{id}
PATCH /api/requests/{id}/status
DELETE /api/requests/{id}
```

## Response Shape
Prefer predictable response shapes:

```json
{
  "id": "string",
  "title": "string",
  "status": "Submitted",
  "createdAt": "2026-05-17T10:00:00Z"
}
```

## Error Shape
Use consistent errors:

```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"]
  }
}
```

## Frontend Integration Rules
- Frontend must use field names from the API contract.
- Backend must not change response fields without updating the story/task.
- Add loading, success, and failure handling for every API call used in the demo.

# Validation and Error Conventions

This file is the single source of truth for error response shapes. Every backend endpoint must use these formats. The frontend is built to parse these shapes — deviating will break integration.

---

## HTTP Status Code Reference

| Code | When to use |
|------|-------------|
| 200 OK | Successful GET, PUT, PATCH |
| 201 Created | Successful POST that creates a resource |
| 204 No Content | Successful DELETE — return no body |
| 400 Bad Request | Validation failure, malformed input, invalid state transition |
| 401 Unauthorized | No valid authentication token provided |
| 403 Forbidden | Authenticated but insufficient permissions |
| 404 Not Found | Resource does not exist for the given ID |
| 409 Conflict | Duplicate resource or conflicting state (e.g., already approved) |
| 500 Internal Server Error | Unexpected exception — should never be used for business logic errors |

---

## Validation Error (400)
Use when one or more input fields fail validation.

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "amount",
      "message": "Amount must be a positive number"
    }
  ]
}
```

Rules:
- Always include the `errors` array — even if only one field failed.
- `field` must match the exact request body field name.
- `message` must be human-readable — it will be displayed next to the field in the UI.
- Return all validation failures at once — do not return one error at a time and force the user to resubmit.

## Not Found (404)
```json
{
  "message": "Resource not found"
}
```

## Conflict (409)
```json
{
  "message": "A request with this reference number already exists"
}
```

Use a specific, human-readable message — not a generic "Conflict."

## Unauthorized (401)
```json
{
  "message": "Authentication required"
}
```

## Forbidden (403)
```json
{
  "message": "Insufficient permissions to perform this action"
}
```

## Generic Server Error (500)
```json
{
  "message": "An unexpected error occurred"
}
```

Rules:
- Never include stack traces, internal error codes, or file paths in this response.
- Log the full error server-side — return only this generic message to the client.

---

## Partial Validation
If some fields are valid and others are not, still return 400 with the `errors` array. Do not partially save data and return a 200.

---

## Hackathon Rule
Do not overbuild error handling. The priority is: validation errors are clear and field-specific (so the frontend can display them), and demo-breaking errors (crash, 500 on happy path) are caught and logged. Edge case error polish comes last.

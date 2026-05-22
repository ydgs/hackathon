# API Contract Template

Use this template for every endpoint. Fill in every section — do not leave sections blank. If a section does not apply, write "N/A" and explain briefly.

---

## Endpoint
`METHOD /api/resource`

## Purpose
What does this endpoint allow the user or system to do? One sentence.

## Related User Story
US-XXX: [story title]

## Authorization
- Required: Yes / No
- Role required (if any): e.g., `admin`, `user`, `any authenticated`
- Header: `Authorization: Bearer <token>` (if required)

---

## Request Parameters

### Route Parameters
- `id`: string — required — the unique identifier of the resource

### Query Parameters (for GET list endpoints)
- `search`: string — optional — filters by title/name field
- `status`: string — optional — filters by status value
- `page`: integer — optional — defaults to 1
- `limit`: integer — optional — defaults to 20, max 100

---

## Request Body (for POST / PUT / PATCH)
All fields in camelCase. Omit this section for GET and DELETE.

```json
{
  "fieldName": "string",
  "numericField": 0,
  "optionalField": "string | null"
}
```

Field definitions:
- `fieldName`: string — required — max 255 characters
- `numericField`: integer — required — must be > 0
- `optionalField`: string — optional — default null

---

## Success Response

### Single Item (GET by ID / POST / PUT / PATCH)
Status: `200 OK` or `201 Created`

```json
{
  "id": "string",
  "fieldName": "string",
  "createdAt": "2026-05-17T00:00:00Z",
  "updatedAt": "2026-05-17T00:00:00Z"
}
```

### List (GET collection)
Status: `200 OK`

```json
{
  "data": [
    {
      "id": "string",
      "fieldName": "string",
      "createdAt": "2026-05-17T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

If pagination is not implemented, state explicitly:
> "Returns all records. No pagination. Maximum expected record count: N."

### Delete
Status: `204 No Content` — empty body.

---

## Validation Rules
- `fieldName` is required — return 400 if missing or empty string
- `fieldName` maximum length is 255 characters
- `numericField` must be a positive integer
- (add all rules specific to this endpoint)

---

## Error Responses

### 400 Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field name is required"
    }
  ]
}
```

### 401 Unauthorized (if auth required)
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden (if role required)
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "An unexpected error occurred"
}
```

---

## Frontend Behavior
- **Loading state**: show spinner/skeleton while request is in flight
- **Success state**: show success message or navigate to the result
- **Validation error (400)**: display field-level error messages next to each invalid field
- **Auth error (401/403)**: redirect to login or show "access denied" message
- **Not found (404)**: show "not found" message, offer navigation back
- **Server error (500)**: show generic error message with retry option
- **Empty list**: show empty state message (not an error)

---

## Change Log
If this contract was modified after initial creation, record changes here:

| Date | Field / Section | Change | Reason |
|------|----------------|--------|--------|
| YYYY-MM-DD | `fieldName` | Added | Required by US-XXX |

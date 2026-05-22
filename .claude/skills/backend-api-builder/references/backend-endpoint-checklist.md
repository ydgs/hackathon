# Backend Endpoint Checklist

Run through every item before marking a backend task Done. Check each item explicitly — do not assume.

---

## Contract Compliance
- [ ] Route path matches `docs/api-conventions.md` exactly (method, path, params)
- [ ] Request body field names match the contract (camelCase, correct types)
- [ ] Success response shape matches the contract (single object vs list envelope)
- [ ] HTTP status codes match the contract (200 / 201 / 204 as appropriate)
- [ ] List endpoints return `{ "data": [...], "pagination": {...} }` — not a raw array

## Validation
- [ ] All required fields are validated — return 400 if missing or empty
- [ ] Field type and length constraints are enforced
- [ ] Invalid or missing route IDs return 404, not 500
- [ ] Invalid status transitions are rejected with a clear 400 message (if applicable)
- [ ] Validation errors use the format in `references/validation-and-error-conventions.md`

## Data Integrity
- [ ] Data is saved and retrieved correctly — verify with a read-after-write
- [ ] Date fields use ISO 8601 format consistently
- [ ] IDs are generated consistently (UUID, auto-increment — match the architecture decision)
- [ ] Demo seed data exists for the P0 flow — a judge should see realistic data, not empty lists
- [ ] No field returns `null` unexpectedly where the contract specifies a value

## Error Handling
- [ ] 400 returned for validation failures (with field-level errors)
- [ ] 404 returned for missing resources (not 500, not 200 with empty body)
- [ ] 500 used only for truly unexpected errors — no business logic errors mapped to 500
- [ ] Error responses do not expose stack traces, internal paths, or database error messages
- [ ] Error response shape matches `references/validation-and-error-conventions.md`

## Integration Safety
- [ ] CORS headers are configured correctly for the frontend origin — not open (`*`) if auth is in use
- [ ] Response envelope is consistent with other endpoints in the project (no mixed shapes)
- [ ] No hardcoded values (URLs, credentials, IDs) that belong in environment variables
- [ ] New environment variables are added to `.env.example` with a description

## Testing
- [ ] Happy path tested manually or with an automated test
- [ ] At least one validation failure path tested (missing required field)
- [ ] At least one not-found path tested (invalid ID)
- [ ] API test examples provided in the implementation output

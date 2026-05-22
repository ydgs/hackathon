# Mocks

All files in this folder are temporary mock data used while the backend is not yet available.

**Every file must remain clearly labelled** with a `// MOCK: replace with [endpoint]` header comment.

## Replacement plan

When each backend endpoint is ready:
1. Set `USE_MOCKS = false` in the corresponding service file.
2. Remove the import of the mock data from the service file.
3. Run a full build and verify the response shape matches the types in `src/types/`.

## Files

| File | Replaces |
|---|---|
| `chargers.mock.ts` | `GET /api/v1/chargers` |
| `bookings.mock.ts` | `GET /api/v1/bookings` |
| `notifications.mock.ts` | `GET /api/v1/notifications`, `GET /api/v1/notifications/audit` |
| `users.mock.ts` | `GET /api/v1/eligible-users` |
| `reports.mock.ts` | All `/api/v1/reports/*` and `/api/v1/ai/insights` |
| `auditLogs.mock.ts` | `GET /api/v1/audit-logs` |

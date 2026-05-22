# Services

Each service exports typed async functions that match the API contract in `docs/api-contract.md`.

All services currently have `USE_MOCKS = true` and return data from `src/mocks/`.

## Replacement plan

When the backend is ready:
1. Set `USE_MOCKS = false` in each service file.
2. Ensure `apiClient.ts` has the correct `BASE_URL` (default: `http://localhost:5000/api/v1`).
3. Ensure `localStorage.getItem('nexlevel_token')` returns the real JWT from login.
4. Remove mock imports once integration is confirmed.

## Service files

| File | Endpoint group |
|---|---|
| `auth.service.ts` | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| `charger.service.ts` | `GET /chargers`, `GET /chargers/:id`, `PUT /chargers/:id/status` |
| `booking.service.ts` | `GET /bookings`, `POST /bookings`, `GET /bookings/:id`, `PUT /bookings/:id/cancel`, `PUT /bookings/:id/release`, `PUT /bookings/:id/override` |
| `notification.service.ts` | `GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/:id/read`, `GET /notifications/audit` |
| `report.service.ts` | `GET /reports/summary`, `GET /reports/sessions`, `GET /reports/energy`, `GET /reports/utilization`, `GET /reports/sustainability`, `GET /ai/insights` |
| `user.service.ts` | `GET /eligible-users`, `GET /eligible-users/:id`, `POST /eligible-users`, `PUT /eligible-users/:id`, `DELETE /eligible-users/:id` |

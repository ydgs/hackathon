# US-107 - Pre-Booking Connector Availability Check via CSMS - Backend Implementation Notes

## Status
Implemented

## Summary
Added a live CSMS connector availability check inside `BookingService.CreateBookingAsync`. Before a booking record is inserted into the database, the service now calls the CSMS to verify the target connector is not `Faulted` or `Unavailable`. If the connector is in either of those states, the booking is rejected with HTTP 409 and error code `ChargerCurrentlyUnavailable`. CSMS unavailability (any exception or timeout) is handled gracefully — the check is skipped with a `LogWarning` and the booking proceeds normally. MockMode skips the check automatically via the no-op `MockCsmsClient`.

## APIs Added or Changed
No new endpoints added. The change is internal to `BookingService.CreateBookingAsync`.

- Method + route: `POST /api/v1/bookings` (existing)
- New error response:
  - Status: `409 Conflict`
  - Error code: `ChargerCurrentlyUnavailable`
  - Message: `"Charger is not available for booking at this time."`
  - Shape follows the standard `errors[]` envelope defined in `docs/api-conventions.md`

## Data / Persistence Changes
None. No schema changes, no new migrations, no seed data changes.

## Business Rules and Validation
- Check is inserted as Validation step 10 in `CreateBookingAsync`, after the maintenance block overlap check (step 9) and before the booking DB record is created.
- If CSMS returns connectors for the station and the matching connector (by `charger.ConnectorId`) has `Status` of `"Faulted"` or `"Unavailable"` (case-insensitive), the booking is rejected with 409.
- If the CSMS returns an empty connector list (either because no connectors were found, or because the station was not found), the check is skipped and the booking proceeds.
- If any exception is thrown (network timeout, HTTP error, deserialization error), the check is skipped with `LogWarning` and the booking proceeds. CSMS unavailability must never block bookings.
- When `Csms:MockMode = true`, `MockCsmsClient.GetConnectorsAsync` returns an empty list, so the check is effectively a no-op.

## Files Changed
- `backend/hackathon.API/Infrastructure/CsmsClient.cs`
  - Added `GetConnectorsAsync(string stationIdentity)` to `ICsmsClient` interface
  - Implemented `GetConnectorsAsync` in `CsmsClient`: calls `GET /api/stations/{identity}/connectors`; on non-2xx falls back to `GetStationAsync` and extracts its `Connectors` list; on any exception returns empty list
  - Added `GetConnectorsAsync` no-op stub to `MockCsmsClient` (returns empty list)
  - `CsmsConnector` DTO (`ConnectorId: int`, `Status: string`) was already defined — no change needed

- `backend/hackathon.API/Services/BookingService.cs`
  - Added Validation step 10 block between maintenance block check and booking record creation
  - Calls `_csms.GetConnectorsAsync(charger.ExternalStationId)` wrapped in `try/catch`
  - Matches the returned connector by `charger.ConnectorId`
  - Returns `(null, Error(409, "Charger is not available for booking at this time.", "ChargerCurrentlyUnavailable"), 409)` when connector status is Faulted or Unavailable
  - On exception: `_logger.LogWarning(...)` and booking proceeds

## How to Test

**Happy path — connector Available (booking proceeds):**
```
POST /api/v1/bookings
Authorization: Bearer <alice-token>
{
  "chargerId": "<NEX-TOWER-CH-01-id>",
  "startTime": "...",
  "endTime": "...",
  "vehicleMake": "Tesla",
  "vehicleModel": "Model 3"
}
```
Expected: `201 Created`, booking created, `csmsSyncStatus` either `Authorized` or `AuthorizationFailed`.

**Failure path — connector Faulted or Unavailable:**
When the CSMS simulator reports the connector as `Faulted` or `Unavailable` for `NEX-TOWER-CH-01`:
```
POST /api/v1/bookings
Authorization: Bearer <alice-token>
{ ... same as above ... }
```
Expected: `409 Conflict`
```json
{
  "message": "Charger is not available for booking at this time.",
  "errors": [
    {
      "code": "ChargerCurrentlyUnavailable",
      "message": "Charger is not available for booking at this time."
    }
  ],
  "traceId": "..."
}
```

**CSMS unreachable (check skipped, booking proceeds):**
Stop the CSMS simulator and submit a valid booking. Expected: `201 Created` (booking proceeds; warning logged in backend console).

**MockMode=true (check skipped):**
Set `Csms:MockMode=true` in `appsettings.Development.json`. Expected: all bookings proceed without any CSMS connector check.

## Assumptions
- The `CsmsConnector` DTO (`ConnectorId: int`, `Status: string`) was already defined in `CsmsClient.cs` and matches the NexLevel CSMS JSON response shape. No new DTO was needed.
- `GET /api/stations/{identity}/connectors` is the expected CSMS endpoint per the task description. The implementation includes a fallback to `GET /api/stations/{identity}` and extracting the `Connectors` array from the station response, so it works even if the CSMS does not expose the dedicated connectors endpoint.
- Status comparison is case-insensitive (`StringComparison.OrdinalIgnoreCase`) to handle any CSMS casing variation (`faulted`, `FAULTED`, `Faulted`).
- An empty connector list from CSMS (including when MockMode=true) is treated as "no data available — proceed with booking" rather than "connector unavailable". This is correct: we only block when we have affirmative evidence of a bad status.

## Known Limitations / Technical Debt
- The fallback from the dedicated `/connectors` endpoint to the full station response adds an extra HTTP round-trip if the CSMS does not expose `/connectors`. On demo day, confirm which endpoint pattern the NexLevel CSMS uses.
- The check is synchronous within the booking creation flow. At hackathon scale (1 demo machine, < 10 concurrent users) this is fine; at production scale this would be part of a more sophisticated pre-booking validation pipeline.

## Demo Notes
- This feature makes the booking flow react to real-time charger health from the CSMS. During the demo, if the CSMS simulator is running and a charger is set to `Faulted`, a booking attempt against that charger will return a clear 409 error rather than silently succeeding.
- If the CSMS simulator is not running, bookings still work — the check fails gracefully and logs a warning. This is the intended fallback behavior.

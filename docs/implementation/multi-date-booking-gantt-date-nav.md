# Multi-Date Booking Support and Gantt Date Navigation — Frontend Implementation Notes

## Status
Implemented (mock data, pending backend `/bookings` endpoint with date range filtering)

## Summary

Two closely related frontend improvements were delivered in this vertical slice:

1. **Multi-date booking support on BookingNewPage** — users can now select any date from today up to 14 days ahead when booking a charger. Previously, the page hardcoded "today" and past hours were always disabled. Now, past-hour disabling only applies when the user is booking for today; all hours are available for future dates.

2. **Date navigation in OperationsBookingsPage** — operators can now navigate forward/backward by day (within the 14-day booking window) in the Operations Bookings view. Both the table view and the Gantt chart respect the selected date. The Gantt "now" indicator only shows on today's view.

## Screens / Components Added or Changed

- Route/page: `/bookings/new` — `BookingNewPage.tsx`
  - Added `getSelectableDates()` helper generating today + 14 days
  - Added date navigation (prev/next chevrons + scrollable date chip bar)
  - Past-hour cutoff in slot picker is now conditional on `isBookingToday`
  - ISO timestamp for `createBooking` uses `selectedDateIso` instead of hardcoded today
  - Success screen shows selected date label

- Route/page: `/operations/bookings` — `OperationsBookingsPage.tsx`
  - Added `selectedDateIso` state and date navigation controls (prev/next + "Today" reset button)
  - `loadBookings` refactored to `useCallback` with `selectedDateIso` dependency
  - `dateFrom`/`dateTo` passed to `getBookings` based on selected date
  - `BookingGanttChart` receives `selectedDate` prop

- Component: `BookingGanttChart.tsx`
  - Added `selectedDate?: string` prop
  - "Now" line only shown when `isToday` (i.e. `selectedDate` equals today's ISO date or is undefined)
  - Passes `selectedDate` through to `GanttBookingModal`

- Component: `GanttBookingModal.tsx`
  - Added `selectedDate?: string` prop
  - `bookingDateIso` resolved from `selectedDate ?? today` — used for both conflict detection and `createBooking` ISO timestamps

## API Integration

- Endpoint(s) consumed: `GET /api/v1/bookings` (with `dateFrom`, `dateTo`, `limit`)
- Mock data: YES — `USE_MOCKS = true` in `booking.service.ts`
- Mock now correctly filters by `dateFrom`/`dateTo` (was previously unfiltered)
- Future-date mock bookings added in `bookings.mock.ts` for tomorrow (+1 day) and the day after (+2 days) to demonstrate date navigation

## Mock Data Changes

Added to `MOCK_BOOKINGS`:
- `bk-007` — Alice / NEX Tower CH-01 / tomorrow 09:00–10:00 / Confirmed
- `bk-008` — Bob / NEX Tower CH-03 / tomorrow 11:00–12:00 / Confirmed
- `bk-009` — Eva / NEXTERACOM CH-01 / tomorrow 14:00–15:00 / Confirmed
- `bk-010` — Alice / NEX Tower CH-02 / day after tomorrow 10:00–11:00 / Confirmed

All future-date mock entries use `daysFromToday(n)` helper so dates stay relative to runtime.

## Responsive / Accessibility Notes

- Mobile: Date chip scrollbar hides scrollbar chrome (`scrollbar-none`) for clean UX on mobile
- Date chips have `role="option"` and `aria-selected` for assistive technology
- Prev/next navigation buttons have `aria-label="Previous day"` / `"Next day"`
- All touch targets meet 44px minimum (rounded-lg with py-2 padding)

## Files Changed

- `frontend/src/pages/BookingNewPage.tsx` — date picker, slot logic update, success state
- `frontend/src/pages/OperationsBookingsPage.tsx` — date navigation, loadBookings refactor
- `frontend/src/components/booking/BookingGanttChart.tsx` — `selectedDate` prop, conditional now-line
- `frontend/src/components/booking/GanttBookingModal.tsx` — `selectedDate` prop, date-aware booking
- `frontend/src/services/booking.service.ts` — mock now filters by dateFrom/dateTo
- `frontend/src/mocks/bookings.mock.ts` — added future-date mock bookings (bk-007 to bk-010)

## How to Test

1. Navigate to `/bookings/new` (log in as Alice)
2. Verify "Today" is the default selected date with past hours grayed out
3. Click the right chevron or click "Tomorrow" chip — verify ALL hours are now enabled (none grayed)
4. Select start time 09:00 — end time auto-sets to 10:00
5. Select a charger and submit — booking should succeed with tomorrow's date in confirmation
6. Navigate to `/operations/bookings` (log in as Admin)
7. Click the right-chevron date navigation — verify bookings load for tomorrow (bk-007, bk-008, bk-009 visible)
8. Switch to Gantt view — verify bookings render correctly, "now" line absent on future dates
9. Click "Today" reset — verify today's bookings reload and "now" line reappears

## Assumptions

- `BOOKING_WINDOW_DAYS = 14` matches the system config default on the ConfigPage
- The Mauritius timezone offset (UTC+4) is applied consistently via existing helpers
- `daysFromToday()` in bookings.mock.ts uses the local machine clock; in production, dates come from the API

## Known Limitations / Technical Debt

- `// MOCK:` flags remain in all service files — when backend `/bookings` is ready, set `USE_MOCKS = false`
- The slot picker does not yet check real-time conflicts for future dates (only today's bookings are visible to detect charger/user conflicts from the mock)
- `BookingNewPage` fair-use hint "You have 60 minutes available today" is static — does not check actual existing bookings for the selected date

## Demo Notes

- Show BookingNewPage: select "Tomorrow" date chip, pick a slot, submit booking — show the confirmation with correct date
- Show OperationsBookingsPage: navigate to "Tomorrow" and switch to Gantt — 3 colored booking bars appear across different charger rows
- Gantt drag-to-book on a future date creates a booking with the correct future date

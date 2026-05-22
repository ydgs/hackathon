# UI Test Cases — NEXLevel Charge Platform

**Status:** Draft  
**Updated:** 2026-05-23  
**Coverage:** P0 demo spine (login, privacy, booking, chargers, notifications, reports)

---

## TC-001: Login — Happy Path (Standard User)

**Route:** `/login`  
**Story:** US-001

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Click "Alice" demo chip
3. Click "Sign In"

**Expected:** Redirected to `/dashboard`. TopBar shows "Alice Standard" name.

---

## TC-002: Login — Invalid Credentials

**Route:** `/login`  
**Story:** US-001

**Steps:**
1. Navigate to `/login`
2. Enter `wrong@email.com` and any password
3. Click "Sign In"

**Expected:** Error message "Invalid email or password." shown inline. No redirect.

---

## TC-003: Login — Email Validation

**Route:** `/login`  
**Story:** US-001

**Steps:**
1. Navigate to `/login`
2. Clear email field, leave blank
3. Click "Sign In"

**Expected:** Field-level error "Enter a valid email address." shown. No network call.

---

## TC-004: Privacy Gate — New User Redirect

**Route:** `/login` → `/dashboard`  
**Story:** US-005

**Steps:**
1. Navigate to `/login`
2. Click "New User" demo chip (Eve NewUser)
3. Click "Sign In"

**Expected:** Redirected to `/privacy?returnTo=/dashboard`. PrivacyPage loads with content.

---

## TC-005: Privacy Acknowledgement — Happy Path

**Route:** `/privacy`  
**Story:** US-005

**Pre-condition:** Logged in as Eve NewUser (TC-004)

**Steps:**
1. On PrivacyPage, scroll through the notice
2. Click "Acknowledge and Continue"
3. Wait for loading state to clear

**Expected:** Navigated to `/dashboard`. No redirect back to `/privacy`. Profile page shows "✓ Acknowledged (v1)".

---

## TC-006: Privacy Acknowledgement — Error State

**Route:** `/privacy`  
**Story:** US-005

**Steps:** (Requires mocking a network error — skip in demo mode)
1. Disable network, click "Acknowledge and Continue"

**Expected:** Error banner shown "Failed to acknowledge privacy notice. Please try again." Button re-enables.

---

## TC-007: Dashboard — KPI Cards Load

**Route:** `/dashboard`  
**Story:** US-014, US-026

**Pre-condition:** Logged in as Alice or Admin

**Steps:**
1. Navigate to `/dashboard`

**Expected:** 4 KPI stat cards visible (Available Chargers, Active Sessions, Energy Today, CO2 Avoided). No errors. Loading skeletons briefly visible then replaced.

---

## TC-008: Chargers Page — Available Charger Cards

**Route:** `/chargers`  
**Story:** US-014

**Steps:**
1. Navigate to `/chargers`
2. Wait for load

**Expected:** Charger cards rendered grouped by location. Each card shows status badge, connector info. At least one "Available" charger shown.

---

## TC-009: Chargers Page — Location Filter

**Route:** `/chargers`  
**Story:** US-014

**Steps:**
1. Navigate to `/chargers`
2. Select "NEX Tower" from location filter

**Expected:** Only NEX Tower chargers shown. NEXTERACOM chargers hidden.

---

## TC-010: Booking — New Booking Happy Path

**Route:** `/bookings/new`  
**Story:** US-007

**Pre-condition:** Logged in as Alice (privacy acknowledged, eligibility active)

**Steps:**
1. Navigate to `/bookings/new`
2. Select a charger from the dropdown
3. Select a time slot (e.g. 10:00–11:00)
4. Vehicle make/model pre-filled from eligibility
5. Click "Book Now"

**Expected:** Success confirmation shown with CSMS badge. Booking state shows "Confirmed".

---

## TC-011: Booking — Gantt View

**Route:** `/operations/bookings`  
**Story:** US-013

**Pre-condition:** Logged in as Admin or Security

**Steps:**
1. Navigate to `/operations/bookings`
2. Click "Gantt" view toggle button

**Expected:** Gantt chart renders with time axis 06:00–22:00, charger rows with existing bookings shown as colored blocks.

---

## TC-012: Booking — Gantt Drag to Create

**Route:** `/operations/bookings`  
**Story:** US-007, US-013

**Pre-condition:** Logged in as Admin. Gantt view active.

**Steps:**
1. On Gantt chart, click and drag on an available row
2. Drag from ~10:00 to ~11:00 (1h max)
3. Release mouse

**Expected:** Booking modal opens with pre-filled charger, start/end time. Form submittable.

---

## TC-013: My Bookings — List

**Route:** `/my-bookings`  
**Story:** US-008

**Pre-condition:** Logged in as Alice (has existing bookings in mock data)

**Steps:**
1. Navigate to `/my-bookings`

**Expected:** Booking cards rendered grouped by date. State badges visible.

---

## TC-014: My Bookings — Cancel Booking

**Route:** `/my-bookings`  
**Story:** US-009

**Pre-condition:** Alice has a "Confirmed" booking

**Steps:**
1. Navigate to `/my-bookings`
2. Find a Confirmed booking card
3. Click "Cancel"
4. Confirm in modal

**Expected:** Booking card updates to "Cancelled" state. Toast "Booking cancelled." shown.

---

## TC-015: Notifications — Unread Count Badge

**Route:** Any (TopBar)  
**Story:** US-021

**Steps:**
1. Log in as Alice
2. Check TopBar bell icon

**Expected:** Bell icon shows red badge with unread count if unread notifications exist.

---

## TC-016: Notifications Page — Mark Read

**Route:** `/notifications`  
**Story:** US-021

**Steps:**
1. Navigate to `/notifications`
2. Click "Mark Read" on an unread notification

**Expected:** Notification marked as read. Unread badge in TopBar decrements.

---

## TC-017: Reports — Overview Tab

**Route:** `/reports`  
**Story:** US-026

**Pre-condition:** Logged in as Admin or Management

**Steps:**
1. Navigate to `/reports`
2. Default tab "Overview" should be active

**Expected:** Summary stats (total sessions, total kWh, CO2 savings, avg duration) rendered. "Based on simulated demo data" label visible.

---

## TC-018: Reports — AI Insights Tab

**Route:** `/reports`  
**Story:** US-029

**Pre-condition:** Logged in as Admin

**Steps:**
1. Navigate to `/reports`
2. Click "AI Insights" tab
3. Wait for load (600ms mock delay)

**Expected:** AI insights panel renders demand forecast, pattern detection, anomalies, and NL summary. "Based on simulated demo data" label visible on insights derived from simulator data.

---

## TC-019: RBAC — Standard User Cannot Access Operations

**Route:** `/operations/bookings`  
**Story:** US-006

**Pre-condition:** Logged in as Alice (StandardUser)

**Steps:**
1. Navigate to `/operations/bookings`

**Expected:** Redirected to `/dashboard`. Operations page not visible.

---

## TC-020: RBAC — Standard User Cannot Access Admin

**Route:** `/admin/users`  
**Story:** US-006

**Pre-condition:** Logged in as Alice (StandardUser)

**Steps:**
1. Navigate to `/admin/users`

**Expected:** Redirected to `/dashboard`. Admin Users page not visible.

---

## TC-021: Operations — Operator Release Booking

**Route:** `/operations/bookings`  
**Story:** US-011

**Pre-condition:** Logged in as Admin. An "Active" booking exists.

**Steps:**
1. Navigate to `/operations/bookings`
2. Find a booking with state "Active"
3. Click "Release"
4. Enter a reason
5. Click "Confirm Release"

**Expected:** Booking state changes to "Released". Toast "Booking released. Charger is now available." shown.

---

## TC-022: Admin Users — Create Eligible User

**Route:** `/admin/users/new`  
**Story:** US-003

**Pre-condition:** Logged in as Admin

**Steps:**
1. Navigate to `/admin/users/new`
2. Fill all required fields
3. Click "Create User"

**Expected:** Redirected to `/admin/users`. New user appears in list. Toast "Eligible EV user created." shown.

---

## TC-023: Profile — Update Vehicle

**Route:** `/profile`  
**Story:** US-004

**Pre-condition:** Logged in as Alice

**Steps:**
1. Navigate to `/profile`
2. Change vehicle make to "BMW"
3. Change vehicle model to "i3"
4. Click "Save Vehicle"

**Expected:** Toast "Vehicle updated." shown. Values persist after page reload.

---

## TC-024: Mobile — Responsive Layout

**Breakpoint:** 375px (iPhone SE)  
**Story:** US-014

**Steps:**
1. Open browser dev tools, set viewport to 375x812
2. Navigate to `/chargers`

**Expected:** No horizontal scroll. Cards stack vertically. Bottom navigation bar visible. Touch targets are at least 44px.

---

## TC-025: Logout

**Route:** TopBar  
**Story:** US-001

**Steps:**
1. Click profile avatar in TopBar
2. Click "Sign out"

**Expected:** Redirected to `/login`. Session cleared.

---

---

## TC-026: Booking — Future Date Selection

**Route:** `/bookings/new`
**Story:** Multi-date booking support

**Pre-condition:** Logged in as Alice

**Steps:**
1. Navigate to `/bookings/new`
2. Verify "Today" chip is selected by default and past hours are grayed
3. Click the right chevron (or "Tomorrow" chip)
4. Verify ALL hours 06:00–19:00 are now enabled (none grayed)
5. Select start time 09:00 — end time auto-sets to 10:00
6. Select a charger, fill vehicle fields, click "Confirm Booking"

**Expected:** Success screen shows tomorrow's date + time window. Booking state "Confirmed".

---

## TC-027: Operations — Date Navigation

**Route:** `/operations/bookings`
**Story:** Gantt date navigation

**Pre-condition:** Logged in as Admin

**Steps:**
1. Navigate to `/operations/bookings`
2. Verify header shows "Today" date label
3. Click the right chevron to advance to "Tomorrow"
4. Verify bookings table/list updates (3 mock bookings for tomorrow appear)
5. Click "Today" reset button
6. Verify today's bookings reload

**Expected:** Date label updates correctly. Bookings reload for selected date. "Today" button resets navigation.

---

## TC-028: Operations — Gantt Future Date

**Route:** `/operations/bookings`
**Story:** Gantt date navigation + drag-to-book

**Pre-condition:** Logged in as Admin. Currently viewing "Tomorrow" (TC-027).

**Steps:**
1. Switch to "Gantt" view mode toggle
2. Verify Gantt renders bookings for tomorrow (3 colored bars on different charger rows)
3. Verify NO "now" time indicator line is visible (it only shows for today)
4. Drag on an empty slot on a charger row
5. Booking modal opens — verify it shows the selected charger + time slot
6. Submit the booking
7. Booking created with tomorrow's date confirmed on success screen

**Expected:** Gantt shows correct date's bookings. No "now" line on future dates. Drag-to-book creates booking for the correct (future) date.

---

## Notes

- All test cases use mock data (USE_MOCKS = true in all services)
- Tests marked "skip in demo mode" require network manipulation not suitable for live demo
- Backend integration tests will be needed once real API endpoints are available
- TC-026 through TC-028 require the `daysFromToday()` helper in `bookings.mock.ts` to compute relative dates at runtime

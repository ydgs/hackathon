# E2E Main Demo Flow — NEXLevel Charge Platform

**Status:** Draft  
**Updated:** 2026-05-23  
**Purpose:** Step-by-step walkthrough of the P0 demo spine for judges and demo rehearsal

---

## Prerequisites

- Frontend running at `http://localhost:5173`
- Backend running at `http://localhost:5000` (or mock mode — USE_MOCKS=true if backend not ready)
- All services in mock mode: `USE_MOCKS = true` in each `*.service.ts`

---

## Flow 1: New User — Privacy Gate + First Booking

**Persona:** Eve NewUser (new employee, never acknowledged privacy)

1. Navigate to `http://localhost:5173`
   - Expected: Redirected to `/login`
2. Click "New User" chip → "Sign In"
   - Expected: Redirected to `/privacy?returnTo=/dashboard` (privacy gate fires)
3. Read privacy notice, click "Acknowledge and Continue"
   - Expected: Navigated to `/dashboard`. No privacy redirect loop.
4. Dashboard loads with KPI cards (Available Chargers, Active Sessions, Energy Today, CO2 Avoided)
5. Click "Book a Charger" or navigate to `/bookings/new`
6. Select a charger, select 10:00–11:00 slot
   - Vehicle pre-filled (Nissan Leaf)
7. Click "Book Now"
   - Expected: Booking confirmed. CSMS badge shows "Authorized".

---

## Flow 2: Existing User — Standard Booking Lifecycle

**Persona:** Alice Standard (active eligible user, privacy pre-acknowledged)

1. Click "Alice" chip at `/login` → "Sign In"
2. Dashboard loads
3. Navigate to `/chargers` — see live charger status
4. Navigate to `/bookings/new` — create a booking for this afternoon
5. Navigate to `/my-bookings` — booking appears as "Confirmed"
6. On the booking card, click "Cancel" → confirm → booking moves to "Cancelled"
7. Navigate to `/notifications` — booking cancellation notification visible

---

## Flow 3: Operator — Operations View + Gantt

**Persona:** Admin (Carol Admin)

1. Click "Admin" chip at `/login` → "Sign In"
2. Navigate to `/operations/bookings`
3. View today's bookings in Table view
4. Switch to Gantt view — see timeline with all chargers
5. Drag on an empty Gantt slot → booking modal opens
6. Fill booking details, submit
7. In table view, find an "Active" booking → click "Release" → enter reason → confirm
   - Expected: Booking released. Toast confirms. Charger shows available.

---

## Flow 4: Admin — User Management

**Persona:** Admin (Carol Admin)

1. Navigate to `/admin/users`
2. View eligible EV user registry (search, filter by status)
3. Click "Add User" → fill form → create
4. Find new user in list
5. Click edit → update eligibility status to "Suspended" → save
6. Navigate to `/admin/audit` — audit log entries visible

---

## Flow 5: Reports — Sustainability Dashboard

**Persona:** Admin or Management

1. Navigate to `/reports`
2. Overview tab: view Total Sessions, Total kWh, CO2 Avoided, Avg Duration
   - "Based on simulated demo data" label confirms data provenance
3. Click "Energy" tab — energy breakdown chart
4. Click "Sustainability" tab — CO2 savings trend
5. Click "AI Insights" tab — demand forecast and pattern detection loads

---

## Key Demo Talking Points

- **Fair use enforcement:** 1h per user per day (visible on booking form)
- **Real-time CSMS sync:** CSMS badge shows authorization status on every booking
- **Privacy gate:** New users must acknowledge before booking (GDPR compliance demo)
- **RBAC:** Standard users cannot access operations or admin sections
- **Simulated data transparency:** "Based on simulated demo data" label on all AI/report metrics
- **Gantt chart:** Visual charger utilization for operators to manage peak-hour capacity
- **Responsible AI:** AI insights are grounded in actual session data with confidence disclosures

---

## Fallback Plan

If backend is unavailable, all flows work identically with mock data:
- All `USE_MOCKS = true` in service files
- Mock data provides realistic demo-quality data
- No visible difference in the UI between mock and live mode

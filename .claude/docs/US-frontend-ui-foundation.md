# Frontend UI Foundation - Implementation Notes

## Status
Implemented

## Summary
Full frontend UI foundation for NEXLevel Charge. All 24 screens are implemented with mock data, responsive layouts, loading/empty/error states, route guards, and a shared AuthContext + ToastProvider. The build passes cleanly (tsc + vite build, 0 errors).

## Screens / Components Added or Changed

### Routes wired in App.tsx
| Path | Component | Guard |
|---|---|---|
| `/` | Navigate to /dashboard | — |
| `/login` | LoginPage | AuthLayout |
| `/privacy` | PrivacyPage | AuthLayout |
| `/dashboard` | DashboardPage | RequireAuth + RequirePrivacyAck |
| `/bookings/new` | BookingNewPage | RequireAuth + RequirePrivacyAck + RequireEligibility |
| `/bookings/:id` | BookingDetailPage | RequireAuth + RequirePrivacyAck |
| `/my-bookings` | MyBookingsPage | RequireAuth + RequirePrivacyAck + RequireEligibility |
| `/notifications` | NotificationsPage | RequireAuth + RequirePrivacyAck |
| `/profile` | ProfilePage | RequireAuth + RequirePrivacyAck |
| `/reports` | ReportsPage | RequireAuth + RequirePrivacyAck + RequireRole(Admin/Management/ReportingESGViewer/Workplace) |
| `/operations/bookings` | OperationsBookingsPage | RequireAuth + RequirePrivacyAck + RequireRole(Admin/Security/Workplace) |
| `/admin/users` | UsersPage | RequireAuth + RequireRole(Admin/Workplace) |
| `/admin/users/new` | UserFormPage | RequireAuth + RequireRole(Admin) |
| `/admin/users/:id/edit` | UserFormPage | RequireAuth + RequireRole(Admin) |
| `/admin/maintenance` | MaintenancePage | RequireAuth + RequireRole(Admin/Workplace) |
| `/admin/audit` | AuditPage | RequireAuth + RequireRole(Admin) |
| `/admin/notifications` | NotificationsAuditPage | RequireAuth + RequireRole(Admin) |
| `/admin/config` | ConfigPage | RequireAuth + RequireRole(Admin) |
| `*` | NotFoundPage | RequireAuth |

### Components created
- `components/ui/`: Button, StatusBadge, KpiTile, EmptyState, ErrorBanner, LoadingSkeleton (6 variants), Modal, ToastProvider, SimulatedDataLabel, ConfidenceBadge, FormField, SelectDropdown, CsmsSyncBadge
- `components/charger/ChargerCard` — status-aware card with actions
- `components/booking/BookingCard` — status + CSMS sync badge + actions
- `components/notification/NotificationItem` — severity-colored with unread indicator
- `components/layout/NavBar` — sticky, role-conditional nav, unread bell badge, mobile hamburger
- `components/layout/AppShell` — NavBar + `<Outlet>` with max-w-screen-xl
- `components/layout/AuthLayout` — centered card with brand header
- `components/guards/RouteGuard` — RequireAuth, RequireRole, RequirePrivacyAck, RequireEligibility

### Key forms
- LoginPage: email + password + demo quick-select chips
- BookingNewPage: charger select, date/time, duration, vehicle; inline success state
- UserFormPage: create/edit with all API fields; password create-only
- MaintenancePage: create modal with charger/time/reason/forceRelease
- ConfigPage: booking rules with field-level validation
- ProfilePage: vehicle make/model edit

## API Integration
All services use `USE_MOCKS = true`. Each service has a mock path and a real API path ready.

| Service | Endpoint pattern | Mock |
|---|---|---|
| auth.service.ts | POST /auth/login, GET /auth/me | DEMO_ACCOUNTS |
| charger.service.ts | GET /chargers, GET /chargers/:id, PUT /chargers/:id/status | MOCK_CHARGERS |
| booking.service.ts | GET/POST/PUT /bookings | MOCK_BOOKINGS |
| notification.service.ts | GET /notifications, PUT /notifications/:id/read | MOCK_NOTIFICATIONS |
| report.service.ts | GET /reports/*, GET /ai/insights | MOCK_REPORT_* |
| user.service.ts | GET/POST/PUT/DELETE /eligible-users | MOCK_ELIGIBLE_USERS |

Loading/empty/error/success states handled on every page.

## Auth Context
`useAuth.ts` exports `AuthContext`, `useAuthProvider()` (used once in `App.tsx`), and `useAuth()` (used in components). Auth state is shared across all components via a single React context.

Demo accounts: Alice (StandardUser), Bob (StandardUser), Admin (Admin/Carol), Security (Dan).

## Mock Data Summary
- 4 chargers: Available, Charging (4.21 kWh, 14 min), Reserved, Faulted
- 6 bookings: Confirmed, Active, Completed, Cancelled, AuthorizationPending, Released
- 7 notifications: 4 unread (BookingConfirmation, GracePeriodWarning, SessionEndingSoon, AdminIntervention)
- 6 eligible users: Alice (Active), Bob (Active), Carol (Suspended), Dan (Active), Eva (Active), Frank (Inactive)
- Reports: 57 sessions, 412.6 kWh, 350.71 kg CO₂
- 7 audit log entries

## Responsive / Accessibility Notes
- Mobile: all pages use `md:hidden` card layouts alongside `hidden md:block` tables
- NavBar: hamburger menu for mobile, full horizontal nav for desktop
- Modals: bottom-sheet on mobile, centered on desktop
- All buttons have `aria-label`, modals have `role="dialog" aria-modal aria-labelledby`
- Form fields use `htmlFor`/`id` pairing; errors have `ExclamationCircleIcon` prefix

## Tailwind Config Additions
- Border radius tokens: `rounded-card` (12px), `rounded-btn` (8px), `rounded-input` (6px), `rounded-badge` (999px), `rounded-toast` (10px), `rounded-modal` (16px)
- Custom keyframes: `shimmer` (skeleton loading), `badgePulse` (Charging/AuthorizationPending status)
- Brand palette, status colors, severity colors

## Files Changed
Key new files under `frontend/src/`:
- `App.tsx` — full router with providers
- `main.tsx` — StrictMode + createRoot
- `App.css` — cleared
- `tailwind.config.js` — updated with design tokens
- `types/` — 7 files
- `lib/` — 2 files
- `hooks/` — 2 files
- `services/` — 8 files (apiClient + 6 services + README)
- `mocks/` — 7 files (6 mocks + README)
- `components/` — 21 files
- `pages/` — 17 files (10 main + 6 admin + NotFoundPage)

## How to Test
1. `cd frontend && npm run dev` — app starts at localhost:5173
2. Go to `/` — redirects to `/dashboard` — redirects to `/login`
3. Click "Admin" chip, click Login — lands on Dashboard showing 4 charger cards
4. Click "Book" on the Available charger — lands on /bookings/new, submit a booking
5. Click "My Bookings" — shows grouped bookings with cancel/release buttons
6. Click bell icon — shows 4 unread notifications
7. Click Reports → overview tab shows KPI tiles (57 sessions, 412.6 kWh)
8. Click Admin menu → Users → Maintenance → Audit → Config

## Known Limitations / Technical Debt
- All services use `USE_MOCKS = true` — flip to `false` and set `VITE_API_BASE_URL` to connect backend
- Auth token (`nexlevel_token`) is not actually validated — any localStorage value works
- Dashboard charger polling (5s) is client-side only; no WebSocket
- Reports are static mock data; date-range filters accepted but do not filter mock data

## Demo Notes
- Log in as Admin to see all screens including Admin menu
- Log in as Alice to show the standard user booking flow
- Dashboard charger cards auto-refresh every 5 seconds (silent, no flash)
- Reports tab shows CSS-only bar charts — no external charting library
- AI Insights tab shows confidence badge, anomalies, recommendations, grounding accordion

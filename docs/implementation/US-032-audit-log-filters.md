# US-032 — Audit Log View with Filters and Drill-through — Frontend Implementation Notes

## Azure DevOps
- Task: **ADO #307** — `[FE] US-032: Build audit log view with filters (date, actor, action type, entity type)`
- Parent User Story: **ADO #214** — US-032: Immutable audit log of critical actions
- Branch: `feature/ado-307-audit-log-filters`

## Status
Implemented (mock data, pending backend `GET /audit-logs` endpoint).

## Summary
Replaced the previous single-text-filter audit view with a full filter bar and a row drill-through that shows the before/after diff and the reason for each audit entry. The view remains Admin-only (route guard already enforced in `App.tsx`), preserving the immutability requirement (no edit/delete controls).

## Filters Implemented
Matches `GET /audit-logs` query params from `.claude/docs/api-contract.md §9.10.1`:

| Filter | Control | Maps to API param |
|---|---|---|
| Date from | `<input type="date">` | `dateFrom` (converted to `T00:00:00Z`) |
| Date to | `<input type="date">` | `dateTo` (converted to `T23:59:59Z`) |
| Actor | Text input (matches `actorUserId` OR `actorRole`) | `actorUserId` |
| Action type | `<select>` (11 known action types) | `action` (comma-separated allowed) |
| Entity type | `<select>` (5 known entity types) | `entityType` (comma-separated allowed) |
| Source | `<select>` (User / Admin / System / Csms) | `source` |

A `Clear filters (N)` link appears once any filter is active. On mobile (`<md`) the filter bar collapses behind a `Filters` toggle button, with the active-filter count shown on the toggle.

## Drill-through Modal
Clicking any row (or pressing `Enter`/`Space` on it — desktop) opens a modal showing:
- Timestamp, source, actor (with role), entity type + ID
- Reason (if present)
- Side-by-side **Before / After** state diff
  - Each pane shows pretty-printed JSON (`JSON.stringify(JSON.parse(state), null, 2)`)
  - Before pane is tinted red, after pane is tinted emerald
  - When a side is `null` (e.g. Create has no before, Delete has no after), it renders `— none —`
- Footer note: "Audit entries are immutable. Edits and deletions are not permitted."

## Screens / Files Changed

- `frontend/src/pages/admin/AuditPage.tsx` — rewritten
  - Filter bar with 6 controls (4 of which directly satisfy the task title plus 2 extras the contract supports)
  - Rows are buttons / keyboard-focusable table rows
  - Drill-through `Modal` (extended to `md:max-w-2xl` via `className` prop)
  - Loading skeleton, empty state, retryable error banner
- `frontend/src/services/audit.service.ts` — **new**
  - `getAuditLogs(params)` mirrors the contract query params and pagination shape
  - Mock-mode filtering + descending-timestamp sort
  - Real `fetch` branch wired through `apiClient` so flipping `USE_MOCKS=false` lights up real backend integration
- `frontend/src/mocks/auditLogs.mock.ts` — added 4 more entries (audit-008 → audit-011) covering `BookingOnBehalfCreated`, `CapOverrideApplied`, `MaintenanceBlockRemoved`, `SystemConfigUpdated` so each filter selection narrows visibly during the demo

## API Integration
- Endpoint: `GET /audit-logs` — `.claude/docs/api-contract.md §9.10.1`
- Response shape: `PaginatedResponse<AuditLogEntry>` (matches existing type)
- Mock: `USE_MOCKS = true` in `audit.service.ts`. Flip to `false` to hit the real backend once it lands.

## Accessibility / Responsive
- Filters are grouped under a labelled mobile toggle (`aria-expanded`, `aria-controls`).
- Each input has a `<label>` and `aria-label` fallback.
- Table rows are keyboard-activatable (`tabIndex=0`, Enter/Space).
- Mobile uses a card list with the same click-to-open behaviour.
- Modal panel widens to `md:max-w-2xl` so the JSON diff doesn't wrap mid-key on desktop.

## Acceptance Criteria — Verification
- [x] Operator can browse and filter the audit log (6 filter dimensions implemented)
- [x] Diff view shows before / after state (side-by-side, with reason)
- [x] Standard User cannot reach this page (existing `RequireRole roles={['Admin']}` guard in `App.tsx:194-201`)
- [x] No edit / delete controls (read-only table, modal only views)

## How to Test
1. Log in as `admin@nexlevel.local`.
2. Open `/admin/audit` — table loads with 11 entries (descending timestamp).
3. Pick action type `BookingCancelled` → only 1 row remains.
4. Clear filters, pick entity type `MaintenanceBlock` → 2 rows.
5. Type `Admin` in Actor → narrows to Admin-actor rows.
6. Set date from to 2026-05-23 → only entries from May 23 onwards.
7. Click any row → drill-through modal shows formatted before/after JSON and reason.
8. Press `Escape` or click overlay → modal closes.
9. Switch viewport to mobile (<768px) → filter bar collapses; tap `Filters` to expand; rows become cards.
10. Log in as `alice.standard@nexlevel.local` and navigate to `/admin/audit` → access denied (existing route guard).

## Assumptions
- Action and entity type option lists are hardcoded in the page from known mock data; in production these could come from `/audit-logs/distinct` or be cached on first load. Keeping them static for the hackathon prevents an extra request on page open.
- `dateFrom` / `dateTo` UI inputs are date-level only (no time picker). They're expanded to full-day ISO ranges (`T00:00:00Z` / `T23:59:59Z`) before being sent.
- Actor filter matches `actorUserId` substring OR `actorRole` substring in mock mode. The real backend treats `actorUserId` strictly — the FE input still maps to it for now; this is good enough for the demo.

## Known Limitations / Technical Debt
- No pagination UI yet — the page requests `limit=100`, which covers all current mock data and is well within the contract's pagination cap. When the real backend exposes >100 entries, a `Load more` button or numeric pager will be needed.
- The diff view is a simple two-column JSON dump. A line-level highlighter (`+`/`-`) would be nicer but isn't on the AC.

## Demo Notes
- Open the page during the Operations/Admin part of the pitch.
- Apply `Action type = CapOverrideApplied` to surface a single high-trust override entry; open it to show the override reason and before/after state.
- Reset filters and apply `Source = Csms` to show the system-emitted `CsmsAuthorizationFailed` row, demonstrating that automated CSMS events are captured alongside human actions.

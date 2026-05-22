# Smoke Test Checklist

Run this checklist before every demo rehearsal and before the final demo. It takes 5–10 minutes. Do not skip it even if "nothing changed" — integration issues appear after merges.

Record the result (Pass / Fail / Not tested) and the tester's name for each run.

**Run date/time:** ___________
**Tester:** ___________
**Build/commit:** ___________

---

## Environment and Startup
- [ ] App starts without errors (`npm run dev` / `python manage.py runserver` / equivalent)
- [ ] No startup errors or unhandled exceptions in the server console
- [ ] Frontend loads in the browser without a blank screen or crash
- [ ] No red errors in the browser console on initial load
- [ ] Environment variables are set correctly (`.env` present and populated)

## Data Integrity
- [ ] Demo/seed data exists — the app does not open to empty lists
- [ ] Seed data looks realistic — no "test", "asdf", "Lorem Ipsum", or placeholder values visible
- [ ] Data persists across page refresh (not lost on reload)

## P0 Core Flow
- [ ] Main P0 create action works — user can complete the form and submit successfully
- [ ] Created item appears in the list immediately after creation (no manual refresh needed)
- [ ] Item detail / view page works for the created item
- [ ] Main update or status-change action works on an existing item
- [ ] No Blocker or High bugs in the P0 flow

## Integration
- [ ] No failed API calls visible in the browser Network tab during the P0 happy path
- [ ] No 500 errors returned from the backend during the P0 happy path
- [ ] API responses contain the expected data (check Network tab — not just the UI)
- [ ] CORS errors are absent (no "blocked by CORS policy" in the console)

## Demo Presentation
- [ ] UI is readable on the demo screen or projector (check at the display resolution/size you will use)
- [ ] Main flow requires minimal clicks — no confusing navigation required
- [ ] No debug overlays, test banners, or development-only UI visible
- [ ] All `// MOCK:` data has been replaced (grep confirmation or developer confirmation)

## Fallback Readiness
- [ ] Screenshots or screen recording of the working P0 flow exists (for fallback)
- [ ] Fallback demo plan (`skills/demo-prep/references/backup-demo-plan.md`) is reviewed and ready
- [ ] Person responsible for the fallback knows their role and has the fallback materials on their device
- [ ] Fallback cue is agreed (what triggers switching from live to fallback)

## Known Issues
Document any known issues that will not be fixed before the demo:

| Issue | Severity | Workaround |
|-------|----------|------------|
| | | |

---

**Overall smoke test result:** PASS / FAIL / PASS WITH KNOWN ISSUES

If FAIL: list blocking items and assign owners before proceeding to demo rehearsal.

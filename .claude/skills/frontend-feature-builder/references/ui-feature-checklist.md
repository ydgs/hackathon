# Frontend Feature Checklist

Run through every item before marking a frontend task Done.

---

## Basic UI
- [ ] Page or component exists and renders without crashing
- [ ] Layout is responsive enough for a demo on a laptop or projector (min 1024px)
- [ ] The main user action is immediately obvious — no hunting required
- [ ] All labels, headings, and button text are clear and final (no placeholder text left)
- [ ] No `[object Object]`, `undefined`, or `null` visible in the UI under any expected condition

## Form Handling
- [ ] Required fields are visually marked
- [ ] Client-side validation messages are visible next to the relevant field
- [ ] Submit button is disabled or shows a loading state while the request is in flight (prevents double-submit)
- [ ] Success message or redirect appears after a successful save
- [ ] Field-level error messages appear for 400 API responses (mapped from `errors[].field`)
- [ ] Generic error message appears for 500 API responses

## API Integration
- [ ] Calls the correct endpoint (method + path match `docs/api-conventions.md`)
- [ ] Request body uses exact field names from the contract (camelCase)
- [ ] Loading state is shown while the request is in flight
- [ ] Empty state is shown when the response returns zero results
- [ ] Validation errors (400) are displayed field-by-field
- [ ] Server errors (500) show a generic error message with a retry option
- [ ] No `// MOCK:` data remains in the production code path

## Demo Quality
- [ ] UI is readable on a projected screen or screen share (font size ≥ 14px, sufficient contrast)
- [ ] Main P0 flow can be completed in under 5 clicks from a fresh page load
- [ ] No console errors during the happy path (open browser dev tools and verify)
- [ ] No console warnings that could distract during a live demo
- [ ] Demo/seed data is realistic — no "test123", "asdf", or Lorem Ipsum visible to judges

## Minimum Accessibility (hackathon baseline)
- [ ] The main P0 action can be triggered with the keyboard (Tab to focus, Enter to submit)
- [ ] Form inputs have labels (not just placeholder text — placeholder disappears on focus)
- [ ] Error messages are visible as text, not only as color (color-blind judges exist)

## Mock Data Cleanup
- [ ] Search for `// MOCK:` in all changed files — confirm none are in production code paths
- [ ] Search for `mockData`, `fakeData`, `MOCK_DATA` — confirm none are in production code paths
- [ ] Any remaining mocks are documented in the implementation output as "Mock data still in use"

# Page State Patterns

Every user-facing page or component that fetches data or performs an action must handle these states. Use these patterns consistently — do not invent custom messages or layouts per feature.

---

## Loading State
Show when a network request is in flight.

**When:** immediately on mount (for data fetches) or on button click (for actions).

**Pattern:**
- Disable the triggering button/action to prevent double-submission.
- Show a spinner or skeleton that matches the expected content shape.
- Do not show an empty state while loading — it causes layout shift.

Example text: `Loading requests...` / `Saving...` / `Submitting...`

---

## Empty State
Show when a data fetch succeeds but returns zero results.

**When:** list is loaded, pagination total is 0, or data array is empty.

**Pattern:**
- Show a message that explains what is empty and what the user can do next.
- Offer a primary action (e.g., a "Create your first X" button) when possible.
- Do not show the same empty state for "no data" and "API error" — they are different.

Example text: `No requests found. Create your first request to get started.`

---

## Error State
Show when a network request fails (4xx or 5xx, or network timeout).

**When:** API call throws or returns an unexpected status code.

**Pattern:**
- Show a clear message that does not expose technical details.
- Offer a retry action when it is safe to retry.
- Distinguish between user errors (400: show field-level messages) and system errors (500: show generic message).

Example text: `Something went wrong while loading requests. Please try again.`

For 400 validation errors: display the `errors` array from the API response next to each field — do not show a generic top-level message alone.

---

## Success State
Show after a user action completes successfully (create, update, delete, submit).

**When:** POST/PUT/PATCH/DELETE returns a success status.

**Pattern:**
- Show a brief confirmation message (toast, inline banner, or redirect with context).
- Do not leave the user on a blank form after a successful submission.
- For creates: either redirect to the new item, or add it to the list and highlight it.

Example text: `Request submitted successfully.` / `Changes saved.`

---

## Validation State
Show when form fields fail client-side or server-side validation.

**When:** form submit attempt with invalid fields, or 400 response from the API.

**Pattern:**
- Show the error message directly below the invalid field.
- Mark the field visually (red border, error icon).
- For server-side validation (400), map `errors[].field` to the corresponding input.
- Clear the error when the user corrects the field.

Example: `Title is required.` / `Amount must be a positive number.`

---

## Partial Load State
Show when some data loads successfully but a secondary fetch fails.

**When:** a page loads its primary data but a secondary widget or panel fails.

**Pattern:**
- Show the primary content that succeeded.
- Show an inline error only for the section that failed — do not blank the whole page.
- Example: main request list loads, but the summary stats panel fails — show the list, show "Stats unavailable" in the panel.

---

## Optimistic Update (use sparingly — only for demo wow moments)
Show the result of an action immediately, before the API confirms.

**When:** the action is very likely to succeed and the UX benefit is significant (e.g., status change).

**Pattern:**
- Update the UI immediately on click.
- If the API call fails, revert the UI and show an error.
- Mark optimistic code with `// OPTIMISTIC: revert on failure` comment.
- Only use for P1/P2 polish — never for P0 critical paths where a failure would be confusing.

---

## Hackathon Rule
A simple, correct message is always better than a complex notification system. Use a single consistent pattern per state type — do not build a custom toast library. If your framework has a built-in notification component, use it.

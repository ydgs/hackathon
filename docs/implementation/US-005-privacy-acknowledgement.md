# US-005 - Privacy Acknowledgement - Frontend Implementation Notes

## Status
Implemented (mock data, pending backend `/privacy-notice/acknowledge` endpoint)

## Summary
Fixed the privacy acknowledgement flow so that clicking "Acknowledge and Continue" on the PrivacyPage correctly updates the user's auth context in localStorage and memory. Previously, the mock delay ran and navigation happened, but `currentUser.privacy.hasAcknowledgedCurrentVersion` remained `false`, causing `RequirePrivacyAck` to immediately redirect back to `/privacy` in a loop.

Also added a "New User" demo account (Eve NewUser) that starts without privacy acknowledged, enabling the privacy gate flow to be demonstrated during the demo.

## Screens / Components Added or Changed

- Route/page: `/privacy` — `PrivacyPage.tsx`
- Forms/actions: `handleAcknowledge()` — now calls `acknowledgePrivacy(version, timestamp)` from auth context
- Client-side validation: None added (existing error state retained)

## API Integration

- Endpoint(s) consumed: `POST /api/v1/privacy-notice/acknowledge`
- Request fields: `{ version: "v1" }`
- Response fields: `{ id, userId, version, acknowledgedAt }`
- Loading/empty/success/error states: loading spinner, error banner on failure, navigation on success
- Mock data still in use: YES — `// MOCK: replace with POST /api/v1/privacy-notice/acknowledge when backend is ready`

## Changes to Types

- `UserPrivacy.acknowledgedVersion` changed from `string` to `string | null`
- `UserPrivacy.acknowledgedAt` changed from `string` to `string | null`
- Required to support users who have never acknowledged any version

## Changes to useAuth

- Added `acknowledgePrivacy(version: string, acknowledgedAt: string): void` to `AuthContextValue` interface
- Added `acknowledgePrivacy` implementation in `useAuthProvider`: updates `currentUser.privacy` in state and localStorage atomically
- Added "New User" (Eve NewUser) demo account with `hasAcknowledgedCurrentVersion: false` to demonstrate the privacy gate

## Responsive / Accessibility Notes

- Mobile behavior: PrivacyPage was already responsive, no changes
- Keyboard/accessibility: no changes

## Files Changed

- `frontend/src/hooks/useAuth.ts` — added `acknowledgePrivacy()`, new demo account, nullable privacy fields
- `frontend/src/pages/PrivacyPage.tsx` — calls `acknowledgePrivacy()` after mock ack
- `frontend/src/types/user.ts` — `UserPrivacy.acknowledgedVersion` and `acknowledgedAt` made nullable

## How to Test

1. Open http://localhost:5173/login
2. Click "New User" quick-select chip (Eve NewUser)
3. Click "Sign In"
4. You should be redirected to `/privacy?returnTo=/dashboard`
5. Scroll through the privacy notice
6. Click "Acknowledge and Continue"
7. Expected result: redirected to `/dashboard` without any loop back to `/privacy`
8. Navigate to `/profile` — privacy section should show "✓ Acknowledged (v1)"

## Assumptions

- `CURRENT_PRIVACY_VERSION = 'v1'` is hardcoded on the client to match the mock content. When the backend `/privacy-notice` GET endpoint is implemented, the version should be fetched from there and passed to acknowledge.
- The "New User" demo account Eve NewUser is intentionally kept in `DEMO_ACCOUNTS` for demo purposes.

## Known Limitations / Technical Debt

- `POST /privacy-notice/acknowledge` is mocked — when backend is ready, uncomment the real `apiClient.post()` call and remove the `setTimeout`.
- The privacy version `'v1'` is hardcoded in `PrivacyPage.tsx`. Should be fetched from `GET /privacy-notice` when backend is ready.
- `UserPrivacy.acknowledgedVersion` and `acknowledgedAt` are nullable on the frontend but `GET /auth/me` in the API contract shows them as non-nullable strings. When the backend is ready, confirm whether `null` is returned for never-acknowledged users or if the `privacy` object itself is `null`. Align types accordingly.

## Demo Notes

- Use "New User" (Eve NewUser) account to demonstrate the privacy gate
- Show the privacy notice scrolls on mobile
- After acknowledging, show the dashboard loads without being redirected back
- If demoing on Admin account, skip privacy page (already pre-acknowledged)

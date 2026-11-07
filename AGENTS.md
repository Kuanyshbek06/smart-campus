
# Smart Campus Room Availability Checker

## Project
A one-page responsive application for checking the availability of one study room using fictional booking data.

## Project structure
- `src/App.tsx`: React UI, inputs, room state, and result display.
- `src/lib/availability.ts`: Pure availability validation and booking rules.
- `src/lib/availability.test.ts`: Vitest regression tests T01-T20.

## Acceptance criteria
- AC1: Reject invalid, reversed, or past time intervals.
- AC2: Reject durations longer than 120 minutes.
- AC3: Reject blocked rooms.
- AC4: Reject overlapping bookings; allow touching endpoints.
- AC5: Show Available or Unavailable without modifying booking data.
- AC6: Preserve clear feedback and responsive desktop/mobile behavior.

## Engineering rules
- Prefer minimal, focused changes.
- Preserve existing function contracts and UI behavior.
- Keep booking rules separate from UI input handling.
- Do not mutate booking fixtures.
- Use no more than two justified design patterns.
- Do not introduce Strategy or Adapter without a genuine need.
- Do not add authentication, backend, database, external APIs, or booking creation.

## Verification
- Run `npm test` for the regression suite.
- Run `npm run build` after code changes.
- Verify relevant UI behavior manually.
- Report changed files, rationale, test results, and remaining limitations.

# Smart Campus Room Availability Checker

## Project
A one-page responsive React application for checking room availability using fictional booking data.

The original Practice #09 application supported one study room. The current Assignment #04 extension supports four fictional rooms with independent capacities, equipment, blocked statuses, and bookings.

The application is a demonstration tool. It does not create or persist bookings.

## Project structure
- `src/App.tsx`: React UI, room selection, filters, blocked-state overrides, time inputs, timeline, and availability feedback.
- `src/lib/availability.ts`: Pure availability validation and booking rules.
- `src/lib/availability.test.ts`: Vitest regression tests T01–T20.
- `src/lib/rooms.ts`: Four-room catalog, Room type, and pure filtering function.
- `src/lib/rooms.test.ts`: Room catalog, filtering, and immutability tests.
- `src/App.test.tsx`: React Testing Library UI behavior tests U1–U5.
- `src/test/setup.ts`: UI test setup.
- `README.md`: Project documentation and setup instructions.
- `package.json`: Dependencies and verification scripts.
- `vite.config.ts`: Vite and Vitest configuration.

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
- Preserve the four-room catalog, room selection, and ALL-match equipment filtering.
- Keep blocked-state overrides independent for each room.
- Clear stale availability results when rooms, filters, or blocked states change.
- Do not mutate booking fixtures or original room data.
- Use no more than two justified design patterns.
- Do not introduce Strategy or Adapter without a genuine need.
- Do not add authentication, backend, database, external APIs, or booking creation.
- Do not introduce real personal data, secrets, or production services.

## Safe agent workflow
- Read `README.md` and `AGENTS.md` before proposing changes.
- Inspect relevant source files and tests before editing.
- Use a dedicated Git branch for changes; preserve the baseline.
- Begin with a read-only review and identify evidence for each finding.
- Propose a minimal patch and wait for human approval before implementation.
- Do not modify unrelated files or install dependencies without approval.
- Do not access credentials, external services, or production systems.
- Do not deploy, merge, or publish changes without explicit human approval.
- Report uncertainty and distinguish confirmed findings from plausible risks.

## Verification
- Run `npm test` for the complete regression suite.
- Run `npm run lint` for ESLint checks.
- Run `npm run typecheck` for TypeScript validation.
- Run `npm run build` after code changes.
- Verify relevant desktop and mobile UI behavior manually.
- Record actual command outputs and report failed or unexecuted checks.
- Report changed files, rationale, test results, and remaining limitations.

## Review and release gates
- Preserve AC1–AC6 and existing functionality.
- Review the diff before approving changes.
- Require passing tests, lint, typecheck, and build before release.
- Document unresolved risks and obtain human approval before merging or deploying.
- Never claim a test passed unless it was actually executed.

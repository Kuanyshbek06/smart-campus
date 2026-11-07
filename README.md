# Smart Campus Room Availability Checker

**Software Engineering — Assignment #04**  
**Student:** Bauyrzhanuly Kuanyshbek  
**Student ID:** 24B031691

## Overview

A responsive, single-page React application for checking whether a fictional study room is available for a requested time interval. It extends the earlier one-room Practice #09 project with a four-room catalog, capacity and equipment filters, room selection, and room-specific availability checks. The application checks availability only: **it does not create or save bookings**.

- **Live application:** https://smart-campus-room-av-te16.bolt.host
- **Bolt project:** https://bolt.new/p/72130385
- **GitHub repository:** https://github.com/Kuanyshbek06/smart-campus

## Features

- Four fictional rooms with independent capacities, equipment, blocked statuses, and booking fixtures.
- Minimum-capacity filtering (`room.capacity >= requested capacity`).
- Multiple equipment requirements: a room must have **all** selected equipment.
- A clear empty state when no rooms match the filters.
- Room selection with room-specific bookings and a visual timeline.
- Per-room Blocked toggle stored in UI state without changing the original room fixtures.
- Availability results cleared when the selected room, filters, or blocked state changes.
- Responsive desktop/mobile interface with explicit Available / Unavailable feedback.

## Sample room catalog

| Room | Capacity | Equipment | Initially blocked |
| --- | ---: | --- | --- |
| Room A — Library Wing | 8 | Whiteboard | No |
| Room B — Engineering Lab | 24 | Projector, Whiteboard | No |
| Room C — Seminar Hall | 40 | Projector, Microphone, Whiteboard | Yes |
| Room D — Huddle Space | 4 | Whiteboard | No |

All room and booking records are fictional.

## Availability rules (AC1–AC6)

1. Reject invalid, zero-length, reversed, or past time intervals; the requested start must be later than the fixed current time.
2. Reject durations longer than 120 minutes (exactly 120 minutes is allowed).
3. Reject requests for blocked rooms.
4. Reject genuine booking overlaps, but allow intervals that only touch at an endpoint.
5. Return Available / Unavailable without mutating booking fixtures.
6. Preserve clear feedback and responsive desktop/mobile behavior.

Times are represented as **whole minutes after midnight** (for example, `660` = 11:00). The demo uses a fixed current time of **09:00 (`540`)** for deterministic checks.

## Tech stack

React 18, TypeScript, Vite 5, Tailwind CSS, Vitest, React Testing Library, and jsdom.

## Getting started

**Prerequisite:** Node.js and npm (use a Node.js version compatible with the installed Vite and testing dependencies).

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Verification commands

```bash
npm test
npm run build
npm run typecheck
npm run lint
```

`npm test` executes the Vitest suite once. The last recorded terminal verification for Assignment #04 showed **44 passing tests in 3 files**, a successful production build, and a successful TypeScript typecheck. Lint results are not claimed here because they have not been supplied as evidence.

### Automated test organization

| File | Tests | Purpose |
| --- | ---: | --- |
| `src/lib/availability.test.ts` | 20 | Original booking validation and regression tests (T01–T20) |
| `src/lib/rooms.test.ts` | 19 | Room catalog, filtering, empty results, and immutability |
| `src/App.test.tsx` | 5 | UI checks: room switching, stale-result clearing, blocked overrides, equipment filtering, and room-specific availability |

## Project structure

```text
src/
  App.tsx                   # React UI, filters, room selection and local state
  App.test.tsx              # UI behavior tests
  lib/
    availability.ts         # Pure booking availability rules
    availability.test.ts    # Original T01–T20 regression suite
    rooms.ts                # Fictional room data and pure filterRooms function
    rooms.test.ts           # Room/filtering tests
  test/
    setup.ts                # React Testing Library matcher setup
AGENTS.md                  # Project constraints and verification instructions
vite.config.ts             # Vite and Vitest configuration
package.json               # Dependencies and npm scripts
```

`checkAvailability` retains its existing input/output contract. `filterRooms` is a separate pure function. The UI holds transient room selection and blocked overrides.

## Manual UI verification

1. Check availability for Room A at `660–720`: the request touches an existing booking endpoint and should be Available.
2. Check Room A at `630–690`: it overlaps the existing booking and should be Unavailable.
3. Set minimum capacity to `24`: only Rooms B and C should match.
4. Select Projector and Microphone together: only Room C should match.
5. Set minimum capacity to `50`: the app should show its no-matching-rooms message.
6. Switch rooms after checking availability: the old result should disappear.
7. Toggle Room B to Blocked, switch to Room A, then return to Room B: the blocked state should persist for B without affecting A.
8. Check the layout at desktop width and a mobile viewport of `375 × 812` pixels.

## Architecture and change history

- **Before (Practice #09):** one-room fixtures and UI state were held in `src/App.tsx`; the pure availability rules were in `src/lib/availability.ts`.
- **After (Assignment #04):** the catalog and pure filtering are in `src/lib/rooms.ts`; availability rules remain in `src/lib/availability.ts`; `src/App.tsx` manages UI and room-specific local state.
- Bolt Version History contains the pre-extension **“Remove duplicate NaN validation”** checkpoint and subsequent checkpoints for the room module, UI extension, and UI tests. The GitHub history may not contain those older Bolt checkpoints.

## Scope and limitations

This is an educational demonstration, not a production booking service. Room fixtures and the current time are hardcoded; no authentication, backend, database, external data service, or booking creation is implemented. Blocked overrides are temporary and reset on reload. The timeline shows a fixed time window, while the underlying booking validator supports the full-day bounds. Automated UI tests run in jsdom and do not replace visual checks on real desktop/mobile layouts.

## AI assistance

Bolt.new was used to inspect the existing code, plan and implement focused changes, and generate tests. Its recommendations were reviewed against `AGENTS.md` and the assignment acceptance criteria; unnecessary design patterns and unrelated features were deliberately avoided. The original booking-rule function and its 20 regression tests were preserved.

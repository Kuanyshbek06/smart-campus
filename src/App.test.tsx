import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { ROOMS } from "@/lib/rooms";

function getRoomSelect(): HTMLSelectElement {
  return screen.getByRole("combobox") as HTMLSelectElement;
}

function selectRoom(roomId: string) {
  fireEvent.change(getRoomSelect(), { target: { value: roomId } });
}

function setStart(value: string) {
  const input = screen.getByLabelText(/Start \(minutes after midnight\)/);
  fireEvent.change(input, { target: { value } });
}

function setEnd(value: string) {
  const input = screen.getByLabelText(/End \(minutes after midnight\)/);
  fireEvent.change(input, { target: { value } });
}

function checkAvailability() {
  fireEvent.click(screen.getByRole("button", { name: /Check availability/i }));
}

function getBlockedToggle(): HTMLButtonElement {
  return screen.getByRole("switch");
}

function getBlockedBadge(): string {
  const toggle = getBlockedToggle();
  const badge = toggle.parentElement?.querySelector("span.bg-rose-100, span.bg-emerald-100");
  return badge?.textContent ?? "";
}

async function clickEquipment(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("button", { name: new RegExp(`^${name}$`, "i") }));
}

const ROOM_SNAPSHOT = ROOMS.map((r) => ({
  id: r.id,
  name: r.name,
  capacity: r.capacity,
  equipment: [...r.equipment],
  blocked: r.blocked,
  bookings: r.bookings.map((b) => ({ ...b })),
}));

afterEach(() => {
  cleanup();
  // Verify fixtures never mutated after every test
  expect(ROOMS).toEqual(ROOM_SNAPSHOT);
});

describe("U1 — Room switching clears stale results", () => {
  it("clears the result when switching rooms, then shows a fresh result on re-check", () => {
    render(<App />);

    // Select Room A (lib-a) and check availability for 660–720
    selectRoom("lib-a");
    setStart("660");
    setEnd("720");
    checkAvailability();

    // Room A has booking 600–660; 660–720 touches the end, so available
    expect(screen.getByText("Available")).toBeInTheDocument();

    // Switch to Room B
    selectRoom("lab-b");

    // Previous result should be gone
    expect(screen.queryByText("Available")).not.toBeInTheDocument();
    expect(screen.queryByText("Unavailable")).not.toBeInTheDocument();

    // Check availability again — fresh result appears
    checkAvailability();
    // Room B also has booking 600–660; 660–720 touches end, so available
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
});

describe("U2 — Filter exclusion and empty state", () => {
  it("shows empty state and hides room card, time inputs, and result when no rooms match", () => {
    render(<App />);

    // Check availability for Room A first
    selectRoom("lib-a");
    setStart("660");
    setEnd("720");
    checkAvailability();
    expect(screen.getByText("Available")).toBeInTheDocument();

    // Set min capacity to 50 — no room has capacity >= 50
    const capacityInput = screen.getByPlaceholderText("Any");
    fireEvent.change(capacityInput, { target: { value: "50" } });

    // Empty state appears
    expect(screen.getByText("No rooms match your filters")).toBeInTheDocument();

    // Previous result is gone
    expect(screen.queryByText("Available")).not.toBeInTheDocument();
    expect(screen.queryByText("Unavailable")).not.toBeInTheDocument();

    // Room card (select) is gone
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    // Time inputs are gone
    expect(screen.queryByLabelText(/Start \(minutes after midnight\)/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/End \(minutes after midnight\)/)).not.toBeInTheDocument();

    // Filter controls remain accessible
    expect(screen.getByText(/Filter rooms/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Any")).toBeInTheDocument();
  });
});

describe("U3 — Per-room blocked status", () => {
  it("persists per-room blocked overrides independently without mutating fixtures", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select Room A and toggle blocked
    selectRoom("lib-a");
    fireEvent.click(getBlockedToggle());
    expect(getBlockedBadge()).toBe("Blocked");

    // Switch to Room B — should not be blocked
    selectRoom("lab-b");
    expect(getBlockedBadge()).toBe("Not blocked");

    // Switch back to Room A — blocked persists
    selectRoom("lib-a");
    expect(getBlockedBadge()).toBe("Blocked");

    // ROOMS fixture immutability checked in afterEach
  });
});

describe("U4 — Equipment filtering through UI", () => {
  it("auto-selects Room C when projector and microphone are required", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click Projector and Microphone
    await clickEquipment(user, "projector");
    await clickEquipment(user, "microphone");

    // Only Room C (sem-c) has both projector and microphone
    const select = getRoomSelect();
    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveValue("sem-c");

    // Room C is selected automatically
    expect(select).toHaveValue("sem-c");
  });
});

describe("U5 — Room-specific availability", () => {
  it("returns unavailable for Room B at 730–760 (overlaps 720–780) but available for Room D", () => {
    render(<App />);

    // Select Room B and check 730–760
    selectRoom("lab-b");
    setStart("730");
    setEnd("760");
    checkAvailability();

    // Room B has booking 720–780; 730–760 overlaps it
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText(/Overlaps an existing booking/)).toBeInTheDocument();

    // Switch to Room D
    selectRoom("huddle-d");

    // Result should be cleared
    expect(screen.queryByText("Unavailable")).not.toBeInTheDocument();

    // Set the same interval and check
    setStart("730");
    setEnd("760");
    checkAvailability();

    // Room D has no bookings; 730–760 is within 120 min and after NOW (540)
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
});

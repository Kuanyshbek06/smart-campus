import { describe, expect, it } from "vitest";
import { checkAvailability, type Booking } from "@/lib/availability";

// Practice #12: common contract for code-based and low-code implementations.
// Fictional Room A; fixed demonstration clock at 09:00 (minute 540).
const NOW = 540;
const BOOKING: Booking = { start: 600, end: 660 };

function check(start: number, duration: number, blocked = false, bookings: Booking[] = [BOOKING]) {
  return checkAvailability({
    start,
    end: start + duration,
    now: NOW,
    blocked,
    bookings,
  });
}

describe("Practice #12 — shared eight-case acceptance contract", () => {
  it("T1: valid free interval (11:00, 60 min) is available", () => {
    expect(check(660, 60).status).toBe("available");
  });

  it("T2: overlapping interval (10:30, 60 min) is unavailable", () => {
    const result = check(630, 60);
    expect(result.status).toBe("unavailable");
    expect(result.message).toMatch(/overlap/i);
  });

  it("T3: blocked room is unavailable", () => {
    const result = check(660, 60, true);
    expect(result.status).toBe("unavailable");
    expect(result.message).toMatch(/blocked/i);
  });

  it("T4: zero duration receives validation feedback", () => {
    const result = check(660, 0);
    expect(result.status).toBe("unavailable");
    expect(result.message).toMatch(/end time must be after start time/i);
  });

  it("T5: 121-minute duration receives validation feedback", () => {
    const result = check(660, 121);
    expect(result.status).toBe("unavailable");
    expect(result.message).toMatch(/maximum is 120/i);
  });

  it("T6: past start (08:30, 60 min) receives validation feedback", () => {
    const result = check(510, 60);
    expect(result.status).toBe("unavailable");
    expect(result.message).toMatch(/later than now/i);
  });

  it("T7: adjacent interval (09:30–10:00) is available", () => {
    expect(check(570, 30).status).toBe("available");
  });

  it("T8: checking availability does not change fictional booking data", () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];
    const before = JSON.parse(JSON.stringify(bookings));
    const result = check(660, 60, false, bookings);
    expect(result.status).toBe("available");
    expect(bookings).toEqual(before);
  });
});

import { describe, expect, it } from "vitest";
import { checkAvailability, type Booking } from "@/lib/availability";

describe("checkAvailability", () => {
  it("T01 returns available for a valid request", () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 660,
      end: 720,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("available");
  });

  it("T02 returns unavailable when start equals now", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 540,
      end: 570,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T03 returns unavailable when start is before now", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 539,
      end: 570,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T04 returns unavailable for zero duration", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 660,
      end: 660,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T05 returns unavailable for a reversed interval", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 700,
      end: 660,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T06 returns available for exactly 120 minutes", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 720,
      end: 840,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("available");
  });

  it("T07 returns unavailable for more than 120 minutes", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 720,
      end: 841,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T08 returns unavailable when the room is blocked", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 660,
      end: 720,
      now: 540,
      blocked: true,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T09 returns available when the request touches an existing booking end", () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 660,
      end: 720,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("available");
  });

  it("T10 returns available when the request touches an existing booking start", () => {
    const now = 500;
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 540,
      end: 600,
      now,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("available");
  });

  it("T11 returns unavailable for a partial overlap", () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 630,
      end: 690,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T12 returns unavailable when the request is inside an existing booking", () => {
    const now = 540;
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 610,
      end: 650,
      now,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T13 returns unavailable when the request contains an existing booking", () => {
    const now = 540;
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 590,
      end: 670,
      now,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T14 returns unavailable when exactly one of multiple bookings conflicts", () => {
    const bookings: Booking[] = [
      { start: 600, end: 660 },
      { start: 720, end: 780 },
      { start: 840, end: 900 },
    ];

    const result = checkAvailability({
      start: 750,
      end: 760,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T15 does not change the bookings array or its booking objects", () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];
    const expectedBookings: Booking[] = [{ start: 600, end: 660 }];

    checkAvailability({
      start: 660,
      end: 720,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(bookings).toEqual(expectedBookings);
    expect(bookings[0]).toEqual(expectedBookings[0]);
  });

  it("T16 returns available with empty bookings for an otherwise valid request", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 660,
      end: 720,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("available");
  });

  it("T17 returns available when multiple bookings do not conflict", () => {
    const bookings: Booking[] = [
      { start: 600, end: 630 },
      { start: 720, end: 780 },
      { start: 840, end: 900 },
    ];

    const result = checkAvailability({
      start: 660,
      end: 700,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("available");
  });

  it("T18 returns unavailable for a non-integer time", () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];

    const result = checkAvailability({
      start: 660.5,
      end: 720,
      now: 540,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T19 returns unavailable below the day boundary", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: -1,
      end: 60,
      now: 0,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });

  it("T20 returns unavailable above the day boundary", () => {
    const bookings: Booking[] = [];

    const result = checkAvailability({
      start: 1380,
      end: 1441,
      now: 1200,
      blocked: false,
      bookings,
    });

    expect(result.status).toBe("unavailable");
  });
});

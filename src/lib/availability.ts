export interface Booking {
  start: number;
  end: number;
}

export interface AvailabilityInput {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
}

export type AvailabilityResult =
  | { status: "available"; message: string }
  | { status: "unavailable"; message: string };

const MAX_DURATION = 120;
const DAY_MINUTES = 1440;

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function checkAvailability(input: AvailabilityInput): AvailabilityResult {
  const { start, end, now, blocked, bookings } = input;

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { status: "unavailable", message: "Start and end must be whole numbers." };
  }
  if (start < 0 || end > DAY_MINUTES) {
    return {
      status: "unavailable",
      message: `Times must stay within the day (0 to ${DAY_MINUTES} minutes).`,
    };
  }
  if (start >= end) {
    return { status: "unavailable", message: "End time must be after start time." };
  }
  if (start <= now) {
    return {
      status: "unavailable",
      message: `Start must be later than now (${minutesToLabel(now)}, minute ${now}). A start equal to now is not allowed.`,
    };
  }

  const duration = end - start;
  if (duration > MAX_DURATION) {
    return {
      status: "unavailable",
      message: `Requested duration is ${duration} minutes. Maximum is ${MAX_DURATION} minutes.`,
    };
  }

  if (blocked) {
    return { status: "unavailable", message: "This room is currently blocked for use." };
  }

  const overlapping = bookings.find(
    (b) => start < b.end && end > b.start
  );
  if (overlapping) {
    return {
      status: "unavailable",
      message: `Overlaps an existing booking (${minutesToLabel(overlapping.start)}–${minutesToLabel(overlapping.end)}).`,
    };
  }

  return {
    status: "available",
    message: `Room is available for ${duration} minute${duration === 1 ? "" : "s"} (${minutesToLabel(start)}–${minutesToLabel(end)}).`,
  };
}

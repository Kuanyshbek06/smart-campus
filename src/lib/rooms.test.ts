import { describe, expect, it } from "vitest";
import { ROOMS, filterRooms, type Room } from "@/lib/rooms";

describe("room catalog integrity (F1)", () => {
  it("contains at least four rooms", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it("every room has valid required fields", () => {
    for (const room of ROOMS) {
      expect(typeof room.id).toBe("string");
      expect(room.id.length).toBeGreaterThan(0);
      expect(typeof room.name).toBe("string");
      expect(room.name.length).toBeGreaterThan(0);
      expect(typeof room.capacity).toBe("number");
      expect(room.capacity).toBeGreaterThan(0);
      expect(Array.isArray(room.equipment)).toBe(true);
      expect(typeof room.blocked).toBe("boolean");
      expect(Array.isArray(room.bookings)).toBe(true);
    }
  });

  it("has unique IDs", () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("capacity filtering (F2)", () => {
  it("returns only rooms with capacity >= 24", () => {
    const result = filterRooms(ROOMS, 24, []);
    const ids = result.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(["lab-b", "sem-c"]));
    expect(ids).not.toContain("lib-a");
    expect(ids).not.toContain("huddle-d");
  });

  it("returns all rooms when min capacity is 4", () => {
    const result = filterRooms(ROOMS, 4, []);
    expect(result.length).toBe(4);
  });

  it("returns no rooms when min capacity exceeds all rooms", () => {
    const result = filterRooms(ROOMS, 50, []);
    expect(result).toEqual([]);
  });
});

describe("equipment filtering with ALL-match (F3)", () => {
  it("returns only rooms with a projector", () => {
    const result = filterRooms(ROOMS, 0, ["projector"]);
    const ids = result.map((r) => r.id);
    expect(ids).toEqual(["lab-b", "sem-c"]);
  });

  it("returns only rooms with both projector and microphone", () => {
    const result = filterRooms(ROOMS, 0, ["projector", "microphone"]);
    expect(result.map((r) => r.id)).toEqual(["sem-c"]);
  });

  it("returns all rooms when requiring a whiteboard", () => {
    const result = filterRooms(ROOMS, 0, ["whiteboard"]);
    expect(result.length).toBe(4);
  });

  it("returns no rooms when requiring equipment no room has", () => {
    const result = filterRooms(ROOMS, 0, ["piano"]);
    expect(result).toEqual([]);
  });
});

describe("combined capacity and equipment filtering (F4)", () => {
  it("returns rooms with capacity >= 24 and a projector", () => {
    const result = filterRooms(ROOMS, 24, ["projector"]);
    expect(result.map((r) => r.id)).toEqual(["lab-b", "sem-c"]);
  });

  it("returns only Room C for capacity >= 24 with projector and microphone", () => {
    const result = filterRooms(ROOMS, 24, ["projector", "microphone"]);
    expect(result.map((r) => r.id)).toEqual(["sem-c"]);
  });

  it("returns only Room C for capacity >= 40 with projector and microphone", () => {
    const result = filterRooms(ROOMS, 40, ["projector", "microphone"]);
    expect(result.map((r) => r.id)).toEqual(["sem-c"]);
  });
});

describe("empty results (F5)", () => {
  it("returns [] when capacity filter excludes all rooms", () => {
    expect(filterRooms(ROOMS, 100, [])).toEqual([]);
  });

  it("returns [] when equipment filter excludes all rooms", () => {
    expect(filterRooms(ROOMS, 0, ["nonexistent"])).toEqual([]);
  });

  it("returns [] when combined filters exclude all rooms", () => {
    expect(filterRooms(ROOMS, 30, ["piano"])).toEqual([]);
  });
});

describe("immutability", () => {
  it("does not mutate the input array", () => {
    const original = [...ROOMS];
    filterRooms(ROOMS, 24, ["projector"]);
    expect(ROOMS).toEqual(original);
    expect(ROOMS.length).toBe(original.length);
  });

  it("does not mutate room objects", () => {
    const snapshot: Room[] = ROOMS.map((r) => ({
      ...r,
      equipment: [...r.equipment],
      bookings: [...r.bookings],
    }));
    filterRooms(ROOMS, 24, ["projector", "microphone"]);
    expect(ROOMS).toEqual(snapshot);
  });

  it("does not mutate the requiredEquipment array", () => {
    const required = ["projector", "microphone"];
    const original = [...required];
    filterRooms(ROOMS, 0, required);
    expect(required).toEqual(original);
  });
});

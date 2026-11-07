import type { Booking } from "@/lib/availability";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
}

export const ROOMS: Room[] = [
  {
    id: "lib-a",
    name: "Room A · Library Wing",
    capacity: 8,
    equipment: ["whiteboard"],
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
  },
  {
    id: "lab-b",
    name: "Room B · Engineering Lab",
    capacity: 24,
    equipment: ["projector", "whiteboard"],
    blocked: false,
    bookings: [
      { start: 600, end: 660 },
      { start: 720, end: 780 },
    ],
  },
  {
    id: "sem-c",
    name: "Room C · Seminar Hall",
    capacity: 40,
    equipment: ["projector", "microphone", "whiteboard"],
    blocked: true,
    bookings: [{ start: 540, end: 600 }],
  },
  {
    id: "huddle-d",
    name: "Room D · Huddle Space",
    capacity: 4,
    equipment: ["whiteboard"],
    blocked: false,
    bookings: [],
  },
];

export function filterRooms(
  rooms: Room[],
  minCapacity: number,
  requiredEquipment: string[],
): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= minCapacity &&
      requiredEquipment.every((item) => room.equipment.includes(item)),
  );
}

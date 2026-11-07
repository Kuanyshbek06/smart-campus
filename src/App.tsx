import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Check,
  X,
  Building2,
  Users,
  Filter,
  Search,
} from "lucide-react";
import {
  checkAvailability,
  minutesToLabel,
  type AvailabilityResult,
} from "@/lib/availability";
import { ROOMS, filterRooms } from "@/lib/rooms";

const NOW = 540;
const EQUIPMENT_OPTIONS = [...new Set(ROOMS.flatMap((r) => r.equipment))].sort();

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);
  const [blockedOverrides, setBlockedOverrides] = useState<Record<string, boolean>>({});
  const [minCapacity, setMinCapacity] = useState<string>("");
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [start, setStart] = useState<string>("660");
  const [end, setEnd] = useState<string>("720");
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const filteredRooms = useMemo(
    () => filterRooms(ROOMS, Number(minCapacity) || 0, requiredEquipment),
    [minCapacity, requiredEquipment],
  );

  const selectedRoom =
    filteredRooms.find((r) => r.id === selectedRoomId) ?? filteredRooms[0] ?? null;

  const effectiveBlocked = selectedRoom
    ? (blockedOverrides[selectedRoom.id] ?? selectedRoom.blocked)
    : false;

  useEffect(() => {
    if (filteredRooms.length === 0) return;
    if (!filteredRooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId]);

  const handleCheck = () => {
    if (!selectedRoom) return;
    if (start.trim() === "") {
      setResult({ status: "unavailable", message: "Please enter a start time." });
      return;
    }
    if (end.trim() === "") {
      setResult({ status: "unavailable", message: "Please enter an end time." });
      return;
    }
    const s = Number(start);
    const e = Number(end);
    setResult(
      checkAvailability({
        start: s,
        end: e,
        now: NOW,
        blocked: effectiveBlocked,
        bookings: selectedRoom.bookings,
      }),
    );
  };

  const handleClear = () => {
    setStart("");
    setEnd("");
    setResult(null);
  };

  const toggleEquipment = (item: string) => {
    setRequiredEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
    setResult(null);
  };

  const timeline = useMemo(() => {
    const dayStart = 480;
    const dayEnd = 900;
    const span = dayEnd - dayStart;
    const pct = (m: number) => ((m - dayStart) / span) * 100;
    return { dayStart, dayEnd, span, pct };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check whether a time slot is free. No booking is created.
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Filter rooms
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <Users className="h-3.5 w-3.5" /> Minimum capacity
              </span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={minCapacity}
                onChange={(e) => {
                  setMinCapacity(e.target.value);
                  setResult(null);
                }}
                placeholder="Any"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                Required equipment (all must match)
              </span>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      requiredEquipment.includes(item)
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {filteredRooms.length} room{filteredRooms.length === 1 ? "" : "s"} match
          </p>
        </section>

        {/* Empty state or room + inputs */}
        {filteredRooms.length === 0 ? (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">
              No rooms match your filters
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try lowering the minimum capacity or removing required equipment.
            </p>
          </section>
        ) : selectedRoom ? (
          <>
            {/* Room card */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[200px] flex-1">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Selected room
                  </p>
                  <select
                    value={selectedRoom.id}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setResult(null);
                    }}
                    className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2.5 text-base font-semibold shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {filteredRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} (cap {room.capacity})
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Users className="h-4 w-4" /> {selectedRoom.capacity} people
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRoom.equipment.map((eq) => (
                        <span
                          key={eq}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>
                    Now: <span className="font-semibold">{minutesToLabel(NOW)}</span>{" "}
                    <span className="text-slate-400">(min {NOW})</span>
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>{minutesToLabel(timeline.dayStart)}</span>
                  <span>{minutesToLabel(timeline.dayEnd)}</span>
                </div>
                <div className="relative h-10 w-full overflow-hidden rounded-lg bg-slate-100">
                  {/* now marker */}
                  <div
                    className="absolute top-0 z-20 h-full w-0.5 bg-rose-500"
                    style={{ left: `${timeline.pct(NOW)}%` }}
                    title={`Now ${minutesToLabel(NOW)}`}
                  />
                  <div
                    className="absolute top-1 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white"
                    style={{ left: `${timeline.pct(NOW)}%` }}
                  >
                    Now
                  </div>
                  {/* bookings */}
                  {selectedRoom.bookings.map((b, i) => (
                    <div
                      key={i}
                      className="absolute top-1 z-10 flex h-8 items-center justify-center rounded bg-slate-700 text-[11px] font-medium text-white"
                      style={{
                        left: `${timeline.pct(b.start)}%`,
                        width: `${((b.end - b.start) / timeline.span) * 100}%`,
                      }}
                    >
                      {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Existing bookings are shown in dark. The red line marks the current time.
                </p>
              </div>

              {/* Blocked toggle */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Room blocked status</p>
                  <p className="text-xs text-slate-500">
                    When blocked, every request is rejected (for testing).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={effectiveBlocked}
                  onClick={() => {
                    setBlockedOverrides((prev) => ({
                      ...prev,
                      [selectedRoom.id]: !effectiveBlocked,
                    }));
                    setResult(null);
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    effectiveBlocked ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      effectiveBlocked ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    effectiveBlocked
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {effectiveBlocked ? "Blocked" : "Not blocked"}
                </span>
              </div>
            </section>

            {/* Inputs */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Proposed time slot
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Start (minutes after midnight)
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      setResult(null);
                    }}
                    placeholder="e.g. 660"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    {start && !Number.isNaN(Number(start)) ? minutesToLabel(Number(start)) : "—"}
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    End (minutes after midnight)
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={end}
                    onChange={(e) => {
                      setEnd(e.target.value);
                      setResult(null);
                    }}
                    placeholder="e.g. 720"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    {end && !Number.isNaN(Number(end)) ? minutesToLabel(Number(end)) : "—"}
                  </span>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Check className="h-4 w-4" />
                  Check availability
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </section>

            {/* Result */}
            {result && (
              <section
                className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
                  result.status === "available"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                      result.status === "available"
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {result.status === "available" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-base font-semibold ${
                        result.status === "available"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {result.status === "available" ? "Available" : "Unavailable"}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        result.status === "available"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {result.message}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Quick test presets */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Quick test cases (sample data)
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "660–720 (touches booking end)", s: "660", e: "720" },
                  { label: "630–690 (partial overlap)", s: "630", e: "690" },
                  { label: "720–840 (exactly 120 min)", s: "720", e: "840" },
                  { label: "720–841 (exceeds 120 min)", s: "720", e: "841" },
                  { label: "540–570 (starts at now)", s: "540", e: "570" },
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      setStart(t.s);
                      setEnd(t.e);
                      setResult(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Tip: toggle the selected room to "Blocked" and re-check to see it become unavailable.
              </p>
            </section>
          </>
        ) : null}

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data · No booking is created or confirmed.
        </footer>
      </div>
    </div>
  );
}

export default App;

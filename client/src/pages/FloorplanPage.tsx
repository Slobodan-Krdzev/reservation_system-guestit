import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { FavoriteReservation } from "../types";

interface LayoutObject {
  Id: number;
  Name: string;
  Status?: string;
  PositionLeft: number;
  PositionTop: number;
  Width?: number;
  Height?: number;
  IsPremium?: boolean;
  Capacity?: number;
  Shape?: number;
  TableName?: string;
}

interface RemoteFloor {
  Id: number;
  FloorName: string;
  LayoutObjects: LayoutObject[];
}

interface PendingReservation {
  floorId: number;
  table: LayoutObject;
}

const defaultDate = new Date().toISOString().split("T")[0];
const REMOTE_LAYOUT_URL =
  "http://dev.revelapps.com:9096/api/v2/administration/layout/2";
const BLOCKED_SHAPES = new Set([22, 24, 25, 16, 17, 20, 12, 13, 14, 15, 18, 19]);
const MOBILE_BREAKPOINT = 768;

export const FloorplanPage = () => {
  const navigate = useNavigate();
  const [floorplans, setFloorplans] = useState<RemoteFloor[]>([]);
  const [selected, setSelected] = useState<PendingReservation | null>(null);
  const [form, setForm] = useState({
    date: defaultDate,
    timeSlot: "19:00",
    guests: 2,
    note: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const [reservationSent, setReservationSent] = useState(false);
  const successTimerRef = useRef<number | null>(null);
  const [ratios, setRatios] = useState(() => {
    const horizontalRatio = window.innerWidth / 1410;
    const verticalRatio = window.innerHeight / 900;
    const minRatio = Math.min(horizontalRatio, verticalRatio);
    return { horizontalRatio, verticalRatio, minRatio };
  });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const location = useLocation();

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    const now = new Date();
    const today = defaultDate;

    const workStartMinutes = 9 * 60; // 09:00
    const workEndMinutes = 23 * 60; // 23:00

    let startMinutes: number;
    if (form.date === today) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      // Start from the later of current time and 09:00
      startMinutes = Math.max(currentMinutes, workStartMinutes);
    } else {
      startMinutes = workStartMinutes;
    }

    if (startMinutes > workEndMinutes) {
      return [];
    }

    for (let mins = startMinutes; mins <= workEndMinutes; mins += 15) {
      const hour = Math.floor(mins / 60);
      const minute = mins % 60;
      const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0",
      )}`;
      options.push(label);
    }

    return options;
  }, [form.date]);

  useEffect(() => {
    const fetchFloorplans = async () => {
      try {
        const response = await fetch(REMOTE_LAYOUT_URL);
        const data = await response.json();
        const floors = Array.isArray(data) ? data : [];
        setFloorplans(floors);
        if (floors.length) {
          setActiveFloor(floors[0].Id);
        }
      } catch {
        setFloorplans([]);
      }
    };
    void fetchFloorplans();
  }, []);

  useEffect(() => {
    const updateMetrics = () => {
      const horizontalRatio = window.innerWidth / 1410;
      const verticalRatio = window.innerHeight / 900;
      const minRatio = Math.min(horizontalRatio, verticalRatio);
      setRatios({ horizontalRatio, verticalRatio, minRatio });
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // Ensure selected timeSlot is always one of the available options
  useEffect(() => {
    if (!timeOptions.length) return;
    if (!timeOptions.includes(form.timeSlot)) {
      const next = timeOptions[0];
      requestAnimationFrame(() => {
        setForm((prev) => ({ ...prev, timeSlot: next }));
      });
    }
  }, [timeOptions, form.timeSlot]);

  const handleReserve = async () => {
    if (!selected) return;
    try {
      await api.post("/reservations", {
        floorplanId: String(selected.floorId),
        tableId: String(selected.table.Id),
        tableName: selected.table.TableName ?? selected.table.Name ?? "",
        date: form.date,
        timeSlot: form.timeSlot,
        guests: form.guests,
        note: form.note.trim() || undefined,
      });
      setFeedback(null);
      setReservationSent(true);
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setReservationSent(false);
        setSelected(null);
        navigate("/account");
      }, 2000);
    } catch {
      setFeedback("Reservation failed. Try another slot.");
    }
  };

  const handleQuickBook = useCallback(
    (favorite: FavoriteReservation) => {
    const floorIndex = floorplans.findIndex(
      (floor) => String(floor.Id) === favorite.floorplanId,
    );
    if (floorIndex >= 0) {
      swiperRef?.slideTo(floorIndex);
      setActiveFloor(floorplans[floorIndex].Id);
    }
    const tableName = favorite.tableName || `Table ${favorite.tableId}`;
    const numericId = Number(favorite.tableId);
    const fallbackTable: LayoutObject = {
      Id: Number.isNaN(numericId) ? 0 : numericId,
      Name: tableName,
      TableName: tableName,
      Status: "free",
      Width: 80,
      Height: 80,
      PositionLeft: 0,
      PositionTop: 0,
      Capacity: undefined,
    };
      setSelected({
        floorId:
          floorIndex >= 0
            ? floorplans[floorIndex].Id
            : Number(favorite.floorplanId) || 0,
        table: fallbackTable,
      });
      setForm((prev) => ({
        ...prev,
        guests: prev.guests,
        timeSlot: favorite.lastTime || prev.timeSlot,
        date: favorite.lastDate || prev.date,
      }));
    },
    [floorplans, swiperRef],
  );

  useEffect(() => {
    const state = location.state as { quickBook?: FavoriteReservation } | null;
    const quick = state?.quickBook;
    if (quick && floorplans.length) {
      const frame = requestAnimationFrame(() => handleQuickBook(quick));
      navigate(location.pathname, { replace: true, state: null });
      return () => cancelAnimationFrame(frame);
    }
  }, [location.state, floorplans, handleQuickBook, navigate, location.pathname]);

  const renderTables = (floor: RemoteFloor) => {
    if (!floor.LayoutObjects?.length) {
      return null;
    }

    if (isMobile) {
      const visibleTables = floor.LayoutObjects.filter(
        (table) => !BLOCKED_SHAPES.has(Number(table.Shape)),
      );

      if (!visibleTables.length) {
        return (
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            No tables available on this floor.
          </div>
        );
      }

      return (
        <div className="grid h-full max-h-full grid-cols-2 gap-4 overflow-y-auto p-3 pb-8">
          {visibleTables.map((table) => {
            const status = table.Status?.toLowerCase() || "free";
            const premium = table.IsPremium;
            const isSelected =
              selected?.floorId === floor.Id && selected?.table.Id === table.Id;

            const baseStyle = (() => {
              if (status === "reserved") return "bg-gradient-to-b from-[#2f4254] to-[#0f1720] text-white";
              if (premium)
                return "bg-gradient-to-b from-[#f6d063] to-[#b8871b] text-slate-900 shadow-inner";
              return "bg-gradient-to-b from-[#c6c6c6] to-[#6f6f70] text-black shadow-[0_8px_20px_rgba(0,0,0,0.35)]";
            })();

            return (
              <button
                key={table.Id}
                disabled={status === "reserved"}
                className={`flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-white/10 px-2.5 py-3 text-[11px] font-semibold transition ${
                  status === "reserved"
                    ? "cursor-not-allowed opacity-60"
                    : "hover:ring-4 hover:ring-white/30"
                } ${baseStyle} ${isSelected ? "ring-4 ring-emerald-300" : ""}`}
                onClick={() => setSelected({ floorId: floor.Id, table })}
              >
                <span className="text-base font-bold">
                  {table.TableName ?? table.Name}
                </span>
                <span className="text-[11px] text-white/80">
                  {table.Capacity ? `${table.Capacity} seats` : "Capacity N/A"}
                </span>
                {premium && (
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Premium
                  </span>
                )}
                {status === "reserved" ? (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">
                    Reserved
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-[0.3em] text-black/60">
                    Free table
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    const paddingX = 6 * Math.max(ratios.horizontalRatio, 0.8);
    const paddingY = 6 * Math.max(ratios.verticalRatio, 0.8);
    const usableX = 100 - paddingX * 2;
    const usableY = 100 - paddingY * 2;
    const layoutBounds = floor.LayoutObjects.reduce(
      (acc, table) => {
        const width = table.Width || 80;
        const height = table.Height || 80;
        acc.minX = Math.min(acc.minX, table.PositionLeft);
        acc.minY = Math.min(acc.minY, table.PositionTop);
        acc.maxX = Math.max(acc.maxX, table.PositionLeft + width);
        acc.maxY = Math.max(acc.maxY, table.PositionTop + height);
        return acc;
      },
      {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      },
    );

    const sourceWidth = layoutBounds.maxX - layoutBounds.minX || 1;
    const sourceHeight = layoutBounds.maxY - layoutBounds.minY || 1;
    const scaleX = usableX / sourceWidth;
    const scaleY = usableY / sourceHeight;

    return floor.LayoutObjects.map((table) => {
      const width = (table.Width || 80) - 20;
      const height = (table.Height || 80) + 20;
      const isBlockedShape =
        table.Shape !== undefined && BLOCKED_SHAPES.has(Number(table.Shape));
      const sizeScale = isBlockedShape ? 0.7 : 0.9;
      const widthPercent = width * scaleX * sizeScale;
      const heightPercent = height * scaleY * sizeScale;
      const centerX = table.PositionLeft + width / 2 - layoutBounds.minX;
      const centerY = table.PositionTop + height / 2 - layoutBounds.minY;
      const leftPercent = paddingX + centerX * scaleX - widthPercent / 2;
      const topPercent = paddingY + centerY * scaleY - heightPercent / 2;

      const status = table.Status?.toLowerCase() || "free";
      const premium = table.IsPremium;
      const isSelected =
        selected?.floorId === floor.Id && selected?.table.Id === table.Id;

      const baseStyle = (() => {
        if (isBlockedShape) return "bg-[#3c3c3c]";
        if (status === "reserved") return "bg-gradient-to-b from-[#2f4254] to-[#0f1720] text-white";
        if (premium)
          return "bg-gradient-to-b from-[#f6d063] to-[#b8871b] text-slate-900 shadow-inner";
        return "bg-gradient-to-b from-[#c6c6c6] to-[#6f6f70] text-black shadow-[0_8px_20px_rgba(0,0,0,0.35)]";
      })();

      return (
        <button
          key={table.Id}
          style={{
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: `${widthPercent}%`,
            height: `${heightPercent}%`,
          }}
          disabled={status === "reserved" || isBlockedShape}
          className={`absolute flex flex-col items-center justify-center rounded-2xl border border-white/10 px-2 text-xs font-semibold transition ${
            status === "reserved"
              ? "cursor-not-allowed opacity-60"
              : isBlockedShape
                ? "cursor-not-allowed opacity-80"
              : "hover:ring-4 hover:ring-white/30"
          } ${baseStyle} ${isSelected ? "ring-4 ring-emerald-300" : ""}`}
          onClick={() => setSelected({ floorId: floor.Id, table })}
        >
          {!isBlockedShape && (
            <>
              <span
                className={`text-base font-bold ${
                  status === "free" ? "text-black" : "text-current"
                }`}
              >
                {table.TableName ?? table.Name}
              </span>
              {status === "free" ? (
                <span className="text-[0.6vw] uppercase tracking-tighter text-black/70">
                  Free Table
                </span>
              ) : (
                <>
                  <span className="text-[11px] text-white/80">
                    {table.Capacity ? `${table.Capacity} seats` : "Capacity N/A"}
                  </span>
                  {premium && (
                    <span className="text-[10px] uppercase tracking-[0.2em]">
                      Premium
                    </span>
                  )}
                  {status === "reserved" && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">
                      Reserved
                    </span>
                  )}
                </>
              )}
            </>
          )}
        </button>
      );
    });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-[#2a2a2f] to-[#0e0e12]">
      {/* Book again interface removed per request */}
      <div className="flex items-center gap-4 overflow-x-auto px-6 pt-4 pb-2 overflow-y-hidden text-xs uppercase tracking-[0.4em] text-white/40 md:justify-center">
        {floorplans.map((floor, index) => (
          <button
            key={floor.Id}
            onClick={() => swiperRef?.slideTo(index)}
            className={`pb-1 tracking-tighter ${
              activeFloor === floor.Id ? "border-b border-white text-white" : ""
            }`}
          >
            {floor.FloorName}
          </button>
        ))}
      </div>
      <Swiper
        className="h-full w-full p-4"
        onSwiper={(instance) => setSwiperRef(instance)}
        onSlideChange={(instance) =>
          setActiveFloor(floorplans[instance.activeIndex]?.Id ?? null)
        }
      >
        {floorplans.map((floorplan) => (
          <SwiperSlide key={floorplan.Id}>
            <div className="flex h-full flex-col gap-4">
              <div className="relative flex-1 min-h-0 rounded-3xl bg-gradient-to-br from-[#2a2a2f] to-[#0e0e12]">
                {renderTables(floorplan)}
               
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {selected &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm"
            onClick={() => {
              if (!reservationSent) {
                setSelected(null);
              }
            }}
          >
            {reservationSent ? (
              <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center text-white">
                <img src="/client.png" alt="Client logo" className="h-16 w-auto" />
                <p className="text-3xl font-semibold uppercase tracking-[0.4em]">
                  Reservation sent
                </p>
                <p className="text-base text-white/70">Redirecting to your account...</p>
              </div>
            ) : (
              <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center">
                <div className="hidden flex-1 flex-col items-center text-center text-white lg:flex">
                  <p className="text-sm uppercase tracking-[0.6em] text-white/60">
                    Reservation
                  </p>
                  <img
                    src="/client.png"
                    alt="Client logo"
                    className="mt-4 h-14 w-auto"
                  />
                  <p className="mt-6 text-3xl font-bold">
                    {selected.table.Status === "reserved"
                      ? "Manage your reservation"
                      : "Confirm your table"}
                  </p>
                </div>

                <div
                  className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#2e2f36]/95 p-5 text-white shadow-[0_25px_70px_rgba(0,0,0,0.65)] sm:max-h-[90vh] sm:overflow-y-auto"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="rounded-3xl bg-[#1f2024] p-4 text-center shadow-inner">
                    <div className="text-4xl font-bold sm:text-5xl">
                      {selected.table.TableName ?? selected.table.Name}
                    </div>
                    <p className="mt-2 text-lg text-white/80">
                      {selected.table.Status === "reserved" ? "You reserved" : "Free table"}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1 text-yellow-300">
                      {[...Array(selected.table.Capacity || 4)].map((_, index) => (
                        <span
                          key={`dot-${index}`}
                          className={`text-lg ${
                            index < form.guests ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          ●
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-white/60">
                      {selected.table.Capacity
                        ? `${selected.table.Capacity} seats · Floor ${selected.floorId}`
                        : `Floor ${selected.floorId}`}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="rounded-3xl bg-[#1f2024] p-4 shadow-inner">
                      <div className="grid grid-cols-1 gap-3 text-black sm:grid-cols-3">
                        <label className="flex flex-col gap-1 text-left text-[0.6rem] uppercase tracking-[0.25em] text-white/50">
                          <span>Date</span>
                          <input
                            type="date"
                            min={defaultDate}
                            className="date-no-year h-14 w-full rounded-2xl bg-white text-center px-3 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/40"
                            value={form.date}
                            onChange={(e) => {
                              const next = e.target.value;
                              // Ignore dates before today
                              if (next && next < defaultDate) return;
                              setForm((prev) => ({ ...prev, date: next || defaultDate }));
                            }}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-left text-[0.6rem] uppercase tracking-[0.25em] text-white/50">
                          <span>Time</span>
                          <select
                            className="h-14 w-full rounded-2xl bg-white px-3 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/40"
                            value={form.timeSlot}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, timeSlot: e.target.value }))
                            }
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1 text-left text-[0.6rem] uppercase tracking-[0.25em] text-white/50">
                          <span>Seats</span>
                          <input
                            type="number"
                            min={1}
                            max={selected?.table.Capacity ?? 10}
                            className="h-14 w-full rounded-2xl bg-white px-3 text-center text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/40"
                            value={form.guests}
                            onChange={(e) => {
                              const capacity = selected?.table.Capacity ?? 10;
                              const value = Number(e.target.value);
                              const clamped = Math.min(Math.max(1, value || 1), capacity);
                              setForm((prev) => ({ ...prev, guests: clamped }));
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#1f2024] p-4 shadow-inner">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                        Table note
                      </p>
                      <textarea
                        rows={2}
                        className="mt-3 w-full rounded-2xl bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                        placeholder="Add a note (optional)"
                        value={form.note}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, note: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleReserve}
                    className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#c3a35a] to-[#f1dd9b] py-3 text-base text-white transition hover:bg-[#c3a35a] font-bold uppercase tracking-tighter"
                  >
                    Send
                  </button>

                  {feedback && (
                    <p className="mt-4 text-center text-sm font-medium text-emerald-300">
                      {feedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
      {feedback && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow">
          {feedback}
        </div>
      )}
    </div>
  );
};

